from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.capture.repository import CaptureSession, InMemoryCaptureSessionRepository
from app.capture.service import CaptureService
from app.uploads import UPLOAD_ERRORS, ErrorResponse, ImageUpload, capped_upload

ERROR_404 = "This phone link no longer works. Make a new one on your computer."
ERROR_415 = "Send a JPG, PNG or TIFF photo."

CAPTURE_TYPES = {"image/jpeg", "image/png", "image/tiff"}

NOT_FOUND: dict[int | str, dict] = {
    404: {"model": ErrorResponse, "description": "Session expired or unknown"}
}

router = APIRouter(prefix="/capture-sessions", tags=["capture"])

capture_service = CaptureService(InMemoryCaptureSessionRepository())


def get_capture_service() -> CaptureService:
    return capture_service


Service = Annotated[CaptureService, Depends(get_capture_service)]


class CaptureSessionResponse(BaseModel):
    id: str
    upload_count: int

    @classmethod
    def of(cls, session: CaptureSession) -> "CaptureSessionResponse":
        return cls(id=session.id, upload_count=session.upload_count)


async def capture_session_not_found(_request: Request, _exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": ERROR_404})


@router.post("", status_code=201)
async def create_capture_session(service: Service) -> CaptureSessionResponse:
    return CaptureSessionResponse.of(service.create())


@router.get("/{session_id}", responses=NOT_FOUND)
async def get_capture_session(
    session_id: str, service: Service
) -> CaptureSessionResponse:
    return CaptureSessionResponse.of(service.get(session_id))


@router.put("/{session_id}/image", responses={**NOT_FOUND, **UPLOAD_ERRORS})
async def upload_capture_image(
    session_id: str,
    service: Service,
    upload: Annotated[ImageUpload, Depends(capped_upload)],
) -> CaptureSessionResponse:
    if upload.content_type not in CAPTURE_TYPES:
        raise HTTPException(status_code=415, detail=ERROR_415)
    session = service.upload(session_id, upload.content, upload.content_type)
    return CaptureSessionResponse.of(session)


@router.get(
    "/{session_id}/image",
    response_class=Response,
    responses={
        200: {
            "description": "The latest photo, as uploaded",
            "content": {"image/*": {"schema": {"type": "string", "format": "binary"}}},
        },
        **NOT_FOUND,
    },
)
async def download_capture_image(session_id: str, service: Service) -> Response:
    image, content_type = service.image(session_id)
    return Response(
        content=image, media_type=content_type, headers={"Cache-Control": "no-store"}
    )


@router.delete("/{session_id}", status_code=204)
async def delete_capture_session(session_id: str, service: Service) -> None:
    service.delete(session_id)
