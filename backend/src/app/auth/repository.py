from datetime import datetime

from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.models import AuthSession, User


class EmailAlreadyRegistered(Exception):
    pass


class UserRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def add(self, user: User) -> User:
        self._session.add(user)
        try:
            self._session.commit()
        except IntegrityError as e:
            self._session.rollback()
            raise EmailAlreadyRegistered(user.email) from e
        return user

    def get(self, user_id: int) -> User | None:
        return self._session.get(User, user_id)

    def get_by_email(self, email: str) -> User | None:
        return self._session.scalar(select(User).where(User.email == email))


class AuthSessionRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def add(self, auth_session: AuthSession) -> AuthSession:
        self._session.add(auth_session)
        self._session.commit()
        return auth_session

    def get(self, token_hash: str) -> AuthSession | None:
        return self._session.get(AuthSession, token_hash)

    def delete(self, token_hash: str) -> None:
        self._session.execute(
            delete(AuthSession).where(AuthSession.token_hash == token_hash)
        )
        self._session.commit()

    def delete_expired(self, now: datetime) -> None:
        self._session.execute(delete(AuthSession).where(AuthSession.expires_at <= now))
        self._session.commit()
