import pytest
from fastapi.testclient import TestClient

from app.db import create_db_engine, create_session_factory, get_db, migrate
from app.main import app, get_predictor
from ml.predictor import DummyPredictor


@pytest.fixture
def client(engine):
    """Test client that always uses the DummyPredictor, whatever ML_PREDICTOR says."""
    session_factory = create_session_factory(engine)

    def test_db():
        with session_factory() as session:
            yield session

    app.dependency_overrides[get_predictor] = lambda: DummyPredictor()
    app.dependency_overrides[get_db] = test_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def engine(tmp_path):
    engine = create_db_engine(f"sqlite:///{tmp_path / 'test.db'}")
    migrate(engine)
    yield engine
    engine.dispose()


@pytest.fixture
def db(engine):
    with create_session_factory(engine)() as session:
        yield session
