from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class CaptureSession:
    id: str
    expires_at: datetime
    upload_count: int = 0
    image: bytes | None = None
    content_type: str | None = None


class InMemoryCaptureSessionRepository:
    def __init__(self) -> None:
        self._sessions: dict[str, CaptureSession] = {}

    def get(self, session_id: str) -> CaptureSession | None:
        return self._sessions.get(session_id)

    def save(self, session: CaptureSession) -> None:
        self._sessions[session.id] = session

    def delete(self, session_id: str) -> None:
        self._sessions.pop(session_id, None)

    def delete_expired(self, now: datetime) -> None:
        for session in list(self._sessions.values()):
            if session.expires_at <= now:
                del self._sessions[session.id]
