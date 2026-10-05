import cv2
import joblib
import numpy as np
import pytest

from ml.knn_predictor import MODEL_PATH, KnnPredictor
from ml.predictor import AbstractPredictor, DigitResult


class FakeModel:
    """Mimics the sklearn pipeline: string classes like MNIST, fixed answer."""

    def __init__(self, answer: int = 7) -> None:
        self.classes_ = np.array([str(d) for d in range(10)])
        self.answer = answer
        self.calls = []

    def predict_proba(self, x):
        self.calls.append(x)
        probs = np.zeros((len(x), 10))
        probs[:, self.answer] = 1.0
        return probs


@pytest.fixture
def model():
    return FakeModel(answer=7)


@pytest.fixture
def predictor(model, monkeypatch):
    """KnnPredictor whose joblib.load returns the FakeModel, not a file."""
    monkeypatch.setattr("ml.knn_predictor.joblib.load", lambda path: model)
    return KnnPredictor()


pytestmark = pytest.mark.skipif(
    not MODEL_PATH.exists(), reason="KNN model not trained (run train_knn.py)"
)


def ink_bounding_box(image: bytes) -> tuple[int, int, int, int]:
    """Bounding box of the dark pixels in the original image."""
    img = cv2.imdecode(np.frombuffer(image, np.uint8), cv2.IMREAD_GRAYSCALE)
    ys, xs = np.nonzero(img < 128)
    return xs.min(), ys.min(), xs.max() - xs.min() + 1, ys.max() - ys.min() + 1


def encode_png(img: np.ndarray) -> bytes:
    ok, buffer = cv2.imencode(".png", img)
    assert ok
    return buffer.tobytes()


def contours_of(rectangles, size=(1000, 1000)):
    """Draw filled white rectangles (x, y, w, h) on black and return their contours."""
    img = np.zeros(size, dtype=np.uint8)
    for x, y, w, h in rectangles:
        cv2.rectangle(img, (x, y), (x + w - 1, y + h - 1), 255, thickness=-1)
    contours, _ = cv2.findContours(img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    return contours


# --- Construction -----------------------------------------------------------
def test_is_an_abstract_predictor(predictor):
    assert isinstance(predictor, AbstractPredictor)


def test_uses_the_given_model(predictor, model):
    assert predictor.model is model


def test_model_version(predictor):
    assert predictor.model_version == "KNN-100126"


# --- Bad images -------------------------------------------------------------


@pytest.mark.parametrize("image", [b"not an image", b"\x89PNG\r\n\x1a\n broken"])
def test_undecodable_image_raises(predictor, image):
    with pytest.raises(ValueError, match="Impossible to decode"):
        predictor.predict(image)


def test_blank_image_raises_no_numbers(predictor):
    blank = encode_png(np.full((100, 100), 255, dtype=np.uint8))
    with pytest.raises(ValueError, match="No numbers"):
        predictor.predict(blank)


def test_find_contours_on_empty_image_raises(predictor):
    with pytest.raises(ValueError, match="No numbers"):
        predictor.find_contours(np.zeros((50, 50), dtype=np.uint8))


# --- load_image_in_grayscale ------------------------------------------------


@pytest.mark.parametrize("width", [200, 1000, 3000])
def test_load_resizes_to_target_width_and_returns_scale(predictor, width):
    image = encode_png(np.full((100, width), 255, dtype=np.uint8))
    img, scale = predictor.load_image_in_grayscale(image)
    assert img.shape[1] == 1000
    assert scale == pytest.approx(1000 / width)


def test_load_converts_color_to_grayscale(predictor):
    image = encode_png(np.full((50, 50, 3), 255, dtype=np.uint8))
    img, _ = predictor.load_image_in_grayscale(image)
    assert img.ndim == 2


# --- find_bounding_boxes ----------------------------------------------------


def test_keeps_digit_shaped_boxes(predictor):
    boxes = predictor.find_bounding_boxes(contours_of([(100, 100, 60, 100)]))
    assert boxes == [(100, 100, 60, 100)]


def test_drops_boxes_below_min_area(predictor):
    boxes = predictor.find_bounding_boxes(contours_of([(100, 100, 10, 10)]))
    assert boxes == []


def test_drops_boxes_twice_as_wide_as_tall(predictor):
    boxes = predictor.find_bounding_boxes(contours_of([(100, 100, 200, 100)]))
    assert boxes == []


def test_sorts_left_to_right_within_a_line(predictor):
    rects = [(500, 100, 60, 100), (100, 110, 60, 100), (300, 105, 60, 100)]
    boxes = predictor.find_bounding_boxes(contours_of(rects))
    assert [b[0] for b in boxes] == [100, 300, 500]


def test_sorts_lines_top_to_bottom(predictor):
    rects = [(100, 400, 60, 100), (500, 100, 60, 100)]
    boxes = predictor.find_bounding_boxes(contours_of(rects))
    assert [(b[0], b[1]) for b in boxes] == [(500, 100), (100, 400)]


# --- to_mnist ---------------------------------------------------------------


def test_to_mnist_empty_crop_returns_black_28x28(predictor):
    out = predictor.to_mnist(np.zeros((40, 30), dtype=np.uint8))
    assert out.shape == (28, 28)
    assert out.dtype == np.uint8
    assert not out.any()


@pytest.mark.parametrize("shape", [(300, 100), (100, 80), (20, 15), (500, 499)])
def test_to_mnist_output_is_28x28_uint8(predictor, shape):
    crop = np.zeros(shape, dtype=np.uint8)
    crop[shape[0] // 4 : 3 * shape[0] // 4, shape[1] // 4 : 3 * shape[1] // 4] = 255
    out = predictor.to_mnist(crop)
    assert out.shape == (28, 28)
    assert out.dtype == np.uint8


def test_to_mnist_fits_the_digit_in_20x20(predictor):
    crop = np.zeros((300, 120), dtype=np.uint8)
    crop[50:250, 30:90] = 255  # 200 tall, 60 wide
    out = predictor.to_mnist(crop)
    ys, xs = np.nonzero(out)
    height = ys.max() - ys.min() + 1
    width = xs.max() - xs.min() + 1
    assert 19 <= height <= 21  # the longest side becomes ~20 px
    assert width < height  # aspect ratio is kept


def test_to_mnist_centers_the_mass(predictor):
    crop = np.zeros((200, 200), dtype=np.uint8)
    crop[10:60, 140:190] = 255  # ink in the top-right corner
    out = predictor.to_mnist(crop)
    m = cv2.moments(out)
    assert m["m10"] / m["m00"] == pytest.approx(14, abs=1)
    assert m["m01"] / m["m00"] == pytest.approx(14, abs=1)


def test_to_mnist_stroke_thickens_the_digit(predictor):
    crop = np.zeros((200, 200), dtype=np.uint8)
    cv2.circle(crop, (100, 100), 80, 255, thickness=3)  # a thin "0"
    thin = predictor.to_mnist(crop, stroke=0.0)
    thick = predictor.to_mnist(crop, stroke=0.08)
    assert int(thick.sum()) > int(thin.sum())


# --- predict_digit ----------------------------------------------------------


def test_predict_digit_returns_int_and_int_keys(predictor, model):
    pred, probs = predictor.predict_digit(np.zeros((28, 28), np.uint8), model)
    assert pred == 7
    assert set(probs) == set(range(10))
    assert probs[7] == 1.0


def test_predict_digit_sends_a_flat_784_vector(predictor, model):
    predictor.predict_digit(np.zeros((28, 28), np.uint8), model)
    assert model.calls[0].shape == (1, 784)


# --- to_original_coordinates ------------------------------------------------


def test_to_original_coordinates_divides_by_scale(predictor):
    assert predictor.to_original_coordinates((300, 290, 100, 150), 5.0) == (
        60,
        58,
        20,
        30,
    )


def test_to_original_coordinates_when_image_was_shrunk(predictor):
    assert predictor.to_original_coordinates((100, 50, 20, 40), 0.5) == (
        200,
        100,
        40,
        80,
    )


# --- predict (whole pipeline, fake model) -----------------------------------


def test_predict_returns_one_result_per_digit(predictor, digit_image):
    results = predictor.predict(digit_image)
    assert len(results) == 1
    assert isinstance(results[0], DigitResult)
    assert results[0].digit == 7


def test_predict_finds_several_digits_in_reading_order(predictor):
    img = np.full((200, 600), 255, dtype=np.uint8)
    for x in [40, 240, 440]:
        cv2.putText(img, "1", (x, 160), cv2.FONT_HERSHEY_SIMPLEX, 5, 0, 15)
    results = predictor.predict(encode_png(img))
    xs = [r.box[0] for r in results]
    assert len(results) == 3
    assert xs == sorted(xs)


def test_predict_boxes_are_in_original_image_coordinates(predictor, digit_image):
    (result,) = predictor.predict(digit_image)
    x, y, w, h = result.box
    ex, ey, ew, eh = ink_bounding_box(digit_image)

    # The pipeline blurs and dilates before finding contours, so the box is a
    # few pixels larger than the ink. Without scaling back it would be ~5x off.
    tolerance = 4
    assert abs(x - ex) <= tolerance
    assert abs(y - ey) <= tolerance
    assert abs(w - ew) <= 2 * tolerance
    assert abs(h - eh) <= 2 * tolerance


def test_predict_boxes_fit_inside_the_original_image(predictor, digit_image):
    img = cv2.imdecode(np.frombuffer(digit_image, np.uint8), cv2.IMREAD_GRAYSCALE)
    height, width = img.shape
    for r in predictor.predict(digit_image):
        x, y, w, h = r.box
        assert 0 <= x and 0 <= y
        assert x + w <= width and y + h <= height


# --- Real model (only when trained locally) ---------------------------------


@pytest.mark.skipif(not MODEL_PATH.exists(), reason="KNN model not trained")
def test_real_model_recognises_a_seven(digit_image):
    (result,) = KnnPredictor().predict(digit_image)
    assert result.digit == 7


# --- __init__ / model loading -----------------------------------------------


def test_init_loads_the_model_from_model_path(monkeypatch, model):
    loaded_paths = []

    def fake_load(path):
        loaded_paths.append(path)
        return model

    monkeypatch.setattr("ml.knn_predictor.joblib.load", fake_load)
    predictor = KnnPredictor()

    assert loaded_paths == [MODEL_PATH]
    assert predictor.model is model


def test_init_loads_a_real_joblib_file(monkeypatch, tmp_path):
    model_file = tmp_path / "knn.joblib"
    joblib.dump(FakeModel(answer=3), model_file)
    monkeypatch.setattr("ml.knn_predictor.MODEL_PATH", model_file)

    predictor = KnnPredictor()

    assert isinstance(predictor.model, FakeModel)
    assert predictor.model.answer == 3


def test_init_fails_when_model_file_is_missing(monkeypatch, tmp_path):
    monkeypatch.setattr("ml.knn_predictor.MODEL_PATH", tmp_path / "missing.joblib")
    with pytest.raises(FileNotFoundError):
        KnnPredictor()


def test_predict_uses_the_loaded_model(monkeypatch, tmp_path, digit_image):
    model_file = tmp_path / "knn.joblib"
    joblib.dump(FakeModel(answer=4), model_file)
    monkeypatch.setattr("ml.knn_predictor.MODEL_PATH", model_file)

    (result,) = KnnPredictor().predict(digit_image)

    assert result.digit == 4
    assert result.probabilities[4] == 1.0
