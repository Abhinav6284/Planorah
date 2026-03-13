from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.portfolio import PortfolioCreateRequest, PortfolioResponse, PortfolioUpdateRequest
from app.services.portfolio_service import portfolio_service

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("", response_model=PortfolioResponse)
def get_my_portfolio(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    portfolio = portfolio_service.get_portfolio_for_user(db, current_user["user_id"])
    return portfolio_service.to_portfolio_response(portfolio)


@router.post("", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
def create_my_portfolio(
    payload: PortfolioCreateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    portfolio = portfolio_service.create_portfolio(db=db, owner=current_user, payload=payload)
    return portfolio_service.to_portfolio_response(portfolio)


@router.patch("", response_model=PortfolioResponse)
def update_my_portfolio(
    payload: PortfolioUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    portfolio = portfolio_service.update_portfolio(db=db, owner=current_user, payload=payload)
    return portfolio_service.to_portfolio_response(portfolio)
