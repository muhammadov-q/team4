def upload(client, filename, content, content_type):
    return client.post("/predict", files={"image": (filename, content, content_type)})

def test_predict_with_image_returns_mock_values(client):
    response = upload(client, "test.png", b"fake png bytes", "image/png")
    assert response.status_code == 200
    assert response.json() == {"prediction": 250_000, "model_version": "mock"}


def test_predict_accepts_other_image_types(client):
    response = upload(client, "test.jpg", b"fake jpg bytes", "image/jpeg")
    assert response.status_code == 200


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