from app.main import MAX_FILE_SIZE, app, get_predictor
from ml.predictor import AbstractPredictor, DigitResult


class FailingPredictor(AbstractPredictor):
    """Simulates an image the model cannot read."""

    @property
    def model_version(self):
        return "failing"

    def predict(self, image: bytes) -> list[DigitResult]:
        raise ValueError("Impossible to decode image")


def upload(client, filename, content, content_type):
    return client.post("/predict", files={"image": (filename, content, content_type)})


# --- Successful predictions -------------------------------------------------


def test_predict_with_image_returns_mock_values(client):
    response = upload(client, "test.png", b"fake png bytes", "image/png")
    assert response.status_code == 200
    body = response.json()
    assert body["model_version"] == "mock"
    assert [p["digit"] for p in body["predictions"]] == [2, 5, 0, 0, 0, 0]


def test_predict_response_shape(client):
    response = upload(client, "test.png", b"fake png bytes", "image/png")
    first = response.json()["predictions"][0]
    assert set(first) == {"digit", "probabilities", "box"}
    assert set(first["box"]) == {"x", "y", "w", "h"}
    # JSON object keys are always strings
    assert first["probabilities"] == {"2": 1.0}


def test_predict_accepts_other_image_types(client):
    response = upload(client, "test.jpg", b"fake jpg bytes", "image/jpeg")
    assert response.status_code == 200


def test_predict_accepts_file_at_exact_size_limit(client):
    exact_content = b"x" * MAX_FILE_SIZE
    response = upload(client, "exact.png", exact_content, "image/png")
    assert response.status_code == 200


# --- Rejected requests ------------------------------------------------------


def test_predict_rejects_non_image(client):
    response = upload(client, "notes.txt", b"hello", "text/plain")
    assert response.status_code == 415


def test_predict_rejects_empty_file(client):
    response = upload(client, "empty.png", b"", "image/png")
    assert response.status_code == 400


def test_predict_requires_a_file(client):
    assert client.post("/predict").status_code == 422


def test_predict_requires_post(client):
    assert client.get("/predict").status_code == 405


def test_predict_rejects_oversized_file(client):
    oversized_content = b"x" * (MAX_FILE_SIZE + 1)
    response = upload(client, "big.png", oversized_content, "image/png")
    assert response.status_code == 413


def test_predict_rejects_missing_content_type(client):
    response = upload(client, "test.png", b"fake png bytes", "")
    assert response.status_code == 415


def test_predict_error_response_has_detail_field(client):
    response = upload(client, "notes.txt", b"hello", "text/plain")
    assert "detail" in response.json()


def test_predict_rejects_non_image_with_image_extension(client):
    # content-type says text, even though the filename looks like an image
    response = upload(client, "fake.png", b"hello", "text/plain")
    assert response.status_code == 415


def test_predict_rejects_octet_stream(client):
    response = upload(client, "test.bin", b"binary data", "application/octet-stream")
    assert response.status_code == 415


def test_predict_returns_422_when_model_cannot_read_image(client):
    app.dependency_overrides[get_predictor] = lambda: FailingPredictor()
    response = upload(client, "broken.png", b"not really a png", "image/png")
    assert response.status_code == 422
    assert response.json()["detail"] == "Impossible to decode image"
