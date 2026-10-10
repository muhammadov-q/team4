from datetime import UTC, datetime, timedelta

import pytest

from app.auth.models import AuthSession, User
from app.auth.repository import (
    AuthSessionRepository,
    EmailAlreadyRegistered,
    UserRepository,
)

NOW = datetime(2026, 10, 7, 12, 0, tzinfo=UTC)


@pytest.fixture
def users(db):
    return UserRepository(db)


@pytest.fixture
def sessions(db):
    return AuthSessionRepository(db)


def new_user(email: str = "ada@example.com") -> User:
    return User(email=email, password_hash="hash", created_at=NOW)


def new_session(user: User, token_hash: str, expires_at: datetime) -> AuthSession:
    return AuthSession(
        token_hash=token_hash, user_id=user.id, created_at=NOW, expires_at=expires_at
    )


def test_added_user_can_be_found_by_id_and_email(users):
    user = users.add(new_user())

    assert user.id is not None
    assert users.get(user.id) == user
    assert users.get_by_email("ada@example.com") == user


def test_names_are_optional(db, users):
    nameless = users.add(new_user())
    named = new_user("grace@example.com")
    named.first_name, named.last_name = "Grace", "Hopper"
    users.add(named)
    db.expire_all()

    assert (nameless.first_name, nameless.last_name) == (None, None)
    assert (named.first_name, named.last_name) == ("Grace", "Hopper")


def test_unknown_user_is_none(users):
    assert users.get(42) is None
    assert users.get_by_email("nobody@example.com") is None


def test_email_can_only_be_registered_once(users):
    users.add(new_user())

    with pytest.raises(EmailAlreadyRegistered):
        users.add(new_user())

    assert users.add(new_user("grace@example.com")).id is not None


def test_added_session_can_be_found_by_token_hash(users, sessions):
    user = users.add(new_user())
    session = sessions.add(new_session(user, "a" * 64, NOW + timedelta(days=7)))

    assert sessions.get("a" * 64) == session
    assert sessions.get("b" * 64) is None


def test_deleted_session_is_gone(users, sessions):
    user = users.add(new_user())
    sessions.add(new_session(user, "a" * 64, NOW + timedelta(days=7)))

    sessions.delete("a" * 64)
    sessions.delete("a" * 64)

    assert sessions.get("a" * 64) is None


def test_delete_expired_keeps_only_live_sessions(users, sessions):
    user = users.add(new_user())
    sessions.add(new_session(user, "a" * 64, NOW - timedelta(seconds=1)))
    sessions.add(new_session(user, "b" * 64, NOW))
    sessions.add(new_session(user, "c" * 64, NOW + timedelta(seconds=1)))

    sessions.delete_expired(NOW)

    assert sessions.get("a" * 64) is None
    assert sessions.get("b" * 64) is None
    assert sessions.get("c" * 64) is not None
