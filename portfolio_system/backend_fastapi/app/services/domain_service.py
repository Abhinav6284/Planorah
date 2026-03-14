"""
domain_service.py
-----------------
Business logic for custom-domain management.

DNS verification strategy
~~~~~~~~~~~~~~~~~~~~~~~~~
We accept a domain as verified when *either* of the following is true:

  1. A CNAME record resolves to ``cname.planorah.me``
  2. An A record resolves to the VPS public IP (settings.vps_public_ip)

We intentionally do **not** rely on a TXT challenge because CNAME / A is what
users must set anyway for traffic to reach the server.
"""
from __future__ import annotations

import logging
from typing import Any

import dns.exception
import dns.resolver
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.custom_domain import CustomDomain
from app.schemas.custom_domain import CustomDomainAddRequest

logger = logging.getLogger(__name__)

_PLANORAH_CNAME = "cname.planorah.me"


# ---------------------------------------------------------------------------
# DNS helpers
# ---------------------------------------------------------------------------

def _resolve(domain: str, record_type: str) -> list[str]:
    """Return a list of string answers; empty list on any error."""
    try:
        answers = dns.resolver.resolve(domain, record_type, lifetime=5)
        return [rdata.to_text().rstrip(".") for rdata in answers]
    except (dns.exception.DNSException, Exception):
        return []


def check_dns_points_to_planorah(domain: str) -> bool:
    """
    Return True if the domain's DNS already points at Planorah via:
      - CNAME → cname.planorah.me  (www.example.com style)
      - A     → settings.vps_public_ip  (apex domain style)
    """
    cname_records = _resolve(domain, "CNAME")
    for record in cname_records:
        if record.lower() == _PLANORAH_CNAME.lower():
            return True

    a_records = _resolve(domain, "A")
    if settings.vps_public_ip and settings.vps_public_ip in a_records:
        return True

    return False


# ---------------------------------------------------------------------------
# CRUD helpers
# ---------------------------------------------------------------------------

def get_domain_for_user(db: Session, user_id: int, domain: str) -> CustomDomain | None:
    return (
        db.query(CustomDomain)
        .filter(CustomDomain.user_id == user_id, CustomDomain.domain == domain)
        .first()
    )


def get_domain_by_host(db: Session, host: str) -> CustomDomain | None:
    """Used by the middleware to look up an incoming Host header."""
    # Strip port if present (e.g., "example.com:443" → "example.com")
    clean_host = host.split(":")[0].lower().strip()
    return (
        db.query(CustomDomain)
        .filter(CustomDomain.domain == clean_host, CustomDomain.verified.is_(True))
        .first()
    )


# ---------------------------------------------------------------------------
# Public service functions
# ---------------------------------------------------------------------------

def add_domain(db: Session, user_id: int, payload: CustomDomainAddRequest) -> CustomDomain:
    """Register a new (unverified) custom domain for a user."""
    # Prevent duplicates across all users
    existing = db.query(CustomDomain).filter(CustomDomain.domain == payload.domain).first()
    if existing:
        if existing.user_id == user_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You already registered this domain.",
            )
        # Another user owns it — do not reveal whose it is
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This domain is already registered.",
        )

    # One domain per user (simple plan limit — remove if allowing multiple)
    user_domains = (
        db.query(CustomDomain).filter(CustomDomain.user_id == user_id).count()
    )
    max_domains: int = getattr(settings, "max_custom_domains_per_user", 3)
    if user_domains >= max_domains:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"You can register at most {max_domains} custom domain(s).",
        )

    record = CustomDomain(user_id=user_id, domain=payload.domain, verified=False)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def verify_domain(db: Session, user_id: int, domain: str) -> CustomDomain:
    """Check DNS and mark the domain verified if it resolves correctly."""
    record = get_domain_for_user(db, user_id, domain)
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Domain not found for this account.",
        )

    if record.verified:
        return record  # already verified — idempotent

    if not check_dns_points_to_planorah(domain):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"DNS verification failed. "
                f"Add a CNAME record pointing '{domain}' → '{_PLANORAH_CNAME}', "
                f"or an A record → {settings.vps_public_ip}, then retry."
            ),
        )

    record.verified = True
    db.commit()
    db.refresh(record)
    return record


def remove_domain(db: Session, user_id: int, domain: str) -> None:
    """Delete a custom domain owned by this user."""
    record = get_domain_for_user(db, user_id, domain)
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Domain not found for this account.",
        )
    db.delete(record)
    db.commit()


def list_domains(db: Session, user_id: int) -> list[CustomDomain]:
    return (
        db.query(CustomDomain)
        .filter(CustomDomain.user_id == user_id)
        .order_by(CustomDomain.created_at.desc())
        .all()
    )


def get_verification_instructions(domain: str) -> dict[str, Any]:
    return {
        "domain": domain,
        "cname_name": "www",
        "cname_value": _PLANORAH_CNAME,
        "a_record_ip": settings.vps_public_ip or "<YOUR_VPS_IP>",
        "verified": False,
        "instructions": (
            f"To connect '{domain}' to your Planorah portfolio, add ONE of the "
            f"following DNS records at your domain registrar:\n\n"
            f"  Option A — CNAME (recommended for subdomains like www):\n"
            f"    Type:  CNAME\n"
            f"    Name:  www   (or '@' for apex)\n"
            f"    Value: {_PLANORAH_CNAME}\n\n"
            f"  Option B — A record (required for apex domain):\n"
            f"    Type:  A\n"
            f"    Name:  @\n"
            f"    Value: {settings.vps_public_ip or '<YOUR_VPS_IP>'}\n\n"
            f"DNS propagation can take up to 48 hours. "
            f"Once propagated, call POST /v1/domains/verify."
        ),
    }
