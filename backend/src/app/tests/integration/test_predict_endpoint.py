import pytest


def test_predict_returns_mock_values(client):
    response = client.post("/predict", json={"dummy": "hello"})
    assert response.status_code == 200
    assert response.json() == {"prediction": 250_000, "model_version": "mock"}


@pytest.mark.parametrize(
    "payload",
    [
        {},                 # dummy is missing
        {"dummy": 123},     # dummy is not a string
        {"dummy": None},    # dummy is null
    ],
)
def test_predict_rejects_invalid_input(client, payload):
    response = client.post("/predict", json=payload)
    assert response.status_code == 422


def test_predict_requires_post(client):
    assert client.get("/predict").status_code == 405