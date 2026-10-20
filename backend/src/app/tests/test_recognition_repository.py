from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import delete, inspect

from app.auth.models import User
from app.recognitions.models import Recognition
from app.recognitions.repository import RecognitionRepository

NOON = datetime(2026, 10, 15, 12, 0, tzinfo=UTC)
PREDICTIONS = [
    {"digit": 7, "probabilities": {"7": 1.0}, "box": {"x": 1, "y": 2, "w": 3, "h": 4}}
]


@pytest.fixture
def ada(make_user):
    return make_user("ada@example.com")


@pytest.fixture
def bob(make_user):
    return make_user("bob@example.com")


@pytest.fixture
def repository(db):
    return RecognitionRepository(db)


def page(user_id, created_at=NOON):
    return Recognition(
        user_id=user_id,
        created_at=created_at,
        filename="1r.png",
        content_type="image/png",
        image=b"png bytes",
        model_version="mock",
        predictions=PREDICTIONS,
    )


def test_a_saved_result_reads_back_the_same(repository, db, ada):
    recognition = repository.add(page(ada))
    db.expire_all()

    saved = repository.get_for_user(ada, recognition.id)

    assert saved is not None
    assert saved.created_at == NOON
    assert saved.image == b"png bytes"
    assert saved.predictions == PREDICTIONS


def test_history_is_newest_first_and_only_yours(repository, ada, bob):
    first = repository.add(page(ada))
    second = repository.add(page(ada, NOON + timedelta(minutes=1)))
    repository.add(page(bob))

    assert [r.id for r in repository.list_for_user(ada)] == [second.id, first.id]


def test_results_from_the_same_moment_keep_their_order(repository, ada):
    first = repository.add(page(ada))
    second = repository.add(page(ada))

    assert [r.id for r in repository.list_for_user(ada)] == [second.id, first.id]


def test_someone_elses_result_is_not_found(repository, ada, bob):
    recognition = repository.add(page(ada))

    assert repository.get_for_user(bob, recognition.id) is None
    assert repository.get_for_user(ada, 999) is None


def test_history_leaves_the_images_in_the_database(repository, db, ada):
    repository.add(page(ada))
    db.expire_all()

    (recognition,) = repository.list_for_user(ada)

    assert "image" in inspect(recognition).unloaded


def test_deleting_a_user_deletes_their_results(repository, db, ada):
    repository.add(page(ada))

    db.execute(delete(User).where(User.id == ada))
    db.commit()

    assert repository.list_for_user(ada) == []
