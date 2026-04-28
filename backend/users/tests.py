from unittest.mock import MagicMock, patch

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from users.models import CustomUser, DeletedUser, OTPVerification, TrustedDevice


class AuthLifecycleFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def _create_user(self, email, username, password, *, status, is_active, is_verified):
        user = CustomUser.objects.create(
            email=email,
            username=username,
            status=status,
            is_active=is_active,
            is_verified=is_verified,
        )
        user.set_password(password)
        user.save(update_fields=['password', 'updated_at'])
        return user

    @patch('users.views.send_otp_email', return_value=True)
    def test_signup_reuses_pending_account_and_resends_otp(self, _mock_send_otp):
        user = self._create_user(
            email='pending@example.com',
            username='pending_old',
            password='OldPass@123',
            status=CustomUser.STATUS_PENDING,
            is_active=False,
            is_verified=False,
        )

        response = self.client.post(
            '/api/users/register/',
            {
                'email': 'pending@example.com',
                'username': 'pending_new',
                'password': 'NewPass@123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data.get('verify_required'))
        self.assertTrue(response.data.get('existing_pending_account'))

        user.refresh_from_db()
        self.assertEqual(user.username, 'pending_new')
        self.assertTrue(user.check_password('NewPass@123'))
        self.assertEqual(user.status, CustomUser.STATUS_PENDING)
        self.assertFalse(user.is_active)
        self.assertFalse(user.is_verified)
        self.assertEqual(
            OTPVerification.objects.filter(email__iexact='pending@example.com').count(),
            1,
        )

    def test_signup_rejects_verified_email(self):
        self._create_user(
            email='active@example.com',
            username='active_user',
            password='ActivePass@123',
            status=CustomUser.STATUS_ACTIVE,
            is_active=True,
            is_verified=True,
        )

        response = self.client.post(
            '/api/users/register/',
            {
                'email': 'active@example.com',
                'username': 'other_name',
                'password': 'AnotherPass@123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data.get('error'), 'Email already registered')

    @patch('users.views.send_otp_email', return_value=True)
    def test_login_pending_user_returns_verify_required(self, _mock_send_otp):
        self._create_user(
            email='needsotp@example.com',
            username='needs_otp',
            password='NeedsOtp@123',
            status=CustomUser.STATUS_PENDING,
            is_active=False,
            is_verified=False,
        )

        response = self.client.post(
            '/api/users/login/',
            {'identifier': 'needsotp@example.com', 'password': 'NeedsOtp@123'},
            format='json',
        )

        self.assertEqual(response.status_code, 403)
        self.assertTrue(response.data.get('verify_required'))
        self.assertEqual(response.data.get('email'), 'needsotp@example.com')
        self.assertEqual(
            OTPVerification.objects.filter(email__iexact='needsotp@example.com').count(),
            1,
        )

    @patch('users.views.send_otp_email', return_value=True)
    def test_login_pending_user_with_wrong_password_stays_invalid(self, _mock_send_otp):
        self._create_user(
            email='wrongpass@example.com',
            username='wrong_pass',
            password='CorrectPass@123',
            status=CustomUser.STATUS_PENDING,
            is_active=False,
            is_verified=False,
        )

        response = self.client.post(
            '/api/users/login/',
            {'identifier': 'wrongpass@example.com', 'password': 'WrongPass@123'},
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data.get('error'), 'Invalid credentials')
        self.assertEqual(
            OTPVerification.objects.filter(email__iexact='wrongpass@example.com').count(),
            0,
        )

    def test_resend_otp_rejects_already_verified_account(self):
        self._create_user(
            email='verified@example.com',
            username='verified_user',
            password='VerifiedPass@123',
            status=CustomUser.STATUS_ACTIVE,
            is_active=True,
            is_verified=True,
        )

        response = self.client.post(
            '/api/users/resend-otp/',
            {'email': 'verified@example.com'},
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.data.get('message'),
            'Account is already verified. Please login.',
        )

    def test_password_reset_requires_verified_account(self):
        self._create_user(
            email='pending-reset@example.com',
            username='pending_reset',
            password='PendingReset@123',
            status=CustomUser.STATUS_PENDING,
            is_active=False,
            is_verified=False,
        )

        response = self.client.post(
            '/api/users/request-password-reset/',
            {'email': 'pending-reset@example.com'},
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.data.get('message'),
            'Please verify your email before resetting password.',
        )


class DeleteAccountTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def _create_active_user(self, email, username, password):
        user = CustomUser.objects.create(
            email=email,
            username=username,
            status=CustomUser.STATUS_ACTIVE,
            is_active=True,
            is_verified=True,
        )
        user.set_password(password)
        user.save(update_fields=['password', 'updated_at'])
        return user

    @patch('users.views.send_account_deleted_email', return_value=True)
    def test_delete_account_with_password_success(self, _mock_send_deleted_email):
        user = self._create_active_user(
            email='delete-me@example.com',
            username='delete_me',
            password='DeletePass@123',
        )
        self.client.force_authenticate(user=user)

        response = self.client.post(
            '/api/users/delete-account/',
            {'password': 'DeletePass@123'},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data.get('message'), 'Account deleted successfully')
        self.assertFalse(CustomUser.objects.filter(email='delete-me@example.com').exists())
        self.assertTrue(DeletedUser.objects.filter(email='delete-me@example.com').exists())

    @patch('users.views.send_account_deleted_email', return_value=True)
    @patch('users.signals.DeletedUser.objects.get_or_create', side_effect=Exception('tracking failure'))
    def test_delete_account_succeeds_even_when_deleted_user_tracking_fails(self, _mock_track_deleted, _mock_send_deleted_email):
        user = self._create_active_user(
            email='delete-failure@example.com',
            username='delete_failure',
            password='DeletePass@123',
        )
        self.client.force_authenticate(user=user)

        response = self.client.post(
            '/api/users/delete-account/',
            {'password': 'DeletePass@123'},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data.get('message'), 'Account deleted successfully')
        self.assertFalse(CustomUser.objects.filter(email='delete-failure@example.com').exists())


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


class TrustedDeviceGitHubTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create(
            email='githubuser@example.com',
            username='github_user',
            status=CustomUser.STATUS_ACTIVE,
            is_active=True,
            is_verified=True,
        )
        self.user.set_unusable_password()
        self.user.save()

    def _mock_github_responses(self, mock_post, mock_get):
        """Set up mocks for GitHub OAuth token exchange and user info."""
        # POST: exchange code for access_token
        mock_post.return_value.json.return_value = {'access_token': 'fake-gh-token'}
        # GET calls: user info, then emails
        user_response = MagicMock()
        user_response.json.return_value = {'login': 'github_user'}
        emails_response = MagicMock()
        emails_response.json.return_value = [
            {'email': 'githubuser@example.com', 'primary': True, 'verified': True}
        ]
        mock_get.side_effect = [user_response, emails_response]

    @patch('users.views.send_otp_email', return_value=True)
    @patch('requests.get')
    @patch('requests.post')
    def test_github_login_skips_otp_with_valid_trusted_token(self, mock_post, mock_get, mock_send_otp):
        from datetime import timedelta
        TrustedDevice.objects.create(
            user=self.user,
            token='d' * 64,
            expires_at=timezone.now() + timedelta(days=15),
        )
        self._mock_github_responses(mock_post, mock_get)

        response = self.client.post(
            '/api/users/github/login/',
            {'code': 'fake-code', 'redirect_uri': 'http://localhost/callback', 'mode': 'login', 'trusted_device_token': 'd' * 64},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('two_factor_required', response.data)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        mock_send_otp.assert_not_called()

    @patch('users.views.send_otp_email', return_value=True)
    @patch('requests.get')
    @patch('requests.post')
    def test_github_login_sends_otp_when_no_trusted_token(self, mock_post, mock_get, mock_send_otp):
        self._mock_github_responses(mock_post, mock_get)

        response = self.client.post(
            '/api/users/github/login/',
            {'code': 'fake-code', 'redirect_uri': 'http://localhost/callback', 'mode': 'login'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data.get('two_factor_required'))
        mock_send_otp.assert_called_once()
