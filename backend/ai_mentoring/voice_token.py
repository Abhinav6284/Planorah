"""
Short-lived HMAC tokens that let an authenticated user open the voice proxy.

Stdlib only: imported by Django (voice_config view) and by voice_server.py,
which may run as a plain script without Django settings.
"""
import hashlib
import hmac
import os
import time

TOKEN_TTL_SECONDS = 300


def _secret():
    secret = os.getenv('SECRET_KEY', '')
    if not secret:
        raise RuntimeError('SECRET_KEY is required to sign voice tokens')
    return secret.encode()


def _sign(payload):
    return hmac.new(_secret(), payload.encode(), hashlib.sha256).hexdigest()


def make_token(user_id, now=None):
    expires = int((now or time.time()) + TOKEN_TTL_SECONDS)
    payload = f'{user_id}:{expires}'
    return f'{payload}:{_sign(payload)}'


def verify_token(token, now=None):
    """Return the user id if the token is valid and unexpired, else None."""
    try:
        user_id, expires, signature = (token or '').rsplit(':', 2)
        expires_at = int(expires)
    except ValueError:
        return None
    if not hmac.compare_digest(signature, _sign(f'{user_id}:{expires}')):
        return None
    if expires_at < (now or time.time()):
        return None
    return user_id
