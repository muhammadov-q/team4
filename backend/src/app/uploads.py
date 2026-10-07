from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, HTTPException, UploadFile
from pydantic import BaseModel

ERROR_400 = "Empty file"
ERROR_413 = "File too large"
ERROR_415 = "File must be an image"

MAX_FILE_SIZE = 30 * 1024 * 1024  # 30MB


class ErrorResponse(BaseModel):
    detail: str


UPLOAD_ERRORS: dict[int | str, dict] = {
    400: {"model": ErrorResponse, "description": f"Bad request, {ERROR_400}"},
    413: {"model": ErrorResponse, "description": ERROR_413},
    415: {
        "model": ErrorResponse,
        "description": f"Unsupported media type, {ERROR_415}",
    },
}


@dataclass(frozen=True)
class ImageUpload:
    content: bytes
    content_type: str


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


async def capped_upload(image: UploadFile) -> ImageUpload:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail=ERROR_415)

    content = await read_capped(image, MAX_FILE_SIZE)

    if not content:
        raise HTTPException(status_code=400, detail=ERROR_400)

    return ImageUpload(content=content, content_type=image.content_type)


async def capped_image(upload: Annotated[ImageUpload, Depends(capped_upload)]) -> bytes:
    return upload.content
