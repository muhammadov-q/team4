from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Prediction API", version="0.1.0")


class PredictRequest(BaseModel):
    dummy: str


class PredictResponse(BaseModel):
    prediction: float
    model_version: str


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest) -> PredictResponse:
    return PredictResponse(prediction=250_000.0, model_version="mock")