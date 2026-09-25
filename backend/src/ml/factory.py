import os

from ml.predictor import AbstractPredictor, DummyPredictor

PREDICTORS: dict[str, type[AbstractPredictor]] = {
    "dummy": DummyPredictor,
}


def create_predictor(name: str | None = None) -> AbstractPredictor:
    """Build the predictor chosen by name, or by ML_PREDICTOR env var"""
    name = name or os.getenv("ML_PREDICTOR", "dummy")
    try:
        predictor_class = PREDICTORS[name]
    except KeyError:
        raise ValueError(
            f"Unknown predictor {name!r}. Available: {sorted(PREDICTORS)}"
        ) from None
    return predictor_class()
