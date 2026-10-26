import pytest
from fastapi.testclient import TestClient

from app.auth.router import ERROR_401
from app.main import app
from app.prediction import get_predictor
from app.recognitions.router import ERROR_404
from ml.predictor import AbstractPredictor, Prediction


class UnreadablePredictor(AbstractPredictor):
    @property
    def model_version(self) -> str:
        return "unreadable"

    def predict(self, image: bytes) -> list[Prediction]:
        raise ValueError("Impossible to decode image")


def sign_up(client, email="ada@example.com"):
    response = client.post(
        "/auth/sign-up", json={"email": email, "password": "correct horse"}
    )
    assert response.status_code == 201


def recognize(client, content=b"png bytes", content_type="image/png"):
    return client.post(
        "/recognitions", files={"image": ("folio-1r.png", content, content_type)}
    )


@pytest.fixture
def ada(client):
    sign_up(client)
    return client


def test_reading_a_page_saves_it_to_your_history(ada):
    response = recognize(ada)

    assert response.status_code == 201
    created = response.json()
    assert set(created) == {
        "id",
        "created_at",
        "filename",
        "model_version",
        "predictions",
    }
    assert created["filename"] == "folio-1r.png"
    assert created["model_version"] == "mock"
    assert [p["text"] for p in created["predictions"]] == ["2", "5", "0", "0", "0", "0"]
    assert created["predictions"][0]["probabilities"] == {"2": 1.0}
    assert created["created_at"].endswith("Z")

    assert ada.get("/recognitions").json() == [created]
    assert ada.get(f"/recognitions/{created['id']}").json() == created


def test_the_saved_page_comes_back_as_uploaded(ada):
    recognition_id = recognize(ada).json()["id"]

    response = ada.get(f"/recognitions/{recognition_id}/image")

    assert response.status_code == 200
    assert response.content == b"png bytes"
    assert response.headers["content-type"] == "image/png"
    assert response.headers["cache-control"] == "no-store"


@pytest.mark.parametrize(
    ("method", "path"),
    [
        ("POST", "/recognitions"),
        ("GET", "/recognitions"),
        ("GET", "/recognitions/1"),
        ("GET", "/recognitions/1/image"),
    ],
)
def test_history_needs_you_to_be_signed_in(client, method, path):
    response = client.request(method, path)

    assert response.status_code == 401
    assert response.json() == {"detail": ERROR_401}


def test_someone_elses_result_is_not_found(ada):
    recognition_id = recognize(ada).json()["id"]
    bob = TestClient(app)
    sign_up(bob, "bob@example.com")

    assert bob.get("/recognitions").json() == []
    for path in [
        f"/recognitions/{recognition_id}",
        f"/recognitions/{recognition_id}/image",
    ]:
        response = bob.get(path)
        assert response.status_code == 404
        assert response.json() == {"detail": ERROR_404}


@pytest.mark.parametrize(
    ("content", "content_type", "status"),
    [
        (b"hello", "text/plain", 415),
        (b"", "image/png", 400),
        (b"<svg><script>alert(1)</script></svg>", "image/svg+xml", 415),
    ],
)
def test_only_page_images_are_saved(ada, content, content_type, status):
    assert recognize(ada, content, content_type).status_code == status
    assert ada.get("/recognitions").json() == []


def test_a_page_the_model_cannot_read_is_422_and_not_saved(ada):
    app.dependency_overrides[get_predictor] = lambda: UnreadablePredictor()

    response = recognize(ada)

    assert response.status_code == 422
    assert response.json() == {"detail": "Impossible to decode image"}
    assert ada.get("/recognitions").json() == []
