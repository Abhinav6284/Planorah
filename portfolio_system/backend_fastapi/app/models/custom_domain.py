from __future__ import annotations

from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CustomDomain(Base):
    """Maps a user-owned domain name to their portfolio."""

    __tablename__ = "custom_domains"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # RFC 1035 max label + dots = 253 chars
    domain: Mapped[str] = mapped_column(String(253), unique=True, nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # back-reference so User.custom_domains works if needed
    user: Mapped["User"] = relationship("User", back_populates="custom_domains")  # type: ignore[name-defined]
