# Remember Me OTP Skip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a user checks "Remember Me" and completes social login OTP verification, skip the OTP step for subsequent Google/GitHub logins for 15 days.

**Architecture:** A `TrustedDevice` DB model stores a secure token per user with a 15-day expiry. The backend issues this token after OTP verification with `remember_me: true`, and checks it before sending OTP on social logins. The frontend stores the token in `localStorage` and sends it on every social login attempt.

**Tech Stack:** Django/DRF backend, React frontend, simplejwt, `secrets` stdlib, `localStorage`

---

## File Map

| File | Change |
|------|--------|
| `backend/users/models.py` | Add `TrustedDevice` model |
| `backend/users/migrations/0016_trusteddevice.py` | New migration (auto-generated) |
| `backend/users/views.py` | Modify `verify_social_otp`, `google_oauth_login`, `github_oauth_login`, `logout_view` |
| `backend/users/tests.py` | Add trusted device tests |
| `frontend/src/utils/auth.js` | Add `setTrustedDeviceToken`, `getTrustedDeviceToken`, `clearTrustedDeviceToken`; update `clearTokens` |
| `frontend/src/components/VerifyOTP.jsx` | Send `remember_me` flag and store returned `trusted_device_token` |
| `frontend/src/components/Login.jsx` | Send `trusted_device_token` in Google login request |
| `frontend/src/components/GitHubCallback.jsx` | Send `trusted_device_token` in GitHub login request |

---

## Task 1: Add TrustedDevice Model

**Files:**
- Modify: `backend/users/models.py`

- [ ] **Step 1: Add the model**

Open `backend/users/models.py`. After the `PasswordResetToken` class and before `DeletedUser`, add:

```python
class TrustedDevice(models.Model):
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name='trusted_devices'
    )
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_valid(self):
        return timezone.now() < self.expires_at

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"TrustedDevice for {self.user.email} (expires {self.expires_at.strftime('%Y-%m-%d')})"
```

- [ ] **Step 2: Generate and run migration**

```bash
cd backend
python manage.py makemigrations users --name trusteddevice
python manage.py migrate
```

Expected output: `Applying users.0016_trusteddevice... OK`

- [ ] **Step 3: Commit**

```bash
git add backend/users/models.py backend/users/migrations/0016_trusteddevice.py
git commit -m "feat: add TrustedDevice model for Remember Me OTP skip"
```

---

## Task 2: Backend — Write Failing Tests

**Files:**
- Modify: `backend/users/tests.py`

- [ ] **Step 1: Add imports at the top of tests.py**

The file already imports `CustomUser`, `OTPVerification`. Add `TrustedDevice` to that import line:

```python
from users.models import CustomUser, DeletedUser, OTPVerification, TrustedDevice
```

- [ ] **Step 2: Add the test class at the bottom of tests.py**

```python
class TrustedDeviceTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create(
            email='trusted@example.com',
            username='trusted_user',
            status=CustomUser.STATUS_ACTIVE,
            is_active=True,
            is_verified=True,
        )
        self.user.set_unusable_password()
        self.user.save()
        # Create a valid OTP for social login verification
        OTPVerification.objects.create(
            email='trusted@example.com',
            otp='123456',
            is_used=False,
        )

    # ── verify_social_otp with remember_me=True issues a trusted device token ──

    def test_verify_social_otp_with_remember_me_returns_trusted_token(self):
        response = self.client.post(
            '/api/users/verify-social-otp/',
            {'email': 'trusted@example.com', 'otp': '123456', 'remember_me': True},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('trusted_device_token', response.data)
        token_val = response.data['trusted_device_token']
        self.assertEqual(len(token_val), 64)
        self.assertTrue(TrustedDevice.objects.filter(user=self.user, token=token_val).exists())

    def test_verify_social_otp_without_remember_me_does_not_issue_trusted_token(self):
        response = self.client.post(
            '/api/users/verify-social-otp/',
            {'email': 'trusted@example.com', 'otp': '123456', 'remember_me': False},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('trusted_device_token', response.data)
        self.assertFalse(TrustedDevice.objects.filter(user=self.user).exists())

    # ── google_oauth_login skips OTP when valid trusted token is present ──

    @patch('users.views.send_otp_email', return_value=True)
    @patch('requests.get')
    def test_google_login_skips_otp_with_valid_trusted_token(self, mock_get, mock_send_otp):
        from datetime import timedelta
        TrustedDevice.objects.create(
            user=self.user,
            token='a' * 64,
            expires_at=timezone.now() + timedelta(days=15),
        )
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {'email': 'trusted@example.com'}

        response = self.client.post(
            '/api/users/google/login/',
            {'token': 'fake-google-token', 'mode': 'login', 'trusted_device_token': 'a' * 64},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('two_factor_required', response.data)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        mock_send_otp.assert_not_called()

    @patch('users.views.send_otp_email', return_value=True)
    @patch('requests.get')
    def test_google_login_sends_otp_when_trusted_token_expired(self, mock_get, mock_send_otp):
        from datetime import timedelta
        TrustedDevice.objects.create(
            user=self.user,
            token='b' * 64,
            expires_at=timezone.now() - timedelta(days=1),  # expired
        )
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {'email': 'trusted@example.com'}

        response = self.client.post(
            '/api/users/google/login/',
            {'token': 'fake-google-token', 'mode': 'login', 'trusted_device_token': 'b' * 64},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data.get('two_factor_required'))
        mock_send_otp.assert_called_once()

    @patch('users.views.send_otp_email', return_value=True)
    @patch('requests.get')
    def test_google_login_sends_otp_when_no_trusted_token(self, mock_get, mock_send_otp):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {'email': 'trusted@example.com'}

        response = self.client.post(
            '/api/users/google/login/',
            {'token': 'fake-google-token', 'mode': 'login'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data.get('two_factor_required'))
        mock_send_otp.assert_called_once()

    # ── logout deletes trusted device ──

    def test_logout_deletes_trusted_device(self):
        from datetime import timedelta
        from rest_framework_simplejwt.tokens import RefreshToken as JWTRefresh
        TrustedDevice.objects.create(
            user=self.user,
            token='c' * 64,
            expires_at=timezone.now() + timedelta(days=15),
        )
        refresh = str(JWTRefresh.for_user(self.user))

        response = self.client.post(
            '/api/users/logout/',
            {'refresh': refresh},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(TrustedDevice.objects.filter(user=self.user).exists())
```

- [ ] **Step 3: Run the tests — confirm they all FAIL**

```bash
cd backend
python manage.py test users.tests.TrustedDeviceTests -v 2
```

Expected: all 6 tests FAIL (model exists but views don't implement the feature yet).

- [ ] **Step 4: Commit the failing tests**

```bash
git add backend/users/tests.py
git commit -m "test: add failing tests for TrustedDevice OTP skip"
```

---

## Task 3: Backend — Implement verify_social_otp Changes

**Files:**
- Modify: `backend/users/views.py` (the `verify_social_otp` function, lines ~1148–1229)

- [ ] **Step 1: Add TrustedDevice import at top of views.py**

Find this line near the top of `views.py`:

```python
from .models import CustomUser, OTPVerification, UserProfile, PasswordResetToken
```

Change it to:

```python
from .models import CustomUser, OTPVerification, UserProfile, PasswordResetToken, TrustedDevice
```

- [ ] **Step 2: Update verify_social_otp to issue trusted device token**

Find the end of `verify_social_otp` — the section that generates tokens and builds the response (around line 1205). Replace the entire token generation + return block with this:

```python
    # Generate tokens
    try:
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
    except Exception:
        logger.exception("Failed to generate social OTP tokens for %s", email)
        return Response({"message": "Failed to generate tokens"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Check onboarding status
    onboarding_complete = False
    if hasattr(user, 'profile'):
        onboarding_complete = user.profile.onboarding_complete  # type: ignore

    response_data = {
        "message": "Login verification successful",
        "access": access_token,
        "refresh": refresh_token,
        "onboarding_complete": onboarding_complete,
        "user": {
            "id": getattr(user, "id", None),
            "username": user.username,
            "email": user.email,
        }
    }

    # Issue trusted device token if remember_me is True
    remember_me = request.data.get("remember_me", False)
    if remember_me:
        import secrets as _secrets
        # One trusted device per user — delete any existing ones
        TrustedDevice.objects.filter(user=user).delete()
        trusted_token = _secrets.token_hex(32)
        TrustedDevice.objects.create(
            user=user,
            token=trusted_token,
            expires_at=timezone.now() + timedelta(days=15),
        )
        response_data["trusted_device_token"] = trusted_token

    return Response(response_data, status=status.HTTP_200_OK)
```

- [ ] **Step 3: Run the two verify_social_otp tests — they should now pass**

```bash
cd backend
python manage.py test users.tests.TrustedDeviceTests.test_verify_social_otp_with_remember_me_returns_trusted_token users.tests.TrustedDeviceTests.test_verify_social_otp_without_remember_me_does_not_issue_trusted_token -v 2
```

Expected: 2 tests PASS.

- [ ] **Step 4: Commit**

```bash
git add backend/users/views.py
git commit -m "feat: issue trusted device token from verify_social_otp when remember_me=true"
```

---

## Task 4: Backend — Implement google_oauth_login Trusted Device Check

**Files:**
- Modify: `backend/users/views.py` (the `google_oauth_login` function)

- [ ] **Step 1: Add the trusted device check in google_oauth_login**

In `google_oauth_login`, find the comment `# --- 2FA ENFORCEMENT START ---` (around line 865). Replace the entire 2FA block — from that comment down to and including `# --- 2FA ENFORCEMENT END ---` — with this:

```python
        # --- 2FA / TRUSTED DEVICE CHECK ---
        # Prune expired trusted devices for this user
        TrustedDevice.objects.filter(user=user, expires_at__lt=timezone.now()).delete()

        # Check for a valid trusted device token
        trusted_device_token = request.data.get("trusted_device_token")
        if trusted_device_token:
            try:
                device = TrustedDevice.objects.get(token=trusted_device_token, user=user)
                if device.is_valid():
                    # Skip OTP — issue JWT directly
                    refresh = RefreshToken.for_user(user)
                    onboarding_complete = False
                    if hasattr(user, 'profile'):
                        onboarding_complete = user.profile.onboarding_complete  # type: ignore
                    from .activity import record_activity
                    record_activity(user, "login")
                    return Response({
                        "message": "Login successful",
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                        "onboarding_complete": onboarding_complete,
                        "user": {
                            "id": getattr(user, "id", None),
                            "username": user.username,
                            "email": user.email,
                        }
                    }, status=status.HTTP_200_OK)
            except TrustedDevice.DoesNotExist:
                pass  # fall through to OTP

        # No valid trusted device — send OTP
        try:
            otp = str(random.randint(100000, 999999))
            OTPVerification.objects.filter(email=email).delete()
            OTPVerification.objects.create(email=email, otp=otp)
            send_otp_email(email, otp, user.username)
            return Response({
                "message": "Please verify OTP sent to your email",
                "two_factor_required": True,
                "email": email
            }, status=status.HTTP_200_OK)
        except Exception:
            logger.exception("Failed to send Google OAuth OTP for %s", email)
            return Response({"error": "Failed to send 2FA OTP"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # --- END 2FA / TRUSTED DEVICE CHECK ---
```

- [ ] **Step 2: Run the three google_oauth_login tests**

```bash
cd backend
python manage.py test users.tests.TrustedDeviceTests.test_google_login_skips_otp_with_valid_trusted_token users.tests.TrustedDeviceTests.test_google_login_sends_otp_when_trusted_token_expired users.tests.TrustedDeviceTests.test_google_login_sends_otp_when_no_trusted_token -v 2
```

Expected: 3 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add backend/users/views.py
git commit -m "feat: skip OTP in google_oauth_login when valid trusted device token present"
```

---

## Task 5: Backend — Implement github_oauth_login Trusted Device Check

**Files:**
- Modify: `backend/users/views.py` (the `github_oauth_login` function)

- [ ] **Step 1: Add the trusted device check in github_oauth_login**

In `github_oauth_login`, find the comment `# --- 2FA ENFORCEMENT START ---` (around line 1047). Replace the entire block — from that comment down to and including `# --- 2FA ENFORCEMENT END ---` — with this identical block:

```python
        # --- 2FA / TRUSTED DEVICE CHECK ---
        # Prune expired trusted devices for this user
        TrustedDevice.objects.filter(user=user, expires_at__lt=timezone.now()).delete()

        # Check for a valid trusted device token
        trusted_device_token = request.data.get("trusted_device_token")
        if trusted_device_token:
            try:
                device = TrustedDevice.objects.get(token=trusted_device_token, user=user)
                if device.is_valid():
                    # Skip OTP — issue JWT directly
                    refresh = RefreshToken.for_user(user)
                    onboarding_complete = False
                    if hasattr(user, 'profile'):
                        onboarding_complete = user.profile.onboarding_complete  # type: ignore
                    from .activity import record_activity
                    record_activity(user, "login")
                    return Response({
                        "message": "Login successful",
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                        "onboarding_complete": onboarding_complete,
                        "user": {
                            "id": getattr(user, "id", None),
                            "username": user.username,
                            "email": user.email,
                        }
                    }, status=status.HTTP_200_OK)
            except TrustedDevice.DoesNotExist:
                pass  # fall through to OTP

        # No valid trusted device — send OTP
        try:
            otp = str(random.randint(100000, 999999))
            OTPVerification.objects.filter(email=email).delete()
            OTPVerification.objects.create(email=email, otp=otp)
            send_otp_email(email, otp, user.username)
            return Response({
                "message": "Please verify OTP sent to your email",
                "two_factor_required": True,
                "email": email
            }, status=status.HTTP_200_OK)
        except Exception:
            logger.exception("Failed to send GitHub OAuth OTP for %s", email)
            return Response({"error": "Failed to send 2FA OTP"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # --- END 2FA / TRUSTED DEVICE CHECK ---
```

- [ ] **Step 2: Run ALL TrustedDevice tests to confirm no regressions**

```bash
cd backend
python manage.py test users.tests.TrustedDeviceTests -v 2
```

Expected: all 6 tests PASS.

- [ ] **Step 3: Run full user test suite**

```bash
cd backend
python manage.py test users -v 2
```

Expected: all tests PASS.

- [ ] **Step 4: Commit**

```bash
git add backend/users/views.py
git commit -m "feat: skip OTP in github_oauth_login when valid trusted device token present"
```

---

## Task 6: Backend — Delete TrustedDevice on Logout

**Files:**
- Modify: `backend/users/views.py` (the `logout_view` function)

- [ ] **Step 1: Update logout_view to delete trusted device**

Find `logout_view`. Locate this block:

```python
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()  # requires simplejwt token blacklist app installed & migrated
        return Response({"detail": "Logout successful. Token blacklisted."}, status=status.HTTP_200_OK)
```

Replace it with:

```python
    try:
        token = RefreshToken(refresh_token)
        # Identify the user from the refresh token to delete their trusted device
        try:
            user_id = token.payload.get("user_id")
            if user_id:
                TrustedDevice.objects.filter(user_id=user_id).delete()
        except Exception:
            pass  # non-critical — don't block logout
        token.blacklist()  # requires simplejwt token blacklist app installed & migrated
        return Response({"detail": "Logout successful. Token blacklisted."}, status=status.HTTP_200_OK)
```

- [ ] **Step 2: Run the logout test**

```bash
cd backend
python manage.py test users.tests.TrustedDeviceTests.test_logout_deletes_trusted_device -v 2
```

Expected: PASS.

- [ ] **Step 3: Run full user test suite**

```bash
cd backend
python manage.py test users -v 2
```

Expected: all tests PASS.

- [ ] **Step 4: Commit**

```bash
git add backend/users/views.py
git commit -m "feat: delete trusted device record on logout"
```

---

## Task 7: Frontend — Update auth.js Helpers

**Files:**
- Modify: `frontend/src/utils/auth.js`

- [ ] **Step 1: Add trusted device helpers and update clearTokens**

Open `frontend/src/utils/auth.js`. Add these three functions after the `clearRememberMePreference` function:

```js
/**
 * Store the trusted device token (issued after OTP verify with Remember Me)
 */
export function setTrustedDeviceToken(token) {
    localStorage.setItem("trusted_device_token", token);
}

/**
 * Get the trusted device token
 */
export function getTrustedDeviceToken() {
    return localStorage.getItem("trusted_device_token");
}

/**
 * Clear the trusted device token
 */
export function clearTrustedDeviceToken() {
    localStorage.removeItem("trusted_device_token");
}
```

Then find the `clearTokens` function and add `clearTrustedDeviceToken()` call inside it:

```js
export function clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("login_timestamp");
    localStorage.removeItem("trusted_device_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("remember_me_preference");
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/utils/auth.js
git commit -m "feat: add trusted device token helpers to auth.js"
```

---

## Task 8: Frontend — Update VerifyOTP.jsx

**Files:**
- Modify: `frontend/src/components/VerifyOTP.jsx`

- [ ] **Step 1: Update the import line**

Find this import at the top of `VerifyOTP.jsx`:

```js
import { setTokens, getRememberMePreference, clearRememberMePreference } from "../utils/auth";
```

Change it to:

```js
import { setTokens, getRememberMePreference, clearRememberMePreference, setTrustedDeviceToken } from "../utils/auth";
```

- [ ] **Step 2: Update handleSubmit to send remember_me and store trusted token**

Find the POST call inside `handleSubmit` (around line 93). It currently reads:

```js
      const response = await axios.post(endpoint, {
        email: email.trim(),
        otp: otpString,
      });
```

Replace it with:

```js
      const rememberMe = getRememberMePreference();
      const response = await axios.post(endpoint, {
        email: email.trim(),
        otp: otpString,
        ...(location.state?.isLogin && { remember_me: rememberMe }),
      });
```

Then find the success block (the `if (response.status === 200 || response.status === 201)` block). It currently reads:

```js
        const rememberMe = getRememberMePreference();
        setTokens(response.data.access, response.data.refresh, rememberMe);
        clearRememberMePreference();
```

Replace with:

```js
        setTokens(response.data.access, response.data.refresh, rememberMe);
        if (response.data.trusted_device_token) {
          setTrustedDeviceToken(response.data.trusted_device_token);
        }
        clearRememberMePreference();
```

Note: the `rememberMe` variable is now declared earlier (in the POST call step above), so remove the duplicate `const rememberMe = getRememberMePreference();` line from this block if it still exists.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/VerifyOTP.jsx
git commit -m "feat: send remember_me flag and store trusted device token in VerifyOTP"
```

---

## Task 9: Frontend — Update Login.jsx (Google flow)

**Files:**
- Modify: `frontend/src/components/Login.jsx`

- [ ] **Step 1: Update the import line**

Find this import at the top of `Login.jsx`:

```js
import { setTokens, setRememberMePreference } from "../utils/auth";
```

Change it to:

```js
import { setTokens, setRememberMePreference, getTrustedDeviceToken } from "../utils/auth";
```

- [ ] **Step 2: Send trusted_device_token in the Google login request**

Find the Google login POST call inside `googleLogin` onSuccess (around line 94):

```js
        const res = await axios.post(`/api/users/google/login/`, { token: tokenResponse.access_token, mode: "login" });
```

Replace with:

```js
        const trustedToken = getTrustedDeviceToken();
        const res = await axios.post(`/api/users/google/login/`, {
          token: tokenResponse.access_token,
          mode: "login",
          ...(trustedToken && { trusted_device_token: trustedToken }),
        });
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Login.jsx
git commit -m "feat: send trusted device token on Google login attempt"
```

---

## Task 10: Frontend — Update GitHubCallback.jsx

**Files:**
- Modify: `frontend/src/components/GitHubCallback.jsx`

- [ ] **Step 1: Update the import line**

Find this import at the top of `GitHubCallback.jsx`:

```js
import { setTokens, getRememberMePreference, clearRememberMePreference } from "../utils/auth";
```

Change it to:

```js
import { setTokens, getRememberMePreference, clearRememberMePreference, getTrustedDeviceToken } from "../utils/auth";
```

- [ ] **Step 2: Send trusted_device_token in the GitHub login request**

Find the POST call inside `handleGitHubLogin` (around line 28):

```js
                const res = await axios.post(`/users/github/login/`, {
                    code: code,
                    redirect_uri: redirectUri,
                    mode: mode
                });
```

Replace with:

```js
                const trustedToken = getTrustedDeviceToken();
                const res = await axios.post(`/users/github/login/`, {
                    code: code,
                    redirect_uri: redirectUri,
                    mode: mode,
                    ...(trustedToken && { trusted_device_token: trustedToken }),
                });
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/GitHubCallback.jsx
git commit -m "feat: send trusted device token on GitHub login attempt"
```

---

## Task 11: Final Verification

- [ ] **Step 1: Run the complete backend user test suite one final time**

```bash
cd backend
python manage.py test users -v 2
```

Expected: all tests PASS, no failures.

- [ ] **Step 2: Manual smoke test — first social login**

1. Clear `localStorage` in browser devtools (Application → Local Storage → Clear All).
2. Click "Continue with Google", check "Remember Me for 15 days".
3. Verify OTP email arrives and OTP screen shows.
4. Enter OTP → lands on dashboard.
5. Open devtools → Application → Local Storage → confirm `trusted_device_token` key exists (64-char hex string).

- [ ] **Step 3: Manual smoke test — second social login (should skip OTP)**

1. Click logout.
2. Click "Continue with Google" again (Remember Me checkbox state doesn't matter here — the token is in localStorage).
3. Verify: **no OTP email sent, no OTP screen**, user lands directly on dashboard.

- [ ] **Step 4: Manual smoke test — logout clears trust**

1. Click logout.
2. Open devtools → Application → Local Storage → confirm `trusted_device_token` is gone.
3. Click "Continue with Google" again.
4. Verify: OTP email sent, OTP screen shown (trust is gone).

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete Remember Me OTP skip for Google and GitHub logins"
```
