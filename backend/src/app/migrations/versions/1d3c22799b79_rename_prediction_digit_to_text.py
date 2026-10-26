"""rename prediction digit to text

Revision ID: 1d3c22799b79
Revises: 066af846b424
Create Date: 2026-10-26 09:45:28.536939

Saved predictions used {"digit": 7, ...}. They now use {"text": "7", ...}
so they match PredictionItem.

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "1d3c22799b79"
down_revision: str | Sequence[str] | None = "066af846b424"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


recognitions = sa.table(
    "recognitions",
    sa.column("id", sa.Integer),
    sa.column("predictions", sa.JSON),
)


def _digit_to_text(prediction: dict) -> dict:
    if "digit" not in prediction:
        return prediction  # already migrated
    new = dict(prediction)
    new["text"] = str(new.pop("digit"))
    new["probabilities"] = {
        str(k): v for k, v in new.get("probabilities", {}).items()
    }
    return new


def _text_to_digit(prediction: dict) -> dict:
    if "text" not in prediction:
        return prediction
    try:
        digit = int(prediction["text"])
    except ValueError:
        raise RuntimeError(
            f"Cannot downgrade: prediction {prediction['text']!r} is not a digit"
        ) from None
    new = dict(prediction)
    del new["text"]
    new["digit"] = digit
    return new


def _convert(convert) -> None:
    conn = op.get_bind()
    rows = conn.execute(
        sa.select(recognitions.c.id, recognitions.c.predictions)
    ).all()
    for row_id, predictions in rows:
        if not predictions:
            continue
        converted = [convert(p) for p in predictions]
        if converted != predictions:
            conn.execute(
                recognitions.update()
                .where(recognitions.c.id == row_id)
                .values(predictions=converted)
            )


def upgrade() -> None:
    _convert(_digit_to_text)


def downgrade() -> None:
    _convert(_text_to_digit)
