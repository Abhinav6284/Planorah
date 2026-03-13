from __future__ import annotations

from sqlalchemy import BigInteger, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    category: Mapped[str] = mapped_column(String(80), default="general")
    level: Mapped[str] = mapped_column(String(30), default="intermediate")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    portfolio: Mapped["Portfolio"] = relationship(back_populates="skills")
