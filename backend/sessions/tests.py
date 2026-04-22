from datetime import datetime
from unittest.mock import patch
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from users.models import CustomUser
from plans.models import Plan
from subscriptions.models import Subscription
from sessions.models import SessionRequest, Notification


def _make_user(email, username):
    user = CustomUser.objects.create(
        email=email,
        username=username,
        status='active',
        is_active=True,
        is_verified=True,
    )
    user.set_password('TestPass@123')
    user.save(update_fields=['password'])
    return user


def _make_subscription(user, plan_name):
    plan = Plan.objects.get(name=plan_name)
    return Subscription.objects.create(
        user=user,
        plan=plan,
        status='active',
        end_date=timezone.now() + timezone.timedelta(days=30),
    )


class SessionRequestCreateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        Plan.create_default_plans()
        self.pro_user = _make_user('pro@example.com', 'prouser')
        self.elite_user = _make_user('elite@example.com', 'eliteuser')
        self.free_user = _make_user('free@example.com', 'freeuser')
        _make_subscription(self.pro_user, 'pro')
        _make_subscription(self.elite_user, 'elite')
        _make_subscription(self.free_user, 'free')

    def _login(self, user):
        res = self.client.post('/api/token/', {
            'email': user.email,
            'password': 'TestPass@123',
        }, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")

    def test_free_plan_cannot_request_session(self):
        self._login(self.free_user)
        res = self.client.post('/api/sessions/request/', {
            'topic_tags': ['roadmap'],
            'description': 'Need help.',
        }, format='json')
        self.assertEqual(res.status_code, 403)

    def test_pro_plan_can_request_session(self):
        self._login(self.pro_user)
        res = self.client.post('/api/sessions/request/', {
            'topic_tags': ['roadmap'],
            'description': 'Need help with milestone.',
        }, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(SessionRequest.objects.filter(user=self.pro_user).count(), 1)

    def test_request_created_with_correct_month_year(self):
        self._login(self.pro_user)
        self.client.post('/api/sessions/request/', {}, format='json')
        session = SessionRequest.objects.get(user=self.pro_user)
        self.assertEqual(session.month_year, datetime.now().strftime('%Y-%m'))

    def test_request_without_tags_or_description_succeeds(self):
        self._login(self.pro_user)
        res = self.client.post('/api/sessions/request/', {}, format='json')
        self.assertEqual(res.status_code, 201)

    def test_pro_plan_quota_exhausted_blocks_request(self):
        self._login(self.pro_user)
        month = datetime.now().strftime('%Y-%m')
        # Pro allows 2 sessions/month
        SessionRequest.objects.create(user=self.pro_user, month_year=month, status='requested')
        SessionRequest.objects.create(user=self.pro_user, month_year=month, status='confirmed')
        res = self.client.post('/api/sessions/request/', {}, format='json')
        self.assertEqual(res.status_code, 403)

    def test_cancelled_sessions_do_not_count_toward_quota(self):
        self._login(self.pro_user)
        month = datetime.now().strftime('%Y-%m')
        # 2 cancelled + 1 real = still under limit (2)
        SessionRequest.objects.create(user=self.pro_user, month_year=month, status='cancelled')
        SessionRequest.objects.create(user=self.pro_user, month_year=month, status='cancelled')
        SessionRequest.objects.create(user=self.pro_user, month_year=month, status='requested')
        res = self.client.post('/api/sessions/request/', {}, format='json')
        self.assertEqual(res.status_code, 201)

    def test_unauthenticated_cannot_request(self):
        res = self.client.post('/api/sessions/request/', {}, format='json')
        self.assertEqual(res.status_code, 401)


class SessionListTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        Plan.create_default_plans()
        self.user = _make_user('user@example.com', 'testuser')
        self.other = _make_user('other@example.com', 'otheruser')
        _make_subscription(self.user, 'pro')
        month = datetime.now().strftime('%Y-%m')
        SessionRequest.objects.create(user=self.user, month_year=month, status='requested')
        SessionRequest.objects.create(user=self.other, month_year=month, status='requested')

    def _login(self, user):
        res = self.client.post('/api/token/', {
            'email': user.email,
            'password': 'TestPass@123',
        }, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")

    def test_list_returns_only_own_sessions(self):
        self._login(self.user)
        res = self.client.get('/api/sessions/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)

    def test_admin_notes_not_exposed(self):
        self._login(self.user)
        res = self.client.get('/api/sessions/')
        self.assertNotIn('admin_notes', res.data[0])


class RemainingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        Plan.create_default_plans()
        self.user = _make_user('rem@example.com', 'remuser')
        _make_subscription(self.user, 'pro')
        month = datetime.now().strftime('%Y-%m')
        SessionRequest.objects.create(user=self.user, month_year=month, status='confirmed')

    def _login(self):
        res = self.client.post('/api/token/', {
            'email': self.user.email,
            'password': 'TestPass@123',
        }, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")

    def test_remaining_returns_correct_counts(self):
        self._login()
        res = self.client.get('/api/sessions/remaining/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['used'], 1)
        self.assertEqual(res.data['limit'], 2)
        self.assertEqual(res.data['remaining'], 1)


class NotificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        Plan.create_default_plans()
        self.user = _make_user('notif@example.com', 'notifuser')
        _make_subscription(self.user, 'pro')
        month = datetime.now().strftime('%Y-%m')
        session = SessionRequest.objects.create(user=self.user, month_year=month, status='confirmed')
        Notification.objects.create(user=self.user, session=session, message='Your session is confirmed!')

    def _login(self):
        res = self.client.post('/api/token/', {
            'email': self.user.email,
            'password': 'TestPass@123',
        }, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")

    def test_notifications_list(self):
        self._login()
        res = self.client.get('/api/sessions/notifications/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)

    def test_mark_notification_read(self):
        self._login()
        notif = Notification.objects.get(user=self.user)
        res = self.client.patch(f'/api/sessions/notifications/{notif.id}/read/')
        self.assertEqual(res.status_code, 200)
        notif.refresh_from_db()
        self.assertTrue(notif.is_read)
