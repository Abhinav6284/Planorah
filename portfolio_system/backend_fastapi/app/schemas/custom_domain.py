from __future__ import annotations

import re
from datetime import datetime

from pydantic import BaseModel, field_validator

# RFC 952 / RFC 1123 compliant domain validator (no scheme, no path)
_DOMAIN_RE = re.compile(
    r"^(?:[a-zA-Z0-9]"
    r"(?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+"
    r"[a-zA-Z]{2,}$"
)


def _clean_domain(value: str) -> str:
    """Strip scheme and trailing slash, lower-case."""
    value = value.strip().lower()
    # Remove accidental http(s):// prefix
    if value.startswith(("http://", "https://")):
        value = value.split("//", 1)[1]
    # Remove path / port
    value = value.split("/")[0].split(":")[0]
    return value


class CustomDomainAddRequest(BaseModel):
    domain: str

    @field_validator("domain", mode="before")
    @classmethod
    def validate_domain(cls, v: str) -> str:
        v = _clean_domain(v)
        if len(v) > 253:
            raise ValueError("Domain name too long (max 253 characters).")
        if not _DOMAIN_RE.match(v):
            raise ValueError(
                "Invalid domain format. Use a fully-qualified domain like 'example.com'."
            )
        # Block Planorah's own domains to prevent self-hijack
        blocked_suffixes = ("planorah.me",)
        if any(v == b or v.endswith(f".{b}") for b in blocked_suffixes):
            raise ValueError("Cannot use a planorah.me subdomain as a custom domain.")
        return v


class CustomDomainResponse(BaseModel):
    id: int
    domain: str
    verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class VerifyDomainRequest(BaseModel):
    domain: str

    @field_validator("domain", mode="before")
    @classmethod
    def clean(cls, v: str) -> str:
        return _clean_domain(v)


class DomainVerificationInstructions(BaseModel):
    domain: str
    cname_name: str
    cname_value: str
    a_record_ip: str
    verified: bool
    instructions: str
