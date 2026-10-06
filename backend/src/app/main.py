from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool

from app.capture.router import capture_session_not_found
from app.capture.router import router as capture_router
from app.capture.service import CaptureSessionNotFound
from app.uploads import UPLOAD_ERRORS, capped_image
from ml import AbstractPredictor, create_predictor

app = FastAPI(title="Prediction API", version="0.1.0")
app.include_router(capture_router)
app.add_exception_handler(CaptureSessionNotFound, capture_session_not_found)

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


class PredictResponse(BaseModel):
    predictions: list[DigitResponse]
    model_version: str


@app.post(
    "/predict",
    response_model=PredictResponse,
    responses=UPLOAD_ERRORS,
)
async def predict(
    predictor: Annotated[AbstractPredictor, Depends(get_predictor)],
    content: Annotated[bytes, Depends(capped_image)],
) -> PredictResponse:
    try:
        results = await run_in_threadpool(predictor.predict, content)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e

    return PredictResponse(
        predictions=[
            DigitResponse(
                digit=d.digit,
                probabilities=d.probabilities,
                box=BoxResponse(x=d.box[0], y=d.box[1], w=d.box[2], h=d.box[3]),
            )
            for d in results
        ],
        model_version=predictor.model_version,
    )
