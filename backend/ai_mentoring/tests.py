from django.test import TestCase
from django.contrib.auth import get_user_model
from typing import cast
from rest_framework.test import APIClient
from rest_framework.response import Response
from rest_framework import status
from ai_mentoring.models import StudentSession

User = get_user_model()


class StudentSessionModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
        )

    def test_create_session(self):
        session = StudentSession.objects.create(
            user=self.user,
            context_source='roadmap',
            transcript='I need help with my roadmap',
            mentor_message='Here is my guidance...',
            emotional_tone='encouraging',
            confidence_level=0.7,
            clarity_level=0.8,
            action_items=['Step 1', 'Step 2'],
            session_summary='Student asked about roadmap progress.',
        )
        self.assertIsNotNone(session.id)
        self.assertEqual(session.user, self.user)
        self.assertEqual(session.context_source, 'roadmap')

    def test_session_ordering(self):
        StudentSession.objects.create(
            user=self.user, context_source='roadmap',
            transcript='First', mentor_message='R1',
        )
        StudentSession.objects.create(
            user=self.user, context_source='dashboard',
            transcript='Second', mentor_message='R2',
        )
        sessions = StudentSession.objects.filter(user=self.user)
        self.assertEqual(sessions[0].context_source, 'dashboard')


class MentoringAPITest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='apiuser',
            email='api@example.com',
            password='testpass123',
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_create_session_missing_fields(self):
        response = cast(Response, self.client.post(
            '/api/ai-mentoring/session/', {}))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_sessions_empty(self):
        response = cast(Response, self.client.get(
            '/api/ai-mentoring/sessions/'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_unauthenticated_rejected(self):
        unauthenticated_client = APIClient()
        response = cast(Response, unauthenticated_client.post('/api/ai-mentoring/session/', {
            'context_source': 'roadmap',
            'transcript': 'Hello',
        }))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
