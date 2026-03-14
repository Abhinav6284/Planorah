#!/usr/bin/env bash
# =============================================================================
# certbot-custom-domain.sh
#
# Issue / renew a Let's Encrypt certificate for a single user-supplied domain
# and reload Nginx.
#
# Usage:
#   sudo bash certbot-custom-domain.sh abhinavgoyal.dev contact@planorah.me
#
# Requirements:
#   - certbot installed  (apt install certbot python3-certbot-nginx)
#   - Nginx running with the catch-all HTTP block from planorah-portfolio.conf
#   - A/CNAME for the domain already pointing at this server's IP
# =============================================================================

set -euo pipefail

DOMAIN="${1:?Usage: $0 <domain> <admin-email>}"
EMAIL="${2:?Usage: $0 <domain> <admin-email>}"

# ---- Basic domain sanity check (no spaces, no slashes, looks like a FQDN) --
if [[ ! "$DOMAIN" =~ ^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$ ]]; then
    echo "ERROR: '$DOMAIN' does not look like a valid FQDN" >&2
    exit 1
fi

echo "==> Issuing certificate for $DOMAIN ..."
certbot --nginx \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --redirect \
    -d "$DOMAIN"

echo "==> Reloading Nginx ..."
systemctl reload nginx

echo "==> Done. Certificate for $DOMAIN is active."
