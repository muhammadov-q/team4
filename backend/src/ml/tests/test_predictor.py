import pytest

from ml.predictor import AbstractPredictor, DigitResult, DummyPredictor


class MinimalPredictor(AbstractPredictor):
    @property
    def model_version(self):
        return ""

    def predict(self, image: bytes) -> list[DigitResult]:
        return []


# --- AbstractPredictor ------------------------------------------------------


def test_abstract_predictor_cannot_be_instantiated():
    with pytest.raises(TypeError):
        AbstractPredictor()


def test_subclass_without_predict_cannot_be_instantiated():
    class Incomplete(AbstractPredictor):
        @property
        def model_version(self):
            return ""

    with pytest.raises(TypeError):
        Incomplete()


def test_subclass_without_model_version_cannot_be_instantiated():
    class Incomplete(AbstractPredictor):
        def predict(self, image: bytes) -> list[DigitResult]:
            return []

    with pytest.raises(TypeError):
        Incomplete()


def test_minimal_subclass_works():
    predictor = MinimalPredictor()
    assert predictor.model_version == ""
    assert predictor.predict(b"img") == []


# --- DummyPredictor ---------------------------------------------------------


def test_dummy_predictor_is_an_abstract_predictor():
    assert isinstance(DummyPredictor(), AbstractPredictor)


def test_dummy_predictor_attributes():
    predictor = DummyPredictor()
    assert predictor.model_version == "mock"
    assert predictor.dummy == [2, 5, 0, 0, 0, 0]


@pytest.mark.parametrize(
    "image",
    [b"", b"hello", b"\x89PNG\r\n\x1a\n", bytes(10_000)],
)
def test_dummy_predictor_always_returns_dummy_digits(image):
    predictor = DummyPredictor()
    assert [r.digit for r in predictor.predict(image)] == predictor.dummy


def test_dummy_predictor_returns_a_list_of_digit_results():
    results = DummyPredictor().predict(b"img")
    assert isinstance(results, list)
    assert all(isinstance(r, DigitResult) for r in results)


def test_dummy_predictor_is_fully_confident():
    for r in DummyPredictor().predict(b"img"):
        assert r.probabilities == {r.digit: 1.0}


def test_dummy_predictor_boxes_have_four_values():
    for r in DummyPredictor().predict(b"img"):
        assert len(r.box) == 4


def test_dummy_predictor_returns_a_new_list_each_call():
    predictor = DummyPredictor()
    first = predictor.predict(b"img")
    first.clear()
    assert len(predictor.predict(b"img")) == len(predictor.dummy)