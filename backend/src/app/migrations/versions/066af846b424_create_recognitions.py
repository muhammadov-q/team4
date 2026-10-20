"""create recognitions

Revision ID: 066af846b424
Revises: a832661cbe3b
Create Date: 2026-10-15 15:56:55.214330

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "066af846b424"
down_revision: str | Sequence[str] | None = "a832661cbe3b"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "recognitions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("content_type", sa.String(length=100), nullable=False),
        sa.Column("image", sa.LargeBinary(), nullable=False),
        sa.Column("model_version", sa.String(length=100), nullable=False),
        sa.Column("predictions", sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_recognitions_user_id_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_recognitions")),
    )
    with op.batch_alter_table("recognitions", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_recognitions_user_id"), ["user_id"], unique=False
        )


def downgrade() -> None:
    with op.batch_alter_table("recognitions", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_recognitions_user_id"))

    op.drop_table("recognitions")
