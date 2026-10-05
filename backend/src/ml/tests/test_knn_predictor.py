import cv2
import numpy as np
import pytest

from ml.knn_predictor import MODEL_PATH, KnnPredictor

pytestmark = pytest.mark.skipif(
    not MODEL_PATH.exists(), reason="KNN model not trained (run train_knn.py)"
)


def ink_bounding_box(image: bytes) -> tuple[int, int, int, int]:
    """Bounding box of the dark pixels in the original image."""
    img = cv2.imdecode(np.frombuffer(image, np.uint8), cv2.IMREAD_GRAYSCALE)
    ys, xs = np.nonzero(img < 128)
    return xs.min(), ys.min(), xs.max() - xs.min() + 1, ys.max() - ys.min() + 1


def test_boxes_are_in_original_image_coordinates(digit_image):
    results = KnnPredictor().predict(digit_image)
    assert len(results) == 1

    x, y, w, h = results[0].box
    ex, ey, ew, eh = ink_bounding_box(digit_image)

    # The pipeline blurs and dilates before finding contours, so the box is a
    # few pixels larger than the ink. Without scaling back it would be ~5x off.
    tolerance = 4
    assert abs(x - ex) <= tolerance
    assert abs(y - ey) <= tolerance
    assert abs(w - ew) <= 2 * tolerance
    assert abs(h - eh) <= 2 * tolerance


def test_boxes_fit_inside_the_original_image(digit_image):
    img = cv2.imdecode(np.frombuffer(digit_image, np.uint8), cv2.IMREAD_GRAYSCALE)
    height, width = img.shape
    for r in KnnPredictor().predict(digit_image):
        x, y, w, h = r.box
        assert 0 <= x and 0 <= y
        assert x + w <= width and y + h <= height