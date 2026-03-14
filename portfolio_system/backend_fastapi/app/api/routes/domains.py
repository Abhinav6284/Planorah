"""
API routes for custom domain management.

Protected endpoints (require Bearer JWT):
    GET    /v1/domains                         – list user's domains
    POST   /v1/domains                         – register a new domain
    GET    /v1/domains/{domain}/instructions   – DNS setup instructions
    POST   /v1/domains/verify                  – trigger DNS verification
    DELETE /v1/domains/{domain}                – remove a domain

Public endpoint (used by the frontend for custom-domain routing):
    GET    /v1/public/domain-portfolio         – resolve Host header → portfolio
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.custom_domain import (
    CustomDomainAddRequest,
    CustomDomainResponse,
    DomainVerificationInstructions,
    VerifyDomainRequest,
)
from app.services import domain_service
from app.services.portfolio_service import portfolio_service
from app.schemas.portfolio import PublicPortfolioResponse

router = APIRouter(prefix="/domains", tags=["domains"])
public_router = APIRouter(prefix="/public", tags=["public"])


# ---------------------------------------------------------------------------
# Protected endpoints
# ---------------------------------------------------------------------------

@router.get("", response_model=list[CustomDomainResponse])
def list_my_domains(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all custom domains registered by the authenticated user."""
    return domain_service.list_domains(db, current_user["user_id"])


@router.post("", response_model=CustomDomainResponse, status_code=status.HTTP_201_CREATED)
def add_domain(
    payload: CustomDomainAddRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Register a new custom domain (unverified).

    The response includes the domain ID and `verified: false`.
    Call `GET /v1/domains/{domain}/instructions` next for DNS setup steps.
    """
    return domain_service.add_domain(db, current_user["user_id"], payload)


@router.get("/{domain:path}/instructions", response_model=DomainVerificationInstructions)
def get_instructions(
    domain: str,
    current_user: dict = Depends(get_current_user),  # noqa: ARG001 — ensures auth
):
    """
    Return step-by-step DNS setup instructions for a domain.
    Does not check whether the domain belongs to the user — the instructions
    are the same for every domain so this stays lightweight.
    """
    return domain_service.get_verification_instructions(domain)


@router.post("/verify", response_model=CustomDomainResponse)
def verify_domain(
    payload: VerifyDomainRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Trigger a live DNS check.

    Returns the updated domain record with `verified: true` on success,
    or HTTP 400 with guidance if DNS is not yet propagated.
    """
    return domain_service.verify_domain(db, current_user["user_id"], payload.domain)


@router.delete("/{domain:path}", status_code=status.HTTP_204_NO_CONTENT)
def delete_domain(
    domain: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a custom domain from the user's account."""
    domain_service.remove_domain(db, current_user["user_id"], domain)


# ---------------------------------------------------------------------------
# Public endpoint — resolves a custom domain to its portfolio
# ---------------------------------------------------------------------------

@public_router.get("/domain-portfolio", response_model=PublicPortfolioResponse)
def get_portfolio_by_custom_domain(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Called by the Next.js frontend when it detects the request arrived on a
    custom domain (i.e., not planorah.me).

    The Host header is read; if a verified custom domain matches, the
    portfolio is returned exactly as the regular public endpoint does.
    """
    # The middleware already resolved the host and stored it on request.state
    # Fallback: read it directly if middleware was bypassed in tests
    user_id: int | None = getattr(request.state, "custom_domain_user_id", None)

    if user_id is None:
        host = request.headers.get("host", "")
        cd = domain_service.get_domain_by_host(db, host)
        if cd is None:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No verified custom domain found for this host.",
            )
        user_id = cd.user_id

    portfolio = portfolio_service.get_portfolio_for_user(db, user_id)
    return portfolio_service.to_public_response(portfolio)
