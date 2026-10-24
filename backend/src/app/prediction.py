from pydantic import BaseModel

from ml import AbstractPredictor, create_predictor
from ml.predictor import Prediction

predictor: AbstractPredictor = create_predictor()


def get_predictor() -> AbstractPredictor:
    return predictor


class BoxResponse(BaseModel):
    x: int
    y: int
    w: int
    h: int


class PredictionItem(BaseModel):
    text: str
    probabilities: dict[str, float]
    box: BoxResponse

    @classmethod
    def of(cls, result: Prediction) -> "PredictionItem":
        x, y, w, h = result.box
        return cls(
            text=result.text,
            probabilities=result.probabilities,
            box=BoxResponse(x=x, y=y, w=w, h=h),
        )
