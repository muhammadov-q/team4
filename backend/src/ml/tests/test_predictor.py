import pytest

from ml.predictor import AbstractPredictor, DummyPredictor


class MinimalPredictor(AbstractPredictor):
    def predict(self, image: bytes) -> float:
        return 1.0


# --- AbstractPredictor ------------------------------------------------------


def test_abstract_predictor_cannot_be_instantiated():
    with pytest.raises(TypeError):
        AbstractPredictor()


def test_subclass_without_predict_cannot_be_instantiated():
    class Incomplete(AbstractPredictor):
        pass

    with pytest.raises(TypeError):
        Incomplete()


def test_subclass_inherits_default_attributes():
    predictor = MinimalPredictor()
    assert predictor.model == ""


# --- DummyPredictor ---------------------------------------------------------


def test_dummy_predictor_is_an_abstract_predictor():
    assert isinstance(DummyPredictor(), AbstractPredictor)


def test_dummy_predictor_attributes():
    predictor = DummyPredictor()
    assert predictor.model == "mock"
    assert predictor.dummy == 250_000.0


@pytest.mark.parametrize(
    "image",
    [b"", b"hello", b"\x89PNG\r\n\x1a\n", bytes(10_000)],
)
def test_dummy_predictor_always_returns_dummy_value(image):
    predictor = DummyPredictor()
    assert predictor.predict(image) == predictor.dummy


def test_dummy_predictor_returns_a_float():
    assert isinstance(DummyPredictor().predict(b"img"), float)
