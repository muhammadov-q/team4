import pytest
from fastapi.testclient import TestClient

from app.main import app, get_predictor
from ml.predictor import DummyPredictor


@pytest.fixture
def client():
    """Test client that always uses the DummyPredictor, whatever ML_PREDICTOR says."""
    app.dependency_overrides[get_predictor] = lambda: DummyPredictor()
    yield TestClient(app)
    app.dependency_overrides.clear()
