from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Portfolio, PortfolioViewEvent
from app.schemas.portfolio import PublicPortfolioResponse
from app.services.cache_service import cache_service
from app.services.render_service import build_public_read_model

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/portfolios/{slug}", response_model=PublicPortfolioResponse)
def get_public_portfolio(slug: str, db: Session = Depends(get_db)):
    cache_key = f"portfolio:public:slug:{slug}"
    cached = cache_service.get_json(cache_key)
    if cached:
        return cached

    portfolio = (
        db.query(Portfolio)
        .filter(Portfolio.slug == slug, Portfolio.is_published.is_(True))
        .first()
    )
    if not portfolio or portfolio.visibility == "private":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")

    # Replace with user-service lookup in production.
    username = slug
    payload = build_public_read_model(db, portfolio=portfolio, username=username)
    cache_service.set_json(cache_key, payload)
    return payload


@router.post("/portfolios/{slug}/track")
def track_event(slug: str, request: Request, db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).filter(Portfolio.slug == slug).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")

    event = PortfolioViewEvent(
        portfolio_id=portfolio.id,
        event_type="page_view",
        session_id=request.headers.get("x-session-id"),
        referrer=request.headers.get("referer"),
        metadata={},
    )
    db.add(event)
    db.commit()
    return {"ok": True}
