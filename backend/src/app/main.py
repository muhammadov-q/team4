from typing import Annotated

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.params import Depends
from pydantic import BaseModel

from ml import AbstractPredictor, create_predictor

app = FastAPI(title="Prediction API", version="0.1.0")

predictor: AbstractPredictor = create_predictor()


def get_predictor() -> AbstractPredictor:
    return predictor


class PredictResponse(BaseModel):
    prediction: float
    model_version: str


@app.post("/predict", response_model=PredictResponse)
async def predict(
    predictor: Annotated[AbstractPredictor, Depends(get_predictor)],
    image: UploadFile = File(...),
) -> PredictResponse:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="File must be an image")

    content = await image.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    return PredictResponse(
        prediction=predictor.predict(content),
        model_version=predictor.model,
    )

