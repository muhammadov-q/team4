from sqlalchemy import select
from sqlalchemy.orm import Session

from app.recognitions.models import Recognition


class RecognitionRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def add(self, recognition: Recognition) -> Recognition:
        self._session.add(recognition)
        self._session.commit()
        return recognition

    def list_for_user(self, user_id: int) -> list[Recognition]:
        query = (
            select(Recognition)
            .where(Recognition.user_id == user_id)
            .order_by(Recognition.created_at.desc(), Recognition.id.desc())
        )
        return list(self._session.scalars(query))

    def get_for_user(self, user_id: int, recognition_id: int) -> Recognition | None:
        return self._session.scalar(
            select(Recognition).where(
                Recognition.id == recognition_id, Recognition.user_id == user_id
            )
        )
