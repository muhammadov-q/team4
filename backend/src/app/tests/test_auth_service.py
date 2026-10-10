from datetime import UTC, datetime, timedelta

import pytest

from app.auth.repository import (
    AuthSessionRepository,
    EmailAlreadyRegistered,
    UserRepository,
)
from app.auth.service import (
    ERROR_EMAIL,
    ERROR_PASSWORD,
    UNKNOWN_USER_HASH,
    AuthService,
    InvalidCredentials,
    InvalidSignUp,
    NotSignedIn,
    hash_token,
    passwords,
)

TTL = timedelta(days=7)
PASSWORD = "correct horse"


class FakeClock:
    def __init__(self) -> None:
        self.now = datetime(2026, 10, 7, 12, 0, tzinfo=UTC)

    def __call__(self) -> datetime:
        return self.now

    def advance(self, delta: timedelta) -> None:
        self.now += delta


@pytest.fixture
def clock():
    return FakeClock()


@pytest.fixture
def sessions(db):
    return AuthSessionRepository(db)


@pytest.fixture
def service(db, sessions, clock):
    return AuthService(UserRepository(db), sessions, clock=clock, ttl=TTL)


def test_sign_up_stores_a_lowercase_email_and_a_hashed_password(service):
    user, _ = service.sign_up("  Ada@Example.com ", PASSWORD)

    assert user.email == "ada@example.com"
    assert user.password_hash != PASSWORD
    assert passwords.verify(PASSWORD, user.password_hash)


def test_sign_up_keeps_trimmed_names(service):
    user, _ = service.sign_up("ada@example.com", PASSWORD, " Ada ", "Lovelace ")
    assert (user.first_name, user.last_name) == ("Ada", "Lovelace")


@pytest.mark.parametrize("name", [None, "", "   "])
def test_sign_up_treats_blank_names_as_not_given(service, name):
    user, _ = service.sign_up("ada@example.com", PASSWORD, name, name)
    assert (user.first_name, user.last_name) == (None, None)


def test_sign_up_signs_the_new_user_in(service):
    user, token = service.sign_up("ada@example.com", PASSWORD)
    assert service.current_user(token) == user


@pytest.mark.parametrize(
    "email", ["", "ada", "ada@", "@example.com", "ada@example", "a da@example.com"]
)
def test_sign_up_rejects_invalid_emails(service, email):
    with pytest.raises(InvalidSignUp, match=ERROR_EMAIL):
        service.sign_up(email, PASSWORD)


def test_sign_up_needs_eight_characters_of_password(service):
    with pytest.raises(InvalidSignUp, match=ERROR_PASSWORD):
        service.sign_up("ada@example.com", "1234567")
    service.sign_up("ada@example.com", "12345678")


def test_sign_up_rejects_an_email_in_use_whatever_its_case(service):
    service.sign_up("ada@example.com", PASSWORD)
    with pytest.raises(EmailAlreadyRegistered):
        service.sign_up("ADA@example.com", PASSWORD)


def test_sign_in_with_the_right_password_starts_a_new_session(service):
    user, first = service.sign_up("ada@example.com", PASSWORD)

    signed_in, second = service.sign_in(" ADA@example.com", PASSWORD)

    assert signed_in == user
    assert second != first
    assert service.current_user(first) == user
    assert service.current_user(second) == user


def test_sign_in_with_a_wrong_password_fails(service):
    service.sign_up("ada@example.com", PASSWORD)
    with pytest.raises(InvalidCredentials):
        service.sign_in("ada@example.com", "wrong horse")


def test_sign_in_with_an_unknown_email_fails_the_same_way(service):
    with pytest.raises(InvalidCredentials):
        service.sign_in("nobody@example.com", PASSWORD)


def test_sign_in_with_an_unknown_email_still_checks_a_password(service, monkeypatch):
    checked = []
    monkeypatch.setattr(
        passwords, "verify", lambda password, hash: checked.append(hash) or False
    )

    with pytest.raises(InvalidCredentials):
        service.sign_in("nobody@example.com", PASSWORD)

    assert checked == [UNKNOWN_USER_HASH]


def test_unknown_token_is_not_signed_in(service):
    with pytest.raises(NotSignedIn):
        service.current_user("made-up")


def test_session_ends_after_its_ttl(service, clock):
    _, token = service.sign_up("ada@example.com", PASSWORD)

    clock.advance(TTL - timedelta(seconds=1))
    service.current_user(token)

    clock.advance(timedelta(seconds=1))
    with pytest.raises(NotSignedIn):
        service.current_user(token)


def test_sign_out_ends_only_that_session(service):
    user, first = service.sign_up("ada@example.com", PASSWORD)
    _, second = service.sign_in("ada@example.com", PASSWORD)

    service.sign_out(first)
    service.sign_out(first)

    with pytest.raises(NotSignedIn):
        service.current_user(first)
    assert service.current_user(second) == user


def test_only_the_token_hash_is_stored(service, sessions):
    _, token = service.sign_up("ada@example.com", PASSWORD)

    assert sessions.get(token) is None
    assert sessions.get(hash_token(token)) is not None


def test_new_sessions_clear_out_expired_ones(service, sessions, clock):
    _, old = service.sign_up("ada@example.com", PASSWORD)
    clock.advance(TTL)

    service.sign_in("ada@example.com", PASSWORD)

    assert sessions.get(hash_token(old)) is None


def test_tokens_are_long_and_unique(service):
    service.sign_up("ada@example.com", PASSWORD)
    tokens = {service.sign_in("ada@example.com", PASSWORD)[1] for _ in range(20)}

    assert len(tokens) == 20
    assert all(len(t) >= 43 for t in tokens)
