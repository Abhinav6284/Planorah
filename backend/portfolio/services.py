from typing import Any
from urllib.parse import urlparse

from django.conf import settings


LOCAL_HOSTS = {"localhost", "127.0.0.1"}


def get_portfolio_base_url(request=None) -> str:
    """Resolve portfolio base URL for local and production environments."""
    base_url = getattr(
        settings,
        "PORTFOLIO_PUBLIC_BASE_URL",
        "https://planorah.me",
    ).rstrip("/")

    if not request:
        return base_url

    origin = request.headers.get("Origin")
    host = request.get_host()

    if origin and any(local in origin for local in LOCAL_HOSTS):
        return origin.rstrip("/")

    if host.startswith("localhost") or host.startswith("127.0.0.1"):
        return "http://localhost:3000"

    return base_url


def generate_public_url(portfolio, request=None) -> str:
    """Build public portfolio URL with subdomain support."""
    base_url = get_portfolio_base_url(request=request)
    root_domain = getattr(
        settings,
        "PORTFOLIO_PUBLIC_ROOT_DOMAIN",
        "planorah.me",
    ).strip()

    is_local_base = any(local in base_url for local in LOCAL_HOSTS)
    if (
        portfolio.custom_subdomain
        and root_domain not in LOCAL_HOSTS
        and not is_local_base
    ):
        parsed = urlparse(base_url)
        scheme = parsed.scheme or "https"
        return f"{scheme}://{portfolio.custom_subdomain}.{root_domain}"

    return f"{base_url}/p/{portfolio.slug}"


def compute_portfolio_completeness(portfolio) -> dict[str, Any]:
    """
    Compute profile completeness score and required-field readiness.
    Weights are optimized for recruiter conversion-critical fields.
    """
    checks = [
        ("title", bool(portfolio.title), 14),
        ("headline", bool(portfolio.headline), 14),
        ("bio", bool(portfolio.bio), 14),
        ("display_name", bool(portfolio.display_name), 10),
        ("primary_cta", bool(portfolio.primary_cta_label and portfolio.primary_cta_url), 12),
        ("social_link", bool(portfolio.github_url or portfolio.linkedin_url), 10),
        ("projects", portfolio.portfolio_projects.filter(is_visible=True).exists(), 14),
        ("skills", bool(portfolio.skills), 8),
        ("resume_url", bool(portfolio.resume_url), 8),
        ("seo", bool(portfolio.seo_title and portfolio.seo_description), 6),
    ]

    max_score = sum(weight for _, _, weight in checks)
    current_score = sum(weight for _, passed, weight in checks if passed)
    missing_required_fields = [
        key for key, passed, _ in checks[:7] if not passed
    ]

    return {
        "score": round((current_score / max_score) * 100) if max_score else 0,
        "missing_required_fields": missing_required_fields,
        "is_publish_ready": len(missing_required_fields) == 0,
        "breakdown": [
            {"field": key, "passed": passed, "weight": weight}
            for key, passed, weight in checks
        ],
    }

