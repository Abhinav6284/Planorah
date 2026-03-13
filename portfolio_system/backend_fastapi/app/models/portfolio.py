from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import BigInteger, Boolean, Date, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    portfolio: Mapped["Portfolio | None"] = relationship(back_populates="user", uselist=False)


class Portfolio(Base):
    __tablename__ = "portfolios"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200), default="")
    headline: Mapped[str] = mapped_column(String(240), default="")
    bio: Mapped[str] = mapped_column(Text, default="")
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    cover_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    visibility: Mapped[str] = mapped_column(String(20), default="public")
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    user: Mapped[User] = relationship(back_populates="portfolio")
    projects: Mapped[list["Project"]] = relationship(
        back_populates="portfolio",
        cascade="all, delete-orphan",
    )
    skills: Mapped[list["Skill"]] = relationship(
        back_populates="portfolio",
        cascade="all, delete-orphan",
    )
    certificates: Mapped[list["Certificate"]] = relationship(
        back_populates="portfolio",
        cascade="all, delete-orphan",
    )
    social_links: Mapped[list["SocialLink"]] = relationship(
        back_populates="portfolio",
        cascade="all, delete-orphan",
    )


class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(180))
    issuer: Mapped[str] = mapped_column(String(140), default="")
    issue_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    certificate_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    portfolio: Mapped[Portfolio] = relationship(back_populates="certificates")


class SocialLink(Base):
    __tablename__ = "social_links"
    __table_args__ = (UniqueConstraint("portfolio_id", "platform", name="uq_portfolio_social_platform"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"), index=True)
    platform: Mapped[str] = mapped_column(String(40))
    url: Mapped[str] = mapped_column(String(500))

    portfolio: Mapped[Portfolio] = relationship(back_populates="social_links")
