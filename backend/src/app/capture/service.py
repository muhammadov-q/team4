import secrets
from collections.abc import Callable
from dataclasses import replace
from datetime import UTC, datetime, timedelta

from app.capture.repository import CaptureSession, InMemoryCaptureSessionRepository

SESSION_TTL = timedelta(minutes=30)


class CaptureSessionNotFound(Exception):
    pass


class CaptureService:
    def __init__(
        self,
        repository: InMemoryCaptureSessionRepository,
        clock: Callable[[], datetime] = lambda: datetime.now(UTC),
        ttl: timedelta = SESSION_TTL,
    ) -> None:
        self._repository = repository
        self._clock = clock
        self._ttl = ttl

    def create(self) -> CaptureSession:
        now = self._clock()
        self._repository.delete_expired(now)
        session = CaptureSession(
            id=secrets.token_urlsafe(16), expires_at=now + self._ttl
        )
        self._repository.save(session)
        return session

    def get(self, session_id: str) -> CaptureSession:
        session = self._repository.get(session_id)
        if session is None or session.expires_at <= self._clock():
            raise CaptureSessionNotFound(session_id)
        return session

    def upload(
        self, session_id: str, image: bytes, content_type: str
    ) -> CaptureSession:
        current = self.get(session_id)
        session = replace(
            current,
            image=image,
            content_type=content_type,
            upload_count=current.upload_count + 1,
            expires_at=self._clock() + self._ttl,
        )
        self._repository.save(session)
        return session

    def image(self, session_id: str) -> tuple[bytes, str]:
        session = self.get(session_id)
        if session.image is None or session.content_type is None:
            raise CaptureSessionNotFound(session_id)
        return session.image, session.content_type

    def delete(self, session_id: str) -> None:
        self._repository.delete(session_id)
