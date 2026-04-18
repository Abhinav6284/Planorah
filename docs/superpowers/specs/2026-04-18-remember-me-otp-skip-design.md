# Remember Me — OTP Skip for Social Logins

**Date:** 2026-04-18  
**Status:** Approved  
**Scope:** Google OAuth and GitHub OAuth login flows only

---

## Problem

Every Google and GitHub login unconditionally sends a 2FA OTP email and redirects the user to `/verify-otp`. The "Remember Me for 15 days" checkbox already exists in the UI but has no effect on the OTP requirement — it only controls token storage (localStorage vs sessionStorage). This makes social login unnecessarily repetitive for users who explicitly opted into a trusted session.

---

## Solution

Introduce a **TrustedDevice** mechanism. After a user completes OTP verification with "Remember Me" checked, the backend issues a secure token tied to their account with a 15-day expiry. On subsequent social logins, if a valid trusted device token is present in the request, the OTP step is skipped entirely and JWT tokens are returned directly.

---

## Data Model

New model in `backend/users/models.py`:

```python
class TrustedDevice(models.Model):
    user       = ForeignKey(CustomUser, on_delete=CASCADE, related_name='trusted_devices')
    token      = CharField(max_length=64, unique=True)  # secrets.token_hex(32)
    created_at = DateTimeField(auto_now_add=True)
    expires_at = DateTimeField()  # created_at + 15 days

    def is_valid(self):
        return timezone.now() < self.expires_at
```

One migration required. No changes to existing models.

---

## Backend Changes (`backend/users/views.py`)

### `verify_social_otp`
- Accept optional `remember_me: bool` in request body.
- After successful OTP verification, if `remember_me` is `True`:
  - Delete any existing `TrustedDevice` records for this user (one device at a time).
  - Create a new `TrustedDevice` with `expires_at = now + 15 days`.
  - Include `trusted_device_token` in the response alongside the JWT tokens.

### `google_oauth_login`
- Accept optional `trusted_device_token: str` in request body.
- After identifying the user (before the 2FA block):
  - Prune expired `TrustedDevice` records for this user.
  - If `trusted_device_token` is present: look up `TrustedDevice` by token.
    - If found, belongs to this user, and `is_valid()` → skip OTP, generate and return JWT tokens directly with `onboarding_complete`.
    - If not found or expired → fall through to normal OTP flow.

### `github_oauth_login`
- Same trusted device check as `google_oauth_login`, applied after user is identified.

### `logout_view`
- Delete all `TrustedDevice` records for the user when logout is called with a valid refresh token.
- This ensures "Remember Me" is cleared on explicit logout.

---

## Frontend Changes

### `frontend/src/utils/auth.js`
Add three helpers:
- `setTrustedDeviceToken(token)` → `localStorage.setItem('trusted_device_token', token)`
- `getTrustedDeviceToken()` → `localStorage.getItem('trusted_device_token')`
- `clearTrustedDeviceToken()` → `localStorage.removeItem('trusted_device_token')`

Call `clearTrustedDeviceToken()` inside the existing `clearTokens()` function so logout always wipes it.

### `frontend/src/components/VerifyOTP.jsx`
In `handleSubmit`, when `location.state.isLogin` is true (social login OTP path):
- Read `rememberMe = getRememberMePreference()`.
- Include `remember_me: rememberMe` in the POST body to `verify-social-otp`.
- If response includes `trusted_device_token`, call `setTrustedDeviceToken(response.data.trusted_device_token)`.

### `frontend/src/components/Login.jsx` (Google flow)
In `googleLogin` onSuccess handler, before calling `/api/users/google/login/`:
- Read `trustedToken = getTrustedDeviceToken()`.
- Include `trusted_device_token: trustedToken || undefined` in the POST body.
- If response does NOT have `two_factor_required` (i.e., trust was accepted), call `setTokens` and navigate normally — same as current success path.

### `frontend/src/components/GitHubCallback.jsx`
In `handleGitHubLogin`, before calling `/users/github/login/`:
- Read `trustedToken = getTrustedDeviceToken()`.
- Include `trusted_device_token: trustedToken || undefined` in the POST body.
- If response does NOT have `two_factor_required`, proceed to `setTokens` and navigate.

---

## Full Login Flow (After This Change)

### First social login (or after trust expires / logout):
1. User clicks Google/GitHub login with Remember Me checked.
2. Backend: no valid trust token → sends OTP email → returns `two_factor_required: true`.
3. Frontend redirects to `/verify-otp` with `isLogin: true`.
4. User enters OTP → POST to `verify-social-otp` with `remember_me: true`.
5. Backend verifies OTP → creates `TrustedDevice` → returns JWT + `trusted_device_token`.
6. Frontend stores both JWT (in localStorage) and `trusted_device_token` (in localStorage).

### Subsequent social logins within 15 days:
1. User clicks Google/GitHub login.
2. Frontend sends `trusted_device_token` in the POST body.
3. Backend finds valid `TrustedDevice` → skips OTP → returns JWT directly.
4. No OTP email sent. No redirect to `/verify-otp`. User lands on dashboard.

### On logout:
1. `logout_view` deletes the user's `TrustedDevice` record.
2. `clearTokens()` removes `trusted_device_token` from localStorage.
3. Next login will require OTP again.

---

## Security Properties

- Token is `secrets.token_hex(32)` — 256 bits of entropy, not guessable.
- Server-side expiry is enforced; client cannot extend it.
- One active trusted device per user (old ones deleted on new trust issuance).
- Explicit logout fully revokes trust server-side.
- Expired records are pruned at login time — no background job needed.

---

## Out of Scope

- Email/password login (no OTP involved for verified accounts).
- Multi-device trusted sessions (one token per user, not per device).
- Admin UI to revoke trusted devices.
