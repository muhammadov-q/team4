from datetime import UTC, datetime, timedelta

import pytest

from app.capture.repository import InMemoryCaptureSessionRepository
from app.capture.service import CaptureService, CaptureSessionNotFound

TTL = timedelta(minutes=30)


class FakeClock:
    def __init__(self) -> None:
        self.now = datetime(2026, 10, 6, 12, 0, tzinfo=UTC)

    def __call__(self) -> datetime:
        return self.now

    def advance(self, delta: timedelta) -> None:
        self.now += delta


@pytest.fixture
def clock():
    return FakeClock()


@pytest.fixture
def repository():
    return InMemoryCaptureSessionRepository()


@pytest.fixture
def service(repository, clock):
    return CaptureService(repository, clock=clock, ttl=TTL)


def test_new_session_has_no_uploads(service):
    session = service.create()
    assert session.upload_count == 0
    assert service.get(session.id) == session


def test_session_ids_are_long_and_unique(service):
    ids = {service.create().id for _ in range(50)}
    assert len(ids) == 50
    assert all(len(i) >= 22 for i in ids)


def test_unknown_session_is_not_found(service):
    with pytest.raises(CaptureSessionNotFound):
        service.get("nope")


def test_upload_replaces_the_photo_and_counts(service):
    session = service.create()
    service.upload(session.id, b"first", "image/png")
    updated = service.upload(session.id, b"second", "image/jpeg")

    assert updated.upload_count == 2
    assert service.image(session.id) == (b"second", "image/jpeg")


def test_image_is_not_found_before_the_first_upload(service):
    session = service.create()
    with pytest.raises(CaptureSessionNotFound):
        service.image(session.id)


def test_session_expires_after_the_ttl(service, clock):
    session = service.create()
    clock.advance(TTL)
    with pytest.raises(CaptureSessionNotFound):
        service.get(session.id)


def test_upload_keeps_the_session_alive(service, clock):
    session = service.create()
    clock.advance(TTL - timedelta(minutes=1))
    service.upload(session.id, b"photo", "image/png")
    clock.advance(TTL - timedelta(minutes=1))

    assert service.get(session.id).upload_count == 1


def test_upload_to_an_expired_session_fails(service, clock):
    session = service.create()
    clock.advance(TTL)
    with pytest.raises(CaptureSessionNotFound):
        service.upload(session.id, b"photo", "image/png")


def test_delete_removes_the_session(service):
    session = service.create()
    service.delete(session.id)
    with pytest.raises(CaptureSessionNotFound):
        service.get(session.id)


def test_delete_of_an_unknown_session_is_a_no_op(service):
    service.delete("nope")


def test_creating_a_session_drops_expired_ones(service, repository, clock):
    old = service.create()
    clock.advance(TTL)
    service.create()
    assert repository.get(old.id) is None
