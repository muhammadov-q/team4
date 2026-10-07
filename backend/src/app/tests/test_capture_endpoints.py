import pytest
from fastapi.testclient import TestClient

from app.capture.repository import InMemoryCaptureSessionRepository
from app.capture.router import ERROR_404, get_capture_service
from app.capture.service import CaptureService
from app.main import app
from app.uploads import MAX_FILE_SIZE


@pytest.fixture
def client():
    service = CaptureService(InMemoryCaptureSessionRepository())
    app.dependency_overrides[get_capture_service] = lambda: service
    yield TestClient(app)
    app.dependency_overrides.clear()


def create(client) -> str:
    response = client.post("/capture-sessions")
    assert response.status_code == 201
    return response.json()["id"]


def upload(client, session_id, content=b"jpeg bytes", content_type="image/jpeg"):
    return client.put(
        f"/capture-sessions/{session_id}/image",
        files={"image": ("photo.jpg", content, content_type)},
    )


def test_create_returns_an_empty_session(client):
    response = client.post("/capture-sessions")
    assert response.status_code == 201
    body = response.json()
    assert set(body) == {"id", "upload_count"}
    assert body["upload_count"] == 0


def test_get_returns_the_session(client):
    session_id = create(client)
    response = client.get(f"/capture-sessions/{session_id}")
    assert response.status_code == 200
    assert response.json() == {"id": session_id, "upload_count": 0}


def test_upload_counts_and_returns_the_session(client):
    session_id = create(client)
    upload(client, session_id)
    response = upload(client, session_id)
    assert response.status_code == 200
    assert response.json() == {"id": session_id, "upload_count": 2}


def test_download_returns_the_latest_photo_as_uploaded(client):
    session_id = create(client)
    upload(client, session_id, b"first", "image/jpeg")
    upload(client, session_id, b"second", "image/png")

    response = client.get(f"/capture-sessions/{session_id}/image")
    assert response.status_code == 200
    assert response.content == b"second"
    assert response.headers["content-type"] == "image/png"
    assert response.headers["cache-control"] == "no-store"


def test_delete_ends_the_session(client):
    session_id = create(client)
    assert client.delete(f"/capture-sessions/{session_id}").status_code == 204
    assert client.get(f"/capture-sessions/{session_id}").status_code == 404


def test_unknown_session_is_404_with_a_readable_detail(client):
    response = client.get("/capture-sessions/unknown")
    assert response.status_code == 404
    assert response.json() == {"detail": ERROR_404}


def test_upload_to_an_unknown_session_is_404(client):
    assert upload(client, "unknown").status_code == 404


def test_download_before_any_upload_is_404(client):
    session_id = create(client)
    assert client.get(f"/capture-sessions/{session_id}/image").status_code == 404


def test_upload_rejects_a_non_image(client):
    session_id = create(client)
    assert upload(client, session_id, b"hello", "text/plain").status_code == 415


def test_upload_rejects_an_image_type_the_app_cannot_read(client):
    session_id = create(client)
    svg = b"<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>"
    response = upload(client, session_id, svg, "image/svg+xml")
    assert response.status_code == 415
    assert client.get(f"/capture-sessions/{session_id}").json()["upload_count"] == 0


def test_upload_rejects_an_empty_file(client):
    session_id = create(client)
    assert upload(client, session_id, b"", "image/png").status_code == 400


def test_upload_rejects_an_oversized_file(client):
    session_id = create(client)
    response = upload(client, session_id, b"x" * (MAX_FILE_SIZE + 1), "image/png")
    assert response.status_code == 413


def test_rejected_upload_does_not_count(client):
    session_id = create(client)
    upload(client, session_id, b"hello", "text/plain")
    assert client.get(f"/capture-sessions/{session_id}").json()["upload_count"] == 0
