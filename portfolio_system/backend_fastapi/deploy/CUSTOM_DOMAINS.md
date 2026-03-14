# Custom Domain Support — Deployment Guide

## Overview

Users can connect their own domain (e.g. `abhinavgoyal.dev`) to their
Planorah portfolio.  Traffic reaches the VPS → Nginx forwards every request
to FastAPI → the `CustomDomainMiddleware` resolves the host to a portfolio.

---

## 1. Prerequisites

| Item | Value |
|------|-------|
| VPS public IP | `<YOUR_VPS_IP>` — set `VPS_PUBLIC_IP` in `.env` |
| Planorah CNAME target | `cname.planorah.me` → must resolve to the VPS IP |
| Certbot | `apt install certbot python3-certbot-nginx` |

---

## 2. Environment Variables

Add to `backend_fastapi/.env`:

```env
VPS_PUBLIC_IP=198.51.100.42          # your server's public IP
MAX_CUSTOM_DOMAINS_PER_USER=3        # optional, default 3
```

---

## 3. Database Migration

Run the new SQL against your PostgreSQL instance:

```sql
CREATE TABLE IF NOT EXISTS custom_domains (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    domain      VARCHAR(253) NOT NULL,
    verified    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_custom_domains_domain UNIQUE (domain)
);
CREATE INDEX IF NOT EXISTS idx_custom_domains_user     ON custom_domains(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_verified ON custom_domains(domain, verified);
```

Or enable `AUTO_CREATE_SCHEMA=true` in `.env` for development to let
SQLAlchemy create it on startup.

---

## 4. Install Python Dependencies

```bash
pip install -r requirements.txt
# New dependency: dnspython==2.7.0
```

---

## 5. Nginx Configuration

```bash
# Copy the config
sudo cp deploy/nginx/planorah-portfolio.conf /etc/nginx/sites-available/planorah-portfolio

# Enable it
sudo ln -sf /etc/nginx/sites-available/planorah-portfolio \
            /etc/nginx/sites-enabled/planorah-portfolio

# Remove default if present
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

---

## 6. SSL Strategy

### Option A — Certbot + Nginx (recommended)

**Pros:** Industry standard, free, well-documented, integrates with Nginx config
automatically, auto-renews via cron/systemd timer.

**Cons:** Requires running `certbot --nginx -d <domain>` each time a new custom
domain is verified; needs scripting/webhook to automate.

**Per-domain issuance (automated):**

When your backend marks a domain as `verified`, trigger the helper script:

```bash
sudo bash deploy/certbot-custom-domain.sh abhinavgoyal.dev admin@planorah.me
```

You can call this from a Celery/background task immediately after DNS
verification succeeds:

```python
import subprocess
subprocess.run(
    ["sudo", "/path/to/certbot-custom-domain.sh", domain, ADMIN_EMAIL],
    check=True,
)
```

**Auto-renewal:** Certbot installs a systemd timer automatically.
Verify with: `systemctl status certbot.timer`

---

### Option B — Caddy Server (simplest for fully automated SSL)

**Pros:** Zero-config HTTPS — Caddy obtains and renews certificates
automatically the moment traffic arrives. No per-domain scripting.

**Cons:** Replaces Nginx (migration effort); less widespread ops knowledge;
slightly more memory.

**Caddy Caddyfile example:**

```caddyfile
{
    email admin@planorah.me
}

# Planorah primary domain
api.planorah.me {
    reverse_proxy 127.0.0.1:8000
}

# Catch-all for custom domains (on-demand TLS)
:443 {
    tls {
        on_demand
    }
    reverse_proxy 127.0.0.1:8000
    header Host {host}
}
```

Enable on-demand TLS with a pre-check endpoint so Caddy only issues
certificates for verified domains:

```caddyfile
{
    on_demand_tls {
        ask http://127.0.0.1:8000/v1/internal/domain-check?domain={host}
        interval 2m
        burst 5
    }
}
```

Add an internal FastAPI endpoint `/v1/internal/domain-check` that returns
`200` if the domain is verified, `404` otherwise.

**Recommendation:** Start with **Certbot + Nginx** (Option A) because your
stack already uses Nginx.  Migrate to **Caddy** when the number of custom
domains grows above ~50-100 and per-domain scripting becomes burdensome.

---

## 7. User Flow

```
User dashboard
  │
  ├── POST /v1/domains           { "domain": "abhinavgoyal.dev" }
  │        ← { id, domain, verified: false, created_at }
  │
  ├── GET  /v1/domains/{domain}/instructions
  │        ← DNS setup instructions (CNAME / A record details)
  │
  │   [User adds DNS record at their registrar — wait for propagation]
  │
  ├── POST /v1/domains/verify    { "domain": "abhinavgoyal.dev" }
  │        ← { verified: true }  OR  HTTP 400 (not propagated yet)
  │
  └── [Backend optionally triggers certbot for SSL]
```

---

## 8. Security Checklist

- [x] Only `verified = true` domains are resolved by the middleware
- [x] Domain format is validated by Pydantic regex (RFC 1123)
- [x] `planorah.me` subdomains are blocked in the validator
- [x] Duplicate domains across users raise 409 — no information leak
- [x] `user_id` taken from JWT, not from the request body
- [x] Host header stripped of port before DB lookup
- [x] DNS lookup uses a 5-second timeout — no hanging requests
- [x] `MAX_CUSTOM_DOMAINS_PER_USER` enforced to prevent abuse
- [x] DB errors in middleware are caught; the request still proceeds

---

## 9. API Reference

### Add a domain
```
POST /v1/domains
Authorization: Bearer <jwt>
Content-Type: application/json

{ "domain": "abhinavgoyal.dev" }
```

### Get DNS instructions
```
GET /v1/domains/abhinavgoyal.dev/instructions
Authorization: Bearer <jwt>
```

### Verify a domain
```
POST /v1/domains/verify
Authorization: Bearer <jwt>
Content-Type: application/json

{ "domain": "abhinavgoyal.dev" }
```

### List my domains
```
GET /v1/domains
Authorization: Bearer <jwt>
```

### Delete a domain
```
DELETE /v1/domains/abhinavgoyal.dev
Authorization: Bearer <jwt>
```

### Resolve a custom-domain portfolio (public)
```
GET /v1/public/domain-portfolio
Host: abhinavgoyal.dev
```
