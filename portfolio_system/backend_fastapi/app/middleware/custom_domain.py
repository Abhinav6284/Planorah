"""
custom_domain_middleware.py
---------------------------
Starlette middleware that resolves an incoming Host header to a verified
CustomDomain row and attaches the `user_id` to `request.state`.

Why middleware instead of a simple dependency?
  - Works for *every* route transparently — the frontend can call any endpoint
    on a custom domain and the context is already populated.
  - Avoids an extra DB round-trip on routes that re-query via the dependency.

Usage in request handlers:
    user_id = getattr(request.state, "custom_domain_user_id", None)

The middleware is a no-op for requests that arrive on the standard
planorah.me host (PLANORAH_HOST setting) so normal routing is unaffected.
"""
from __future__ import annotations

import logging

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

from app.db.session import SessionLocal
from app.services.domain_service import get_domain_by_host

logger = logging.getLogger(__name__)

# Hosts we own — no lookup needed for these
_PLANORAH_SUFFIXES = ("planorah.me", "localhost", "127.0.0.1")


def _is_planorah_host(host: str) -> bool:
    host_lower = host.split(":")[0].lower()
    return any(
        host_lower == suffix or host_lower.endswith(f".{suffix}")
        for suffix in _PLANORAH_SUFFIXES
    )


class CustomDomainMiddleware(BaseHTTPMiddleware):
    """Resolve a custom Host header to a portfolio user_id."""

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: object) -> Response:
        host = request.headers.get("host", "")

        if host and not _is_planorah_host(host):
            # Synchronous SQLAlchemy session — run in a thread pool via
            # Starlette's run_in_threadpool when the ORM is sync
            try:
                db = SessionLocal()
                try:
                    cd = get_domain_by_host(db, host)
                    if cd is not None:
                        request.state.custom_domain_user_id = cd.user_id
                        logger.debug(
                            "Custom domain '%s' resolved to user_id=%s",
                            host,
                            cd.user_id,
                        )
                finally:
                    db.close()
            except Exception:
                # Never let a DB error break an incoming request
                logger.exception("CustomDomainMiddleware: DB lookup failed for host '%s'", host)

        return await call_next(request)
