from pydantic import BaseModel

from ml import AbstractPredictor, create_predictor
from ml.predictor import DigitResult

predictor: AbstractPredictor = create_predictor()


def get_predictor() -> AbstractPredictor:
    return predictor


class BoxResponse(BaseModel):
    x: int
    y: int
    w: int
    h: int


class DigitResponse(BaseModel):
    digit: int
    probabilities: dict[int, float]
    box: BoxResponse

    @classmethod
    def of(cls, result: DigitResult) -> "DigitResponse":
        x, y, w, h = result.box
        return cls(
            digit=result.digit,
            probabilities=result.probabilities,
            box=BoxResponse(x=x, y=y, w=w, h=h),
        )
