"""
Task validation API views.
Handles task submission, validation, and status retrieval.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q

from .models import Task
from tasks.models import TaskAttempt
from tasks.serializers import (
    TaskSerializer,
    TaskSubmitSerializer,
    TaskAttemptListSerializer,
    TaskAttemptDetailSerializer,
)
from tasks.validators import run_validation


class TaskViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Task CRUD operations.
    Tasks are immutable contracts - can only create/read, never update.
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    queryset = Task.objects.all()
    lookup_field = 'task_id'

    def get_serializer_context(self):
        """Add request to serializer context for user-specific data"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """
        Get all tasks for current user's roadmaps with status.

        Returns tasks with derived status and latest attempt.
        """
        # Get user's roadmaps
        user_roadmaps = Task.objects.filter(roadmap__user=request.user)
        user_milestone_tasks = Task.objects.filter(
            milestone__roadmap__user=request.user)

        tasks = (user_roadmaps | user_milestone_tasks).distinct().order_by('order')
        serializer = self.get_serializer(tasks, many=True)

        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def attempts(self, request, task_id=None):
        """
        Get all attempts for this task by current user.

        Shows attempt history - this is the audit trail.
        """
        task = self.get_object()
        attempts = task.attempts.filter(
            user=request.user).order_by('-submitted_at')

        serializer = TaskAttemptListSerializer(attempts, many=True)
        return Response({
            'task_id': task.task_id,
            'task_objective': task.objective,
            'total_attempts': attempts.count(),
            'attempts': serializer.data
        })

    @action(detail=True, methods=['post'])
    def submit_attempt(self, request, task_id=None):
        """
        Submit proof for a task.

        Creates new TaskAttempt (PENDING status) and triggers validation.

        Request body:
        {
            "proof_payload": {
                "repo_url": "https://github.com/user/repo"  # for GITHUB_REPO
                OR
                "answers": {"q1": "a", "q2": "b"}  # for QUIZ
                OR
                "file_url": "s3://bucket/file.pdf"  # for FILE_UPLOAD
                OR
                "live_url": "https://deployed.app"  # for URL
            }
        }
        """
        task = self.get_object()

        # Check if user can attempt
        if not task.can_attempt(request.user):
            return Response(
                {'error': f'Maximum attempts ({task.max_attempts}) reached for this task'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        serializer = TaskSubmitSerializer(
            data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Save attempt (initially PENDING)
        attempt = serializer.save(task=task)

        # Run validation asynchronously (or sync for MVP)
        validation_result = run_validation(
            task, attempt.proof_payload, task.acceptance_rules)

        # Update attempt with validation results
        attempt.validator_output = validation_result
        attempt.validation_status = validation_result.get('status', 'PENDING')
        attempt.score = validation_result.get('score')
        attempt.validated_at = timezone.now()
        attempt.save()

        # Return result
        response_serializer = TaskAttemptDetailSerializer(attempt)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class TaskAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only access to task attempts.
    Attempts are immutable - created via Task.submit_attempt endpoint.
    """
    serializer_class = TaskAttemptDetailSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'attempt_id'

    def get_queryset(self):
        """Users can only see their own attempts"""
        return TaskAttempt.objects.filter(user=self.request.user).order_by('-submitted_at')

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending validations for current user"""
        pending_attempts = TaskAttempt.objects.filter(
            user=request.user,
            validation_status='PENDING'
        ).order_by('-submitted_at')

        serializer = TaskAttemptListSerializer(pending_attempts, many=True)
        return Response({
            'pending_count': pending_attempts.count(),
            'attempts': serializer.data
        })

    @action(detail=False, methods=['get'])
    def passed(self, request):
        """Get all passed validations for current user"""
        passed_attempts = TaskAttempt.objects.filter(
            user=request.user,
            validation_status='PASS'
        ).order_by('-submitted_at')

        serializer = TaskAttemptListSerializer(passed_attempts, many=True)
        return Response({
            'passed_count': passed_attempts.count(),
            'attempts': serializer.data
        })

    @action(detail=False, methods=['get'])
    def failed(self, request):
        """Get all failed validations for current user"""
        failed_attempts = TaskAttempt.objects.filter(
            user=request.user,
            validation_status='FAIL'
        ).order_by('-submitted_at')

        serializer = TaskAttemptListSerializer(failed_attempts, many=True)
        return Response({
            'failed_count': failed_attempts.count(),
            'attempts': serializer.data
        })


class OutputEligibilityView:
    """
    Check if user is eligible to generate output (resume, portfolio, etc).

    Rules:
    - All core tasks must have at least one PASS attempt
    - No pending validations for core tasks
    - User state must allow output
    """

    @staticmethod
    def check_eligibility(user):
        """
        Check output eligibility for a user.

        Returns:
        {
            'eligible': bool,
            'passed_core_tasks': int,
            'total_core_tasks': int,
            'pending_tasks': [...],
            'failed_tasks': [...],
            'reasons': [...]
        }
        """
        core_tasks = Task.objects.filter(is_core_task=True)
        total_core = core_tasks.count()

        passed_core = 0
        pending_tasks = []
        failed_tasks = []
        reasons = []

        for task in core_tasks:
            latest_attempt = task.attempts.filter(
                user=user).order_by('-submitted_at').first()

            if not latest_attempt:
                failed_tasks.append({
                    'task_id': str(task.task_id),
                    'objective': task.objective,
                    'status': 'NOT_STARTED'
                })
                reasons.append(
                    f"Core task not attempted: {task.objective[:50]}")
            elif latest_attempt.validation_status == 'PASS':
                passed_core += 1
            elif latest_attempt.validation_status == 'PENDING':
                pending_tasks.append({
                    'task_id': str(task.task_id),
                    'objective': task.objective,
                    'attempt_id': str(latest_attempt.attempt_id),
                    'submitted_at': latest_attempt.submitted_at
                })
                reasons.append(f"Core task pending: {task.objective[:50]}")
            else:  # FAIL
                failed_tasks.append({
                    'task_id': str(task.task_id),
                    'objective': task.objective,
                    'status': 'FAILED',
                    'score': latest_attempt.score
                })
                reasons.append(
                    f"Core task failed: {task.objective[:50]} (score: {latest_attempt.score})")

        eligible = (passed_core == total_core and len(pending_tasks) == 0)

        return {
            'eligible': eligible,
            'passed_core_tasks': passed_core,
            'total_core_tasks': total_core,
            'pending_tasks': pending_tasks,
            'failed_tasks': failed_tasks,
            'reasons': reasons if not eligible else []
        }
