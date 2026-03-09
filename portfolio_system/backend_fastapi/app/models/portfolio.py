from datetime import datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Portfolio(Base):
    __tablename__ = "portfolios"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(index=True, unique=True)
    slug: Mapped[str] = mapped_column(String(120), index=True, unique=True)
    title: Mapped[str] = mapped_column(String(200), default="")
    headline: Mapped[str] = mapped_column(String(240), default="")
    bio: Mapped[str] = mapped_column(Text, default="")
    profile_image_key: Mapped[str | None] = mapped_column(String(300), nullable=True)
    cover_image_key: Mapped[str | None] = mapped_column(String(300), nullable=True)
    visibility: Mapped[str] = mapped_column(String(20), default="public")
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    settings: Mapped["PortfolioSettings"] = relationship(back_populates="portfolio", uselist=False)
    projects: Mapped[list["Project"]] = relationship(back_populates="portfolio")
    skills: Mapped[list["PortfolioSkill"]] = relationship(back_populates="portfolio")
    certificates: Mapped[list["Certificate"]] = relationship(back_populates="portfolio")
    social_links: Mapped[list["SocialLink"]] = relationship(back_populates="portfolio")


class PortfolioSettings(Base):
    __tablename__ = "portfolio_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id"), unique=True)
    allow_contact: Mapped[bool] = mapped_column(Boolean, default=True)
    theme_key: Mapped[str] = mapped_column(String(80), default="minimal")
    accent_color: Mapped[str] = mapped_column(String(20), default="#4f46e5")
    seo_title: Mapped[str] = mapped_column(String(140), default="")
    seo_description: Mapped[str] = mapped_column(String(240), default="")
    extras: Mapped[dict] = mapped_column(JSONB, default=dict)

    portfolio: Mapped[Portfolio] = relationship(back_populates="settings")


class PortfolioSection(Base):
    __tablename__ = "portfolio_sections"
    __table_args__ = (
        UniqueConstraint("portfolio_id", "section_key", name="uq_portfolio_section_key"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id"), index=True)
    section_key: Mapped[str] = mapped_column(String(60))
    title: Mapped[str] = mapped_column(String(120), default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    config: Mapped[dict] = mapped_column(JSONB, default=dict)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id"), index=True)
    title: Mapped[str] = mapped_column(String(160))
    short_description: Mapped[str] = mapped_column(String(280), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    github_url: Mapped[str | None] = mapped_column(String(300), nullable=True)
    live_url: Mapped[str | None] = mapped_column(String(300), nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    portfolio: Mapped[Portfolio] = relationship(back_populates="projects")
    images: Mapped[list["ProjectImage"]] = relationship(back_populates="project")
    technologies: Mapped[list["ProjectTechnology"]] = relationship(back_populates="project")


class ProjectImage(Base):
    __tablename__ = "project_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    image_key: Mapped[str] = mapped_column(String(300))
    alt_text: Mapped[str] = mapped_column(String(200), default="")
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    project: Mapped[Project] = relationship(back_populates="images")


class Technology(Base):
    __tablename__ = "technologies"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True)


class ProjectTechnology(Base):
    __tablename__ = "project_technologies"
    __table_args__ = (
        UniqueConstraint("project_id", "technology_id", name="uq_project_technology"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    technology_id: Mapped[int] = mapped_column(ForeignKey("technologies.id"), index=True)

    project: Mapped[Project] = relationship(back_populates="technologies")
    technology: Mapped[Technology] = relationship()


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)
    category: Mapped[str] = mapped_column(String(80), default="general")


class PortfolioSkill(Base):
    __tablename__ = "portfolio_skills"
    __table_args__ = (
        UniqueConstraint("portfolio_id", "skill_id", name="uq_portfolio_skill"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id"), index=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"), index=True)
    level: Mapped[str] = mapped_column(String(30), default="intermediate")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    portfolio: Mapped[Portfolio] = relationship(back_populates="skills")
    skill: Mapped[Skill] = relationship()


class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[int] = mapped_column(primary_key=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id"), index=True)
    title: Mapped[str] = mapped_column(String(180))
    issuer: Mapped[str] = mapped_column(String(140), default="")
    issue_date: Mapped[Date | None] = mapped_column(nullable=True)
    certificate_image_key: Mapped[str | None] = mapped_column(String(300), nullable=True)
    certificate_url: Mapped[str | None] = mapped_column(String(300), nullable=True)

    portfolio: Mapped[Portfolio] = relationship(back_populates="certificates")


class SocialLink(Base):
    __tablename__ = "social_links"
    __table_args__ = (
        UniqueConstraint("portfolio_id", "platform", name="uq_portfolio_platform"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id"), index=True)
    platform: Mapped[str] = mapped_column(String(40))
    url: Mapped[str] = mapped_column(String(300))

    portfolio: Mapped[Portfolio] = relationship(back_populates="social_links")


class PortfolioViewEvent(Base):
    __tablename__ = "portfolio_view_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id"), index=True)
    event_type: Mapped[str] = mapped_column(String(40), index=True)
    session_id: Mapped[str | None] = mapped_column(String(120), nullable=True)
    referrer: Mapped[str | None] = mapped_column(String(300), nullable=True)
    metadata: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
