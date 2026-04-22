# Session Booking System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a request-based 1:1 mentor session booking system where subscribed users (Pro/Elite) can request sessions, and admin confirms via Django admin, triggering in-app + email notification.

**Architecture:** New `sessions` Django app with `SessionRequest` and `Notification` models, gated by `subscription.plan.sessions_per_month`. Admin confirmation via `post_save` signal sends Brevo email and creates an in-app `Notification`. Frontend: Zustand store + React component integrated into ExecutionDashboard.

**Tech Stack:** Django 5.2 + DRF, JSONField for topic_tags, Brevo email (existing `email_service.py`), React 18 + Zustand + Tailwind CSS.

---

## File Map

**Backend — Create:**
- `backend/sessions/__init__.py`
- `backend/sessions/apps.py`
- `backend/sessions/models.py`
- `backend/sessions/serializers.py`
- `backend/sessions/views.py`
- `backend/sessions/urls.py`
- `backend/sessions/admin.py`
- `backend/sessions/signals.py`
- `backend/sessions/tests.py`

**Backend — Modify:**
- `backend/backend/settings.py` — add `'sessions'` to `INSTALLED_APPS`
- `backend/backend/urls.py` — add `path('api/sessions/', include('sessions.urls'))`
- `backend/backend/email_service.py` — add `send_session_confirmation_email()`

**Frontend — Create:**
- `frontend/src/api/sessionsService.js`
- `frontend/src/stores/sessionsStore.js`
- `frontend/src/components/Sessions/SessionsSection.jsx`

**Frontend — Modify:**
- `frontend/src/components/Dashboard/ExecutionDashboard.jsx` — import and render `SessionsSection`

---

## Task 1: Create sessions app scaffold + models + migration

**Files:**
- Create: `backend/sessions/__init__.py`
- Create: `backend/sessions/apps.py`
- Create: `backend/sessions/models.py`
- Modify: `backend/backend/settings.py`

- [ ] **Step 1: Create the sessions app directory and `__init__.py`**

```bash
mkdir backend/sessions
touch backend/sessions/__init__.py
```

- [ ] **Step 2: Create `backend/sessions/apps.py`**

```python
from django.apps import AppConfig


class SessionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sessions'
    verbose_name = 'Session Booking'

    def ready(self):
        import sessions.signals  # noqa: F401
```

- [ ] **Step 3: Create `backend/sessions/models.py`**

```python
import uuid
from django.db import models
from django.conf import settings


class SessionRequest(models.Model):
    TOPIC_CHOICES = [
        ('roadmap', 'Roadmap'),
        ('portfolio', 'Portfolio'),
        ('career', 'Career Advice'),
        ('resume', 'Resume Help'),
        ('problem', 'Problem / Blocker'),
        ('other', 'Other'),
    ]

    STATUS_REQUESTED = 'requested'
    STATUS_CONFIRMED = 'confirmed'
    STATUS_COMPLETED = 'completed'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_REQUESTED, 'Requested'),
        (STATUS_CONFIRMED, 'Confirmed'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='session_requests',
    )
    topic_tags = models.JSONField(default=list, blank=True)
    description = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_REQUESTED)
    month_year = models.CharField(max_length=7)  # "YYYY-MM"
    scheduled_at = models.DateTimeField(null=True, blank=True)
    meeting_link = models.URLField(blank=True, default='')
    confirmed_at = models.DateTimeField(null=True, blank=True)
    admin_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'month_year']),
            models.Index(fields=['user', 'status']),
        ]

    def __str__(self):
        return f"{self.user} — {self.status} ({self.month_year})"


class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='session_notifications',
    )
    session = models.ForeignKey(
        SessionRequest,
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True,
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user} — {'read' if self.is_read else 'unread'}"
```

- [ ] **Step 4: Add `'sessions'` to `INSTALLED_APPS` in `backend/backend/settings.py`**

Find the end of INSTALLED_APPS list (before the closing `]`) and add:

```python
    'sessions',
```

- [ ] **Step 5: Create and run the migration**

```bash
cd backend
python manage.py makemigrations sessions
python manage.py migrate
```

Expected output: `Creating tables... sessions_sessionrequest, sessions_notification`

- [ ] **Step 6: Commit**

```bash
git add backend/sessions/ backend/backend/settings.py
git commit -m "feat(sessions): add SessionRequest and Notification models"
```

---

## Task 2: Write failing backend tests

**Files:**
- Create: `backend/sessions/tests.py`

- [ ] **Step 1: Create `backend/sessions/tests.py`**

```python
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
```

- [ ] **Step 2: Run tests to confirm they fail (views not implemented yet)**

```bash
cd backend
python manage.py test sessions -v 2
```

Expected: `FAIL` or `ERROR` on all test cases — this is correct at this stage.

- [ ] **Step 3: Commit**

```bash
git add backend/sessions/tests.py
git commit -m "test(sessions): add failing tests for session booking endpoints"
```

---

## Task 3: Implement serializers

**Files:**
- Create: `backend/sessions/serializers.py`

- [ ] **Step 1: Create `backend/sessions/serializers.py`**

```python
from rest_framework import serializers
from .models import SessionRequest, Notification


class SessionRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionRequest
        fields = ['topic_tags', 'description']

    def validate_topic_tags(self, value):
        valid = {'roadmap', 'portfolio', 'career', 'resume', 'problem', 'other'}
        for tag in value:
            if tag not in valid:
                raise serializers.ValidationError(f"'{tag}' is not a valid topic tag.")
        return value


class SessionRequestListSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionRequest
        fields = [
            'id', 'topic_tags', 'description', 'status',
            'month_year', 'scheduled_at', 'meeting_link',
            'confirmed_at', 'created_at',
        ]
        read_only_fields = fields


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at', 'session']
        read_only_fields = fields
```

- [ ] **Step 2: Commit**

```bash
git add backend/sessions/serializers.py
git commit -m "feat(sessions): add session request and notification serializers"
```

---

## Task 4: Implement views + URLs + register in main urls.py

**Files:**
- Create: `backend/sessions/views.py`
- Create: `backend/sessions/urls.py`
- Modify: `backend/backend/urls.py`

- [ ] **Step 1: Create `backend/sessions/views.py`**

```python
from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from subscriptions.models import Subscription
from .models import SessionRequest, Notification
from .serializers import (
    SessionRequestCreateSerializer,
    SessionRequestListSerializer,
    NotificationSerializer,
)


def _get_active_subscription(user):
    return Subscription.get_active_subscription(user)


def _sessions_used_this_month(user, month_year):
    return SessionRequest.objects.filter(
        user=user,
        month_year=month_year,
    ).exclude(status=SessionRequest.STATUS_CANCELLED).count()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_session(request):
    subscription = _get_active_subscription(request.user)
    if subscription is None:
        return Response(
            {'error': 'No active subscription found.'},
            status=status.HTTP_403_FORBIDDEN,
        )
    if subscription.plan.sessions_per_month == 0:
        return Response(
            {'error': 'Your plan does not include 1:1 sessions. Upgrade to Pro or Elite.'},
            status=status.HTTP_403_FORBIDDEN,
        )
    month_year = datetime.now().strftime('%Y-%m')
    used = _sessions_used_this_month(request.user, month_year)
    if used >= subscription.plan.sessions_per_month:
        return Response(
            {'error': 'You have used all your sessions for this month. Upgrade for more.'},
            status=status.HTTP_403_FORBIDDEN,
        )
    serializer = SessionRequestCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    session = serializer.save(
        user=request.user,
        month_year=month_year,
        status=SessionRequest.STATUS_REQUESTED,
    )
    return Response(SessionRequestListSerializer(session).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_sessions(request):
    sessions = SessionRequest.objects.filter(user=request.user)
    return Response(SessionRequestListSerializer(sessions, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def remaining_sessions(request):
    subscription = _get_active_subscription(request.user)
    limit = subscription.plan.sessions_per_month if subscription else 0
    month_year = datetime.now().strftime('%Y-%m')
    used = _sessions_used_this_month(request.user, month_year)
    return Response({
        'used': used,
        'limit': limit,
        'remaining': max(0, limit - used),
        'month': month_year,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_notifications(request):
    notifications = Notification.objects.filter(user=request.user, is_read=False)
    return Response(NotificationSerializer(notifications, many=True).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, pk):
    try:
        notification = Notification.objects.get(id=pk, user=request.user)
    except Notification.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    notification.is_read = True
    notification.save(update_fields=['is_read'])
    return Response({'status': 'marked as read'})
```

- [ ] **Step 2: Create `backend/sessions/urls.py`**

```python
from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_sessions, name='session-list'),
    path('request/', views.request_session, name='session-request'),
    path('remaining/', views.remaining_sessions, name='session-remaining'),
    path('notifications/', views.list_notifications, name='session-notifications'),
    path('notifications/<uuid:pk>/read/', views.mark_notification_read, name='session-notification-read'),
]
```

- [ ] **Step 3: Add sessions URL to `backend/backend/urls.py`**

Add this line inside `urlpatterns` in `backend/backend/urls.py`, after the last `path('api/...` entry before the JWT section:

```python
    path('api/sessions/', include('sessions.urls')),
```

- [ ] **Step 4: Commit**

```bash
git add backend/sessions/views.py backend/sessions/urls.py backend/backend/urls.py
git commit -m "feat(sessions): add session request views and URL routing"
```

---

## Task 5: Add session confirmation email function

**Files:**
- Modify: `backend/backend/email_service.py`

- [ ] **Step 1: Append `send_session_confirmation_email()` to `backend/backend/email_service.py`**

Add this at the end of the file:

```python
def send_session_confirmation_email(to_email, username, scheduled_at, meeting_link):
    """Send session confirmation email to user."""
    subject = "Your Planorah 1:1 Session is Confirmed!"
    scheduled_str = scheduled_at.strftime("%A, %B %d %Y at %I:%M %p") if scheduled_at else "To be communicated"
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px;">
      <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h2 style="color: #1a1a2e; margin-bottom: 8px;">Session Confirmed!</h2>
        <p style="color: #444;">Hi {username},</p>
        <p style="color: #444;">Your 1:1 mentor session has been confirmed. Here are the details:</p>
        <div style="background: #f0f4ff; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; color: #333;"><strong>Date &amp; Time:</strong> {scheduled_str}</p>
          <p style="margin: 4px 0; color: #333;"><strong>Join Link:</strong>
            <a href="{meeting_link}" style="color: #4f46e5;">{meeting_link}</a>
          </p>
        </div>
        <p style="color: #444;">Make sure to prepare any questions or topics you want to cover. We're looking forward to your session!</p>
        <p style="color: #888; font-size: 12px; margin-top: 32px;">Planorah · support@planorah.me</p>
      </div>
    </body>
    </html>
    """
    text_content = f"Your Planorah session is confirmed for {scheduled_str}. Join here: {meeting_link}"
    return send_email_via_brevo(to_email, subject, html_content, text_content)
```

- [ ] **Step 2: Commit**

```bash
git add backend/backend/email_service.py
git commit -m "feat(sessions): add session confirmation email template"
```

---

## Task 6: Implement the post_save signal

**Files:**
- Create: `backend/sessions/signals.py`

- [ ] **Step 1: Create `backend/sessions/signals.py`**

```python
import logging
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.utils import timezone

logger = logging.getLogger(__name__)

# Track previous status to detect confirmation transition
_previous_status = {}


@receiver(pre_save, sender='sessions.SessionRequest')
def capture_previous_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            _previous_status[instance.pk] = sender.objects.get(pk=instance.pk).status
        except sender.DoesNotExist:
            pass


@receiver(post_save, sender='sessions.SessionRequest')
def on_session_request_saved(sender, instance, created, **kwargs):
    if created:
        return

    prev = _previous_status.pop(instance.pk, None)
    if prev == instance.STATUS_CONFIRMED or instance.status != instance.STATUS_CONFIRMED:
        return

    # Status just transitioned to confirmed — send notification + email
    from .models import Notification
    from backend.email_service import send_session_confirmation_email

    Notification.objects.create(
        user=instance.user,
        session=instance,
        message=(
            f"Your 1:1 session has been confirmed! "
            f"{'Scheduled for ' + instance.scheduled_at.strftime('%b %d at %I:%M %p') if instance.scheduled_at else 'Details will follow.'}"
        ),
    )

    try:
        send_session_confirmation_email(
            to_email=instance.user.email,
            username=getattr(instance.user, 'username', instance.user.email),
            scheduled_at=instance.scheduled_at,
            meeting_link=instance.meeting_link or '',
        )
    except Exception:
        logger.exception("Failed to send session confirmation email for session %s", instance.pk)
```

- [ ] **Step 2: Commit**

```bash
git add backend/sessions/signals.py
git commit -m "feat(sessions): trigger notification + email on admin confirmation"
```

---

## Task 7: Implement Django admin customization

**Files:**
- Create: `backend/sessions/admin.py`

- [ ] **Step 1: Create `backend/sessions/admin.py`**

```python
from django.contrib import admin
from .models import SessionRequest, Notification


@admin.register(SessionRequest)
class SessionRequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'status', 'topic_tags', 'month_year', 'scheduled_at', 'created_at']
    list_filter = ['status', 'month_year']
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['id', 'user', 'created_at', 'month_year', 'confirmed_at']
    fields = [
        'id', 'user', 'topic_tags', 'description',
        'status', 'month_year', 'scheduled_at', 'meeting_link',
        'confirmed_at', 'admin_notes', 'created_at',
    ]
    ordering = ['-created_at']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'message', 'is_read', 'created_at']
    list_filter = ['is_read']
    readonly_fields = ['id', 'user', 'session', 'message', 'created_at']
```

- [ ] **Step 2: Commit**

```bash
git add backend/sessions/admin.py
git commit -m "feat(sessions): customize Django admin for SessionRequest and Notification"
```

---

## Task 8: Run all backend tests and verify they pass

- [ ] **Step 1: Run the full sessions test suite**

```bash
cd backend
python manage.py test sessions -v 2
```

Expected output:
```
test_cancelled_sessions_do_not_count_toward_quota ... ok
test_free_plan_cannot_request_session ... ok
test_mark_notification_read ... ok
test_notifications_list ... ok
test_pro_plan_can_request_session ... ok
test_pro_plan_quota_exhausted_blocks_request ... ok
test_remaining_returns_correct_counts ... ok
test_request_created_with_correct_month_year ... ok
test_request_without_tags_or_description_succeeds ... ok
test_list_returns_only_own_sessions ... ok
test_admin_notes_not_exposed ... ok
test_unauthenticated_cannot_request ... ok

Ran 12 tests in X.XXXs
OK
```

If any test fails, fix the issue before proceeding.

- [ ] **Step 2: Commit if any fixes were needed**

```bash
git add -p
git commit -m "fix(sessions): resolve test failures"
```

---

## Task 9: Frontend — sessionsService.js

**Files:**
- Create: `frontend/src/api/sessionsService.js`

- [ ] **Step 1: Create `frontend/src/api/sessionsService.js`**

```javascript
import api from './axios';

export const sessionsService = {
    requestSession: async (topicTags = [], description = '') => {
        const response = await api.post('sessions/request/', {
            topic_tags: topicTags,
            description,
        });
        return response.data;
    },

    listSessions: async () => {
        const response = await api.get('sessions/');
        return response.data;
    },

    getRemaining: async () => {
        const response = await api.get('sessions/remaining/');
        return response.data;
    },

    listNotifications: async () => {
        const response = await api.get('sessions/notifications/');
        return response.data;
    },

    markNotificationRead: async (id) => {
        const response = await api.patch(`sessions/notifications/${id}/read/`);
        return response.data;
    },
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/api/sessionsService.js
git commit -m "feat(sessions): add sessions API service"
```

---

## Task 10: Frontend — sessionsStore.js

**Files:**
- Create: `frontend/src/stores/sessionsStore.js`

- [ ] **Step 1: Create `frontend/src/stores/sessionsStore.js`**

```javascript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { sessionsService } from '../api/sessionsService';

export const useSessionsStore = create(
    devtools(
        (set, get) => ({
            sessions: [],
            remaining: { used: 0, limit: 0, remaining: 0, month: '' },
            notifications: [],
            isLoading: false,
            isSubmitting: false,
            error: null,

            fetchSessions: async () => {
                set({ isLoading: true, error: null }, false, 'sessionsStore/fetchSessions');
                try {
                    const [sessions, remaining, notifications] = await Promise.all([
                        sessionsService.listSessions(),
                        sessionsService.getRemaining(),
                        sessionsService.listNotifications(),
                    ]);
                    set({ sessions, remaining, notifications, isLoading: false }, false, 'sessionsStore/fetchSessions/success');
                } catch {
                    set({ isLoading: false, error: 'Failed to load sessions.' }, false, 'sessionsStore/fetchSessions/error');
                }
            },

            submitRequest: async (topicTags, description) => {
                set({ isSubmitting: true, error: null }, false, 'sessionsStore/submitRequest');
                try {
                    const newSession = await sessionsService.requestSession(topicTags, description);
                    set(
                        (state) => ({
                            sessions: [newSession, ...state.sessions],
                            remaining: {
                                ...state.remaining,
                                used: state.remaining.used + 1,
                                remaining: Math.max(0, state.remaining.remaining - 1),
                            },
                            isSubmitting: false,
                        }),
                        false,
                        'sessionsStore/submitRequest/success',
                    );
                    return { success: true };
                } catch (err) {
                    const message = err?.response?.data?.error || 'Failed to submit request.';
                    set({ isSubmitting: false, error: message }, false, 'sessionsStore/submitRequest/error');
                    return { success: false, error: message };
                }
            },

            markNotificationRead: async (id) => {
                await sessionsService.markNotificationRead(id);
                set(
                    (state) => ({
                        notifications: state.notifications.filter((n) => n.id !== id),
                    }),
                    false,
                    'sessionsStore/markNotificationRead',
                );
            },

            clearError: () => set({ error: null }, false, 'sessionsStore/clearError'),
        }),
        { name: 'sessionsStore' }
    )
);
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/stores/sessionsStore.js
git commit -m "feat(sessions): add sessions Zustand store"
```

---

## Task 11: Frontend — SessionsSection component

**Files:**
- Create: `frontend/src/components/Sessions/SessionsSection.jsx`

- [ ] **Step 1: Create the directory**

```bash
mkdir frontend/src/components/Sessions
```

- [ ] **Step 2: Create `frontend/src/components/Sessions/SessionsSection.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { Calendar, Clock, Video, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useSessionsStore } from '../../stores/sessionsStore';

const TOPIC_OPTIONS = [
    { value: 'roadmap', label: 'Roadmap' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'career', label: 'Career Advice' },
    { value: 'resume', label: 'Resume Help' },
    { value: 'problem', label: 'Problem / Blocker' },
    { value: 'other', label: 'Other' },
];

const STATUS_CONFIG = {
    requested: { label: 'Requested', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
    confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

function RequestModal({ onClose }) {
    const { submitRequest, isSubmitting, error, clearError } = useSessionsStore();
    const [selectedTags, setSelectedTags] = useState([]);
    const [description, setDescription] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const toggleTag = (value) => {
        setSelectedTags((prev) =>
            prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
        );
    };

    const handleSubmit = async () => {
        const result = await submitRequest(selectedTags, description);
        if (result.success) {
            setSubmitted(true);
            setTimeout(onClose, 1500);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1a1a1a] p-6 shadow-xl mx-4">
                {submitted ? (
                    <div className="text-center py-4">
                        <div className="text-4xl mb-3">✅</div>
                        <p className="text-gray-800 dark:text-white font-semibold">Request sent! We'll get back to you within 12 hours.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request a 1:1 Session</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Select a topic and optionally describe what you'd like to discuss. We'll confirm a time within 12 hours.
                        </p>

                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topic (optional)</p>
                            <div className="flex flex-wrap gap-2">
                                {TOPIC_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => toggleTag(opt.value)}
                                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                                            selectedTags.includes(opt.value)
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-indigo-400'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description (optional)</p>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe what you'd like to discuss..."
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111] text-gray-800 dark:text-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                rows={3}
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 mb-3">{error}</p>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-sm font-medium transition-colors disabled:opacity-60"
                            >
                                {isSubmitting ? 'Sending…' : 'Request Session'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function SessionsSection() {
    const { sessions, remaining, notifications, isLoading, fetchSessions, markNotificationRead } = useSessionsStore();
    const [modalOpen, setModalOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const canRequest = remaining.remaining > 0;
    const visibleSessions = expanded ? sessions : sessions.slice(0, 3);

    return (
        <div className="rounded-2xl border-0 bg-white dark:bg-[#1a1a1a] p-6 shadow-[0_8px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]">
            {/* Unread notifications */}
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    className="flex items-start justify-between gap-3 mb-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 p-3"
                >
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">{notif.message}</p>
                    <button
                        onClick={() => markNotificationRead(notif.id)}
                        className="text-indigo-400 hover:text-indigo-600 shrink-0"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar size={18} className="text-indigo-500" />
                        1:1 Mentor Sessions
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {remaining.limit === 0
                            ? 'Upgrade to Pro or Elite to access sessions'
                            : `${remaining.remaining} of ${remaining.limit} sessions remaining this month`}
                    </p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    disabled={!canRequest}
                    title={!canRequest ? (remaining.limit === 0 ? 'Upgrade your plan to book sessions' : 'Monthly session limit reached') : undefined}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white px-4 py-2 text-sm font-medium transition-colors"
                >
                    Request Session
                </button>
            </div>

            {/* Sessions list */}
            {isLoading ? (
                <p className="text-sm text-gray-400 text-center py-4">Loading…</p>
            ) : sessions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No sessions yet. Request your first one!</p>
            ) : (
                <>
                    <div className="space-y-3">
                        {visibleSessions.map((session) => {
                            const cfg = STATUS_CONFIG[session.status] || STATUS_CONFIG.requested;
                            return (
                                <div
                                    key={session.id}
                                    className="rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-start justify-between gap-3"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {session.topic_tags && session.topic_tags.length > 0 ? (
                                                session.topic_tags.map((tag) => (
                                                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                                        {tag}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-400">No topic</span>
                                            )}
                                        </div>
                                        {session.description && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{session.description}</p>
                                        )}
                                        {session.status === 'confirmed' && session.scheduled_at && (
                                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {new Date(session.scheduled_at).toLocaleString()}
                                                </span>
                                                {session.meeting_link && (
                                                    <a
                                                        href={session.meeting_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                                                    >
                                                        <Video size={12} />
                                                        Join Session
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${cfg.color}`}>
                                        {cfg.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {sessions.length > 3 && (
                        <button
                            onClick={() => setExpanded((v) => !v)}
                            className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            {expanded ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show {sessions.length - 3} more</>}
                        </button>
                    )}
                </>
            )}

            {modalOpen && <RequestModal onClose={() => { setModalOpen(false); useSessionsStore.getState().clearError(); }} />}
        </div>
    );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Sessions/
git commit -m "feat(sessions): add SessionsSection component with request modal"
```

---

## Task 12: Integrate SessionsSection into ExecutionDashboard

**Files:**
- Modify: `frontend/src/components/Dashboard/ExecutionDashboard.jsx`

- [ ] **Step 1: Add the import at the top of `ExecutionDashboard.jsx`**

After the last import line in `frontend/src/components/Dashboard/ExecutionDashboard.jsx`, add:

```javascript
import SessionsSection from '../Sessions/SessionsSection';
```

- [ ] **Step 2: Add `<SessionsSection />` in the dashboard JSX**

Find the return statement's JSX in `ExecutionDashboard.jsx`. Add `<SessionsSection />` as a card within the grid/column layout, alongside the other dashboard cards like `ProgressPanel` or `PerformanceChart`. The exact location will depend on the layout, but place it in the right column or after the progress section:

```jsx
<SessionsSection />
```

- [ ] **Step 3: Start the dev server and verify**

```bash
cd frontend
npm start
```

Open the dashboard. Verify:
- "1:1 Mentor Sessions" card appears
- Free plan users see "Upgrade to Pro or Elite to access sessions" and a disabled button
- Pro/Elite users see the remaining count and an active "Request Session" button
- Clicking the button opens the modal with topic chips + description
- Submitting shows success state and modal closes
- New session appears in the list with "Requested" badge

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Dashboard/ExecutionDashboard.jsx
git commit -m "feat(sessions): integrate SessionsSection into ExecutionDashboard"
```

---

## Self-Review Checklist

- [x] **Free plan gate** — Task 4 views.py returns 403 when `sessions_per_month == 0`; Task 11 disables button in UI
- [x] **Monthly quota gate** — Task 4 counts non-cancelled sessions for current month_year
- [x] **Cancelled sessions excluded** — `exclude(status='cancelled')` in `_sessions_used_this_month`
- [x] **admin_notes never exposed** — excluded from `SessionRequestListSerializer.fields`
- [x] **Email on confirmation** — Task 6 signal fires when status transitions to `confirmed`
- [x] **In-app notification** — Task 6 creates `Notification` record on confirmation
- [x] **Notification mark-read** — Task 4 + Task 9 + Task 10 + Task 11 all consistent
- [x] **Status machine** — `STATUS_REQUESTED/CONFIRMED/COMPLETED/CANCELLED` constants used consistently across models, views, serializers, signal, frontend
- [x] **Type consistency** — `topic_tags` is JSONField (list) backend, array frontend throughout
- [x] **month_year format** — `datetime.now().strftime('%Y-%m')` used consistently in views and tests
- [x] **UUID pk** — used on both `SessionRequest` and `Notification`; frontend notification mark-read uses UUID in URL `<uuid:pk>`
