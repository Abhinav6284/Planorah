from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Portfolio, PortfolioSettings
from app.schemas.portfolio import PortfolioUpdateRequest
from app.services.cache_service import cache_service
from app.services.render_service import build_public_read_model, calculate_completeness

router = APIRouter(prefix="/portfolios", tags=["portfolios"])


@router.get("/me")
def get_my_portfolio(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user["user_id"]).first()
    if not portfolio:
        slug = current_user["username"]
        portfolio = Portfolio(
            user_id=current_user["user_id"],
            slug=slug,
            title=f"{slug} Portfolio",
        )
        db.add(portfolio)
        db.flush()
        db.add(PortfolioSettings(portfolio_id=portfolio.id))
        db.commit()
        db.refresh(portfolio)

    return {
        "id": portfolio.id,
        "slug": portfolio.slug,
        "title": portfolio.title,
        "headline": portfolio.headline,
        "bio": portfolio.bio,
        "visibility": portfolio.visibility,
        "is_published": portfolio.is_published,
    }


@router.patch("/me")
def update_my_portfolio(
    payload: PortfolioUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user["user_id"]).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")

    portfolio.title = payload.title
    portfolio.headline = payload.headline
    portfolio.bio = payload.bio
    portfolio.visibility = payload.visibility
    if payload.is_published is not None:
        portfolio.is_published = payload.is_published
    db.commit()

    cache_service.delete(f"portfolio:public:slug:{portfolio.slug}")
    return {"ok": True}


@router.get("/me/completeness")
def get_completeness(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user["user_id"]).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    read_model = build_public_read_model(db, portfolio=portfolio, username=current_user["username"])
    score, missing = calculate_completeness(read_model)
    return {"score": score, "missing_fields": missing}


@router.post("/me/publish")
def publish_portfolio(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user["user_id"]).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")

    read_model = build_public_read_model(db, portfolio=portfolio, username=current_user["username"])
    score, missing = calculate_completeness(read_model)
    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"score": score, "missing_fields": missing},
        )

    portfolio.is_published = True
    db.commit()
    cache_service.delete(f"portfolio:public:slug:{portfolio.slug}")
    return {"ok": True, "is_published": True, "score": score}


@router.post("/me/unpublish")
def unpublish_portfolio(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user["user_id"]).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")

    portfolio.is_published = False
    db.commit()
    cache_service.delete(f"portfolio:public:slug:{portfolio.slug}")
    return {"ok": True, "is_published": False}
