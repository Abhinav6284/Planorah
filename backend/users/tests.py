from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient

from users.models import CustomUser, OTPVerification


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
