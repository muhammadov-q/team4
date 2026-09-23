from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel

app = FastAPI(title="Prediction API", version="0.1.0")


class PredictRequest(BaseModel):
    dummy: str


class PredictResponse(BaseModel):
    prediction: float
    model_version: str


@app.post("/predict", response_model=PredictResponse)
async def predict(image: UploadFile = File(...)) -> PredictResponse:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="File must be an image")

    content = await image.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")
    return PredictResponse(prediction=250_000.0, model_version="mock")