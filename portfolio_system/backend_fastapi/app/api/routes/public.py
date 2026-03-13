from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.portfolio import PublicPortfolioResponse
from app.services.portfolio_service import portfolio_service

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/portfolio/{slug}", response_model=PublicPortfolioResponse)
def get_public_portfolio(slug: str, db: Session = Depends(get_db)):
    portfolio = portfolio_service.get_public_portfolio(db, slug)
    return portfolio_service.to_public_response(portfolio)
