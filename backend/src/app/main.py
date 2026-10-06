from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, UploadFile
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool

from ml import AbstractPredictor, create_predictor

ERROR_400 = "Empty file"
ERROR_413 = "File too large"
ERROR_415 = "File must be an image"

MAX_FILE_SIZE = 30 * 1024 * 1024  # 30MB


async def read_capped(upload: UploadFile, max_size: int) -> bytes:
    chunks = []
    total = 0
    while chunk := await upload.read(1024 * 1024):  # 1 MB at a time
        total += len(chunk)
        if total > max_size:
            raise HTTPException(
                status_code=413,
                detail=f"{ERROR_413}. Max size is {max_size // (1024 * 1024)} MB.",
            )
        chunks.append(chunk)
    return b"".join(chunks)


async def capped_image(image: UploadFile) -> bytes:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail=ERROR_415)

    content = await read_capped(image, MAX_FILE_SIZE)

    if not content:
        raise HTTPException(status_code=400, detail=ERROR_400)

    return content


app = FastAPI(title="Prediction API", version="0.1.0")

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


class ErrorResponse(BaseModel):
    detail: str


@app.post(
    "/predict",
    response_model=PredictResponse,
    responses={
        400: {"model": ErrorResponse, "description": f"Bad request, {ERROR_400}"},
        413: {"model": ErrorResponse, "description": ERROR_413},
        415: {
            "model": ErrorResponse,
            "description": f"Unsupported media type, {ERROR_415}",
        },
    },
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
