import hashlib
import re
import secrets
from collections.abc import Callable
from datetime import UTC, datetime, timedelta

from pwdlib import PasswordHash

from app.auth.models import AuthSession, User
from app.auth.repository import AuthSessionRepository, UserRepository

SESSION_TTL = timedelta(days=7)
MIN_PASSWORD_LENGTH = 8

ERROR_EMAIL = "Enter a valid email address."
ERROR_PASSWORD = f"Use at least {MIN_PASSWORD_LENGTH} characters for your password."

EMAIL_PATTERN = re.compile(r"[^@\s]+@[^@\s]+\.[^@\s]+")

passwords = PasswordHash.recommended()
# Verified against for unknown emails, so they take as long as a wrong password.
UNKNOWN_USER_HASH = passwords.hash(secrets.token_urlsafe(32))


class InvalidSignUp(Exception):
    pass


class InvalidCredentials(Exception):
    pass


class NotSignedIn(Exception):
    pass


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def normalize_email(email: str) -> str:
    return email.strip().lower()


def clean_name(name: str | None) -> str | None:
    return (name or "").strip() or None


class AuthService:
    def __init__(
        self,
        users: UserRepository,
        sessions: AuthSessionRepository,
        clock: Callable[[], datetime] = lambda: datetime.now(UTC),
        ttl: timedelta = SESSION_TTL,
    ) -> None:
        self._users = users
        self._sessions = sessions
        self._clock = clock
        self._ttl = ttl

    def sign_up(
        self,
        email: str,
        password: str,
        first_name: str | None = None,
        last_name: str | None = None,
    ) -> tuple[User, str]:
        email = normalize_email(email)
        if not EMAIL_PATTERN.fullmatch(email):
            raise InvalidSignUp(ERROR_EMAIL)
        if len(password) < MIN_PASSWORD_LENGTH:
            raise InvalidSignUp(ERROR_PASSWORD)

        user = self._users.add(
            User(
                email=email,
                first_name=clean_name(first_name),
                last_name=clean_name(last_name),
                password_hash=passwords.hash(password),
                created_at=self._clock(),
            )
        )
        return user, self._start_session(user)

    def sign_in(self, email: str, password: str) -> tuple[User, str]:
        user = self._users.get_by_email(normalize_email(email))
        if user is None:
            passwords.verify(password, UNKNOWN_USER_HASH)
            raise InvalidCredentials
        if not passwords.verify(password, user.password_hash):
            raise InvalidCredentials
        return user, self._start_session(user)

    def current_user(self, token: str) -> User:
        session = self._sessions.get(hash_token(token))
        user = None
        if session is not None and session.expires_at > self._clock():
            user = self._users.get(session.user_id)
        if user is None:
            raise NotSignedIn
        return user

    def sign_out(self, token: str) -> None:
        self._sessions.delete(hash_token(token))

    def _start_session(self, user: User) -> str:
        now = self._clock()
        self._sessions.delete_expired(now)
        token = secrets.token_urlsafe(32)
        self._sessions.add(
            AuthSession(
                token_hash=hash_token(token),
                user_id=user.id,
                created_at=now,
                expires_at=now + self._ttl,
            )
        )
        return token
