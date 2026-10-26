from dataclasses import asdict

from pydantic import BaseModel, ConfigDict

from ml import AbstractPredictor, create_predictor
from ml.predictor import Prediction
from ml.translating_predictor import TranslatingPredictor
from ml.translator import GlossaryTranslator

predictor: AbstractPredictor = TranslatingPredictor(
    create_predictor(), GlossaryTranslator()
)


def get_predictor() -> AbstractPredictor:
    return predictor


class BoxResponse(BaseModel):
    x: int
    y: int
    w: int
    h: int


class GlossResponse(BaseModel):
    lemma: str
    translation: str
    definition: str


class PredictionItem(BaseModel):
    # The defaults are for old saved results; every response has the fields
    model_config = ConfigDict(json_schema_serialization_defaults_required=True)

    text: str
    probabilities: dict[str, float]
    box: BoxResponse
    line: int = 0
    gloss: GlossResponse | None = None

    @classmethod
    def of(cls, result: Prediction) -> "PredictionItem":
        x, y, w, h = result.box
        return cls(
            text=result.text,
            probabilities=result.probabilities,
            box=BoxResponse(x=x, y=y, w=w, h=h),
            line=result.line,
            gloss=None
            if result.gloss is None
            else GlossResponse(**asdict(result.gloss)),
        )
