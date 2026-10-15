from datetime import datetime
from typing import Any

from sqlalchemy import JSON, ForeignKey, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Recognition(Base):
    __tablename__ = "recognitions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    created_at: Mapped[datetime]
    filename: Mapped[str] = mapped_column(String(255))
    content_type: Mapped[str] = mapped_column(String(100))
    image: Mapped[bytes] = mapped_column(LargeBinary, deferred=True)
    model_version: Mapped[str] = mapped_column(String(100))
    predictions: Mapped[list[dict[str, Any]]] = mapped_column(JSON)
