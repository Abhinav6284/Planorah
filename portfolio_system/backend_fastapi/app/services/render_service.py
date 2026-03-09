from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Portfolio


def _cdn_url(object_key: str | None) -> str | None:
    if not object_key:
        return None
    return f"{settings.cdn_base_url.rstrip('/')}/{object_key}"


def build_public_read_model(db: Session, portfolio: Portfolio, username: str) -> dict:
    _ = db
    projects = []
    for project in sorted(portfolio.projects, key=lambda p: (p.sort_order, p.id)):
        projects.append(
            {
                "title": project.title,
                "short_description": project.short_description,
                "github_url": project.github_url,
                "live_url": project.live_url,
                "technologies": [
                    row.technology.name
                    for row in project.technologies
                    if getattr(row, "technology", None)
                ],
                "image_urls": [
                    _cdn_url(img.image_key)
                    for img in sorted(project.images, key=lambda i: (i.sort_order, i.id))
                    if img.image_key
                ],
            }
        )

    return {
        "username": username,
        "slug": portfolio.slug,
        "title": portfolio.title,
        "headline": portfolio.headline,
        "bio": portfolio.bio,
        "profile_image_url": _cdn_url(portfolio.profile_image_key),
        "cover_image_url": _cdn_url(portfolio.cover_image_key),
        "skills": [
            {
                "name": row.skill.name,
                "category": row.skill.category,
                "level": row.level,
            }
            for row in portfolio.skills
            if getattr(row, "skill", None)
        ],
        "projects": projects,
        "certificates": [
            {
                "title": cert.title,
                "issuer": cert.issuer,
                "issue_date": cert.issue_date.isoformat() if cert.issue_date else None,
                "certificate_url": cert.certificate_url,
                "certificate_image_url": _cdn_url(cert.certificate_image_key),
            }
            for cert in portfolio.certificates
        ],
        "social_links": [
            {"platform": link.platform, "url": link.url}
            for link in portfolio.social_links
        ],
        "theme": portfolio.settings.extras.get("theme_tokens", {}) if portfolio.settings else {},
    }


def calculate_completeness(read_model: dict) -> tuple[int, list[str]]:
    checks = {
        "title": bool(read_model.get("title")),
        "headline": bool(read_model.get("headline")),
        "bio": bool(read_model.get("bio")),
        "projects": len(read_model.get("projects", [])) > 0,
        "skills": len(read_model.get("skills", [])) > 0,
        "social_links": len(read_model.get("social_links", [])) > 0,
    }
    missing = [key for key, ok in checks.items() if not ok]
    score = int(((len(checks) - len(missing)) / len(checks)) * 100)
    return score, missing
