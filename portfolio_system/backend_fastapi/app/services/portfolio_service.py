from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models import Certificate, Portfolio, Project, Skill, SocialLink, User
from app.schemas.portfolio import PortfolioCreateRequest, PortfolioUpdateRequest


class PortfolioService:
    def _portfolio_query(self, db: Session):
        return db.query(Portfolio).options(
            joinedload(Portfolio.user),
            selectinload(Portfolio.projects),
            selectinload(Portfolio.skills),
            selectinload(Portfolio.certificates),
            selectinload(Portfolio.social_links),
        )

    def _get_or_create_user(
        self,
        db: Session,
        user_id: int,
        username: str,
        email: str,
    ) -> User:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            if username and user.username != username:
                user.username = username
            if email and user.email != email:
                user.email = email
            return user

        resolved_username = username or f"user-{user_id}"
        user = User(id=user_id, username=resolved_username, email=email or None)
        db.add(user)
        db.flush()
        return user

    def create_portfolio(
        self,
        db: Session,
        owner: dict,
        payload: PortfolioCreateRequest,
    ) -> Portfolio:
        user = self._get_or_create_user(
            db=db,
            user_id=owner["user_id"],
            username=owner.get("username", ""),
            email=owner.get("email", ""),
        )

        existing_by_owner = db.query(Portfolio).filter(Portfolio.user_id == user.id).first()
        if existing_by_owner:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Portfolio already exists for this user",
            )

        existing_slug = db.query(Portfolio).filter(Portfolio.slug == payload.slug).first()
        if existing_slug:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Slug is already in use",
            )

        portfolio = Portfolio(
            user_id=user.id,
            slug=payload.slug,
            title=payload.title,
            headline=payload.headline,
            bio=payload.bio,
            avatar_url=payload.avatar_url,
            cover_url=payload.cover_url,
            visibility=payload.visibility,
            is_published=payload.is_published,
        )
        db.add(portfolio)
        db.flush()

        self._replace_projects(portfolio, payload.projects)
        self._replace_skills(portfolio, payload.skills)
        self._replace_certificates(portfolio, payload.certificates)
        self._replace_social_links(portfolio, payload.social_links)

        db.commit()
        return self.get_portfolio_for_user(db, owner["user_id"])

    def update_portfolio(
        self,
        db: Session,
        owner: dict,
        payload: PortfolioUpdateRequest,
    ) -> Portfolio:
        portfolio = self._portfolio_query(db).filter(Portfolio.user_id == owner["user_id"]).first()
        if not portfolio:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")

        if payload.slug and payload.slug != portfolio.slug:
            existing_slug = db.query(Portfolio).filter(Portfolio.slug == payload.slug).first()
            if existing_slug:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Slug is already in use",
                )
            portfolio.slug = payload.slug

        if payload.title is not None:
            portfolio.title = payload.title
        if payload.headline is not None:
            portfolio.headline = payload.headline
        if payload.bio is not None:
            portfolio.bio = payload.bio
        if payload.avatar_url is not None:
            portfolio.avatar_url = payload.avatar_url
        if payload.cover_url is not None:
            portfolio.cover_url = payload.cover_url
        if payload.visibility is not None:
            portfolio.visibility = payload.visibility
        if payload.is_published is not None:
            portfolio.is_published = payload.is_published

        if payload.projects is not None:
            self._replace_projects(portfolio, payload.projects)
        if payload.skills is not None:
            self._replace_skills(portfolio, payload.skills)
        if payload.certificates is not None:
            self._replace_certificates(portfolio, payload.certificates)
        if payload.social_links is not None:
            self._replace_social_links(portfolio, payload.social_links)

        db.commit()
        return self.get_portfolio_for_user(db, owner["user_id"])

    def get_portfolio_for_user(self, db: Session, user_id: int) -> Portfolio:
        portfolio = self._portfolio_query(db).filter(Portfolio.user_id == user_id).first()
        if not portfolio:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
        return portfolio

    def get_public_portfolio(self, db: Session, slug: str) -> Portfolio:
        portfolio = (
            self._portfolio_query(db)
            .filter(
                Portfolio.slug == slug,
                Portfolio.is_published.is_(True),
                Portfolio.visibility.in_(["public", "unlisted"]),
            )
            .first()
        )
        if not portfolio:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
        return portfolio

    def to_portfolio_response(self, portfolio: Portfolio) -> dict:
        username = portfolio.user.username if portfolio.user else ""
        return {
            "id": portfolio.id,
            "user_id": portfolio.user_id,
            "username": username,
            "slug": portfolio.slug,
            "title": portfolio.title,
            "headline": portfolio.headline,
            "bio": portfolio.bio,
            "avatar_url": portfolio.avatar_url,
            "cover_url": portfolio.cover_url,
            "visibility": portfolio.visibility,
            "is_published": portfolio.is_published,
            "projects": [
                {
                    "id": project.id,
                    "title": project.title,
                    "short_description": project.short_description,
                    "description": project.description,
                    "github_url": project.github_url,
                    "live_url": project.live_url,
                    "image_url": project.image_url,
                    "sort_order": project.sort_order,
                }
                for project in sorted(portfolio.projects, key=lambda item: (item.sort_order, item.id))
            ],
            "skills": [
                {
                    "id": skill.id,
                    "name": skill.name,
                    "category": skill.category,
                    "level": skill.level,
                    "sort_order": skill.sort_order,
                }
                for skill in sorted(portfolio.skills, key=lambda item: (item.sort_order, item.id))
            ],
            "certificates": [
                {
                    "id": certificate.id,
                    "title": certificate.title,
                    "issuer": certificate.issuer,
                    "issue_date": certificate.issue_date,
                    "image_url": certificate.image_url,
                    "certificate_url": certificate.certificate_url,
                }
                for certificate in portfolio.certificates
            ],
            "social_links": [
                {
                    "id": social.id,
                    "platform": social.platform,
                    "url": social.url,
                }
                for social in portfolio.social_links
            ],
        }

    def to_public_response(self, portfolio: Portfolio) -> dict:
        payload = self.to_portfolio_response(portfolio)
        return {
            "username": payload["username"],
            "slug": payload["slug"],
            "title": payload["title"],
            "headline": payload["headline"],
            "bio": payload["bio"],
            "avatar_url": payload["avatar_url"],
            "cover_url": payload["cover_url"],
            "projects": [
                {
                    "title": project["title"],
                    "short_description": project["short_description"],
                    "github_url": project["github_url"],
                    "live_url": project["live_url"],
                    "image_url": project["image_url"],
                }
                for project in payload["projects"]
            ],
            "skills": payload["skills"],
            "certificates": payload["certificates"],
            "social_links": payload["social_links"],
        }

    @staticmethod
    def _replace_projects(portfolio: Portfolio, projects_payload: list) -> None:
        portfolio.projects.clear()
        for item in projects_payload:
            portfolio.projects.append(
                Project(
                    title=item.title,
                    short_description=item.short_description,
                    description=item.description,
                    github_url=item.github_url,
                    live_url=item.live_url,
                    image_url=item.image_url,
                    sort_order=item.sort_order,
                )
            )

    @staticmethod
    def _replace_skills(portfolio: Portfolio, skills_payload: list) -> None:
        portfolio.skills.clear()
        for item in skills_payload:
            portfolio.skills.append(
                Skill(
                    name=item.name,
                    category=item.category,
                    level=item.level,
                    sort_order=item.sort_order,
                )
            )

    @staticmethod
    def _replace_certificates(portfolio: Portfolio, certificates_payload: list) -> None:
        portfolio.certificates.clear()
        for item in certificates_payload:
            portfolio.certificates.append(
                Certificate(
                    title=item.title,
                    issuer=item.issuer,
                    issue_date=item.issue_date,
                    image_url=item.image_url,
                    certificate_url=item.certificate_url,
                )
            )

    @staticmethod
    def _replace_social_links(portfolio: Portfolio, social_links_payload: list) -> None:
        portfolio.social_links.clear()
        for item in social_links_payload:
            portfolio.social_links.append(
                SocialLink(platform=item.platform, url=item.url)
            )


portfolio_service = PortfolioService()
