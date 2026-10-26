import json

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import text

from app.db import MIGRATIONS_DIR, create_db_engine, create_session_factory
from app.recognitions.models import Recognition
from app.recognitions.router import RecognitionResponse

BEFORE_TEXT = "066af846b424"
TEXT = "1d3c22799b79"
BOX = {"x": 1, "y": 2, "w": 3, "h": 4}


def run(engine, step, revision):
    config = Config()
    config.set_main_option("script_location", str(MIGRATIONS_DIR))
    with engine.begin() as connection:
        config.attributes["connection"] = connection
        step(config, revision)


def save(engine, predictions):
    with engine.begin() as connection:
        connection.execute(
            text(
                "INSERT INTO users (id, email, password_hash, created_at)"
                " VALUES (1, 'ada@example.com', 'x', '2026-10-15 12:00:00')"
            )
        )
        connection.execute(
            text(
                "INSERT INTO recognitions (user_id, created_at, filename,"
                " content_type, image, model_version, predictions) VALUES (1,"
                " '2026-10-15 12:00:00', '1r.png', 'image/png', x'00', 'mock', :p)"
            ),
            {"p": json.dumps(predictions)},
        )


def saved_predictions(engine):
    with engine.connect() as connection:
        raw = connection.execute(text("SELECT predictions FROM recognitions")).scalar()
    return json.loads(raw)


@pytest.fixture
def old_engine(tmp_path):
    engine = create_db_engine(f"sqlite:///{tmp_path / 'old.db'}")
    run(engine, command.upgrade, BEFORE_TEXT)
    yield engine
    engine.dispose()


def test_saved_digits_become_text(old_engine):
    save(old_engine, [{"digit": 7, "probabilities": {"7": 0.9}, "box": BOX}])

    run(old_engine, command.upgrade, TEXT)

    assert saved_predictions(old_engine) == [
        {"text": "7", "probabilities": {"7": 0.9}, "box": BOX}
    ]


def test_the_history_can_read_an_old_result_after_the_upgrade(old_engine):
    save(old_engine, [{"digit": 7, "probabilities": {"7": 0.9}, "box": BOX}])

    run(old_engine, command.upgrade, TEXT)

    with create_session_factory(old_engine)() as session:
        recognition = session.query(Recognition).one()
        (prediction,) = RecognitionResponse.of(recognition).predictions
    assert (prediction.text, prediction.line, prediction.gloss) == ("7", 0, None)


def test_downgrade_turns_digit_text_back(old_engine):
    run(old_engine, command.upgrade, TEXT)
    save(old_engine, [{"text": "7", "probabilities": {"7": 0.9}, "box": BOX}])

    run(old_engine, command.downgrade, BEFORE_TEXT)

    assert saved_predictions(old_engine) == [
        {"digit": 7, "probabilities": {"7": 0.9}, "box": BOX}
    ]


def test_downgrade_stops_at_a_word_that_is_not_a_digit(old_engine):
    run(old_engine, command.upgrade, TEXT)
    save(old_engine, [{"text": "καὶ", "probabilities": {"καὶ": 1.0}, "box": BOX}])

    with pytest.raises(RuntimeError, match="not a digit"):
        run(old_engine, command.downgrade, BEFORE_TEXT)
