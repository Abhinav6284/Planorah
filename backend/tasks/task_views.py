"""
Task API views with strict validation.
"""
from rest_framework import viewsets, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.db.models import Q
from .models import Task, TaskAttempt, TaskValidator
from .serializers import (
    TaskSerializer, TaskAttemptDetailSerializer, TaskSubmitSerializer,
    TaskAttemptListSerializer, OutputEligibilitySerializer
)
from .validators import run_validation
from .prevalidation import PreValidator
from .stagnation import StagnationDetector, apply_difficulty_downgrade, suggest_scope_reduction
from .explainability import generate_clear_feedback


class TaskViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only tasks with submit_attempt action for proof submission.
    Tasks are immutable contracts - no user can modify them.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        """Get tasks for current user's active roadmaps."""
        user = self.request.user

        # Get user's roadmaps
        from roadmap_ai.models import Roadmap
        user_roadmaps = Roadmap.objects.filter(user=user)

        # Start with tasks for the current user's roadmaps.
        queryset = Task.objects.filter(
            roadmap__in=user_roadmaps,
            user=user
        ).select_related('roadmap', 'milestone')

        # Optional filters used by frontend TaskList.
        status_param = self.request.query_params.get('status')
        if status_param and status_param != 'all':
            queryset = queryset.filter(status=status_param)

        roadmap_param = self.request.query_params.get(
            'roadmap') or self.request.query_params.get('roadmap_id')
        if roadmap_param and roadmap_param != 'all':
            try:
                roadmap_id = int(roadmap_param)
            except (TypeError, ValueError):
                return queryset.none()
            queryset = queryset.filter(roadmap_id=roadmap_id)

        day_param = self.request.query_params.get('day')
        if day_param:
            try:
                day = int(day_param)
            except (TypeError, ValueError):
                return queryset.none()
            queryset = queryset.filter(day=day)

        due_date_param = self.request.query_params.get('due_date')
        if due_date_param:
            parsed_due_date = parse_date(due_date_param)
            if not parsed_due_date:
                return queryset.none()
            queryset = queryset.filter(due_date=parsed_due_date)

        return queryset.order_by('day', 'task_id')

    def list(self, request, *args, **kwargs):
        """List tasks with lightweight meta for better frontend empty states."""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(
            queryset,
            many=True,
            context={**self.get_serializer_context(), 'skip_attempt_stats': True}
        )
        tasks_data = serializer.data

        selected_status = request.query_params.get('status') or 'all'
        selected_roadmap = request.query_params.get(
            'roadmap') or request.query_params.get('roadmap_id') or 'all'

        meta = {
            'selected_status': selected_status,
            'selected_roadmap': selected_roadmap,
            'result_count': len(tasks_data),
            'empty_reason': None,
            'selected_roadmap_name': None,
            'total_for_selected_roadmap': None,
        }

        if selected_roadmap != 'all':
            from roadmap_ai.models import Roadmap

            try:
                selected_roadmap_id = int(selected_roadmap)
            except (TypeError, ValueError):
                selected_roadmap_id = None

            roadmap = None
            if selected_roadmap_id is not None:
                roadmap = Roadmap.objects.filter(
                    user=request.user, id=selected_roadmap_id).only('id', 'title').first()
            if not roadmap:
                meta['empty_reason'] = 'roadmap_not_found'
            else:
                total_for_roadmap = Task.objects.filter(
                    user=request.user, roadmap_id=roadmap.id).count()
                meta['selected_roadmap_name'] = roadmap.title
                meta['total_for_selected_roadmap'] = total_for_roadmap

                if total_for_roadmap == 0:
                    meta['empty_reason'] = 'no_tasks_for_roadmap'
                elif selected_status != 'all' and len(tasks_data) == 0:
                    meta['empty_reason'] = 'no_tasks_for_status'
        elif selected_status != 'all' and len(tasks_data) == 0:
            meta['empty_reason'] = 'no_tasks_for_status'

        return Response({'tasks': tasks_data, 'meta': meta}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def submit_attempt(self, request, pk=None):
        """
        Submit proof for a task.

        POST /tasks/{task_id}/submit_attempt/
        Body: {
            "proof_payload": {
                "repo_url": "https://github.com/user/repo"  // for GitHub
                "answers": {"q1": "answer", ...}             // for Quiz
            }
        }
        """
        task = self.get_object()

        # Check if user can attempt
        if not task.can_attempt(request.user):
            return Response(
                {
                    'error': f'Maximum attempts ({task.max_attempts}) reached',
                    'status': 'MAXED_OUT'
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        # Validate proof submission
        serializer = TaskSubmitSerializer(
            data=request.data,
            context={'request': request, 'task': task}
        )

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # PRE-VALIDATION for manual submissions
        if task.validator_type == 'MANUAL':
            prevalidator = PreValidator(
                proof_type=task.proof_type,
                proof_payload=serializer.validated_data['proof_payload']
            )
            should_proceed, prevalidation_result = prevalidator.validate()

            if not should_proceed:
                # Reject immediately - don't create attempt
                return Response(
                    {
                        'error': 'Submission failed pre-validation',
                        'details': prevalidation_result,
                        'status': 'REJECTED'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Store pre-validation result for reviewer
            serializer.validated_data['proof_payload']['_prevalidation'] = prevalidation_result

        # Create attempt
        attempt = serializer.save()

        # Run validation
        validation_result = run_validation(
            task,
            attempt.proof_payload,
            task.acceptance_rules,
            user=request.user,  # Pass user for GitHub username
            task_started_at=task.created_at  # Pass task creation time
        )

        # Update attempt with validation results
        attempt.validator_output = validation_result
        attempt.validation_status = validation_result.get('status', 'PENDING')
        attempt.score = validation_result.get('score')

        if attempt.validation_status in ['PASS', 'FAIL']:
            attempt.validated_at = timezone.now()

        attempt.save()

        # CRITICAL: Update task completion if PASS
        if attempt.validation_status == 'PASS' and attempt.score >= task.minimum_pass_score:
            task.update_completion_status(attempt)

        # EXPLAINABILITY LAYER - Generate clear feedback
        explanation = generate_clear_feedback(
            validation_status=attempt.validation_status,
            validator_output=validation_result,
            proof_type=task.proof_type,
            prevalidation_result=serializer.validated_data.get(
                'proof_payload', {}).get('_prevalidation')
        )

        # Return full attempt details WITH clear explanation
        response_data = {
            'attempt': TaskAttemptDetailSerializer(attempt).data,
            'explanation': explanation,
            'can_retry': task.can_attempt(request.user),
            'attempts_remaining': None if task.max_attempts is None else max(0, task.max_attempts - attempt.attempt_number)
        }

        return Response(response_data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'])
    def reschedule(self, request, pk=None):
        """
        Update due_date and/or day for a task.
        PATCH /tasks/{task_id}/reschedule/
        """
        task = self.get_object()
        day = request.data.get('day')
        due_date = request.data.get('due_date')
        if day is not None:
            task.day = int(day)
        if due_date is not None:
            task.due_date = due_date
        task.save(update_fields=[f for f in ['day', 'due_date'] if request.data.get(
            f) is not None] or ['due_date'])
        return Response(self.get_serializer(task).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'])
    def complete(self, request, pk=None):
        """
        Mark a task as complete for tasks that require no validation.
        PATCH /tasks/{task_id}/complete/
        """
        task = self.get_object()

        # Already completed
        if task.status == 'completed':
            serializer = self.get_serializer(task)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Enforce validation requirements
        if task.validator_type != 'none' or task.proof_type != 'none':
            return Response(
                {
                    'error': 'This task requires validation. Submit proof instead.',
                    'status': 'VALIDATION_REQUIRED'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        task.mark_complete()
        serializer = self.get_serializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending attempts for current user."""
        pending_attempts = TaskAttempt.objects.filter(
            user=request.user,
            validation_status='PENDING'
        ).select_related('task')

        serializer = TaskAttemptDetailSerializer(pending_attempts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Get all completed (passed) tasks for current user."""
        # Get tasks that have been passed (using first_passed_at)
        completed_tasks = self.get_queryset().filter(
            first_passed_at__isnull=False
        )

        serializer = TaskSerializer(
            completed_tasks, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def guidance(self, request, pk=None):
        """
        Return lightweight, deterministic guidance for a task.
        Frontend expects this endpoint at: /tasks/{task_id}/guidance/
        """
        task = self.get_object()

        objective = task.objective or task.description or f"Complete: {task.title}"

        time_breakdown = [
            {
                'duration': f"{max(5, int((task.estimated_minutes or 60) * 0.15))} min",
                'activity': 'Review objective and success criteria'
            },
            {
                'duration': f"{max(15, int((task.estimated_minutes or 60) * 0.7))} min",
                'activity': 'Execute focused work on the core task'
            },
            {
                'duration': f"{max(5, int((task.estimated_minutes or 60) * 0.15))} min",
                'activity': 'Validate output and document what you finished'
            },
        ]

        acceptance_rules = task.acceptance_rules if isinstance(
            task.acceptance_rules, dict) else {}

        steps = [
            {
                'step': 1,
                'title': 'Clarify Target Outcome',
                'description': objective,
            },
            {
                'step': 2,
                'title': 'Prepare Inputs',
                'description': 'Open the required tools/resources and define a small, shippable scope for this session.',
            },
            {
                'step': 3,
                'title': 'Execute and Validate',
                'description': 'Complete the core work, then verify against task rules before marking progress.',
            },
            {
                'step': 4,
                'title': 'Log Progress',
                'description': 'Capture what changed, blockers, and your next action so momentum is preserved.',
            },
        ]

        best_practices = [
            'Work in one focused block without multitasking.',
            'Validate deliverables against acceptance criteria before finishing.',
            'Leave a short note for your next session to reduce restart time.',
        ]

        common_mistakes = [
            'Starting without defining what done looks like.',
            'Over-scoping the session and not finishing a concrete output.',
            'Skipping validation/proof checks at the end.',
        ]

        if acceptance_rules:
            best_practices.append(
                'Use the task acceptance rules as a final checklist.')

        response_data = {
            'generated': True,
            'objective': objective,
            'time_breakdown': time_breakdown,
            'steps': steps,
            'best_practices': best_practices,
            'common_mistakes': common_mistakes,
            'expected_outcome': f"A completed output for '{task.title}' that meets validation requirements.",
            'proof_type': task.proof_type,
            'validator_type': task.validator_type,
            'acceptance_rules': acceptance_rules,
        }

        return Response(response_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def failed(self, request):
        """Get all tasks with recent failures (no pass yet)."""
        # Get tasks where user has attempts but no pass yet
        failed_tasks = []
        for task in self.get_queryset().filter(first_passed_at__isnull=True):
            latest_attempt = TaskAttempt.objects.filter(
                user=request.user,
                task=task
            ).order_by('-submitted_at').first()

            if latest_attempt and latest_attempt.validation_status == 'FAIL':
                failed_tasks.append(task)

        serializer = TaskSerializer(
            failed_tasks, many=True, context={'request': request})
        return Response(serializer.data)


class TaskAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only task attempts - audit trail of proof submissions.
    Attempts are immutable - never modified or deleted.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = TaskAttemptDetailSerializer

    def get_queryset(self):
        """Get attempts by current user."""
        return TaskAttempt.objects.filter(
            user=self.request.user
        ).select_related('task', 'manual_review', 'manual_review__reviewer').order_by('-submitted_at')

    @action(detail=False, methods=['get'])
    def by_task(self, request):
        """
        Get all attempts for a specific task.
        Query param: task_id
        """
        task_id = request.query_params.get('task_id')

        if not task_id:
            return Response(
                {'error': 'task_id query parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        attempts = self.get_queryset().filter(task__task_id=task_id)
        serializer = TaskAttemptDetailSerializer(attempts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending attempts for current user."""
        attempts = self.get_queryset().filter(validation_status='PENDING')
        serializer = TaskAttemptDetailSerializer(attempts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def passed(self, request):
        """Get all passed attempts for current user."""
        attempts = self.get_queryset().filter(validation_status='PASS')
        serializer = TaskAttemptDetailSerializer(attempts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def failed(self, request):
        """Get all failed attempts for current user."""
        attempts = self.get_queryset().filter(validation_status='FAIL')
        serializer = TaskAttemptDetailSerializer(attempts, many=True)
        return Response(serializer.data)


class OutputEligibilityView(views.APIView):
    """
    Check if user is eligible to generate output using weighted scoring.

    Logic:
    - Core tasks (is_core_task=True): ALL must PASS (100% required)
    - Support tasks (is_core_task=False): Weighted average must be ≥70%
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        GET /tasks/output-eligibility/

        Returns:
        {
            "is_eligible": true,
            "core_status": {
                "completed": 5,
                "total": 5,
                "all_passed": true
            },
            "support_status": {
                "weighted_score": 85.5,
                "required_score": 70.0,
                "passed": true
            },
            "remaining_core_tasks": [],
            "message": "Eligible for output generation"
        }
        """
        user = request.user

        # Get user's roadmaps
        from roadmap_ai.models import Roadmap
        user_roadmaps = Roadmap.objects.filter(user=user)

        # Get core tasks
        core_tasks = Task.objects.filter(
            roadmap__in=user_roadmaps,
            user=user,
            is_core_task=True
        )

        # Get support tasks
        support_tasks = Task.objects.filter(
            roadmap__in=user_roadmaps,
            user=user,
            is_core_task=False
        ).exclude(proof_type='none')  # Exclude tasks with no validation

        # ===== CORE TASKS: ALL MUST PASS =====
        total_core = core_tasks.count()
        completed_core = 0
        remaining_core = []

        for task in core_tasks:
            # Use first_passed_at to check completion (not latest attempt)
            if task.first_passed_at:
                completed_core += 1
            else:
                remaining_core.append({
                    'task_id': str(task.task_id),
                    'title': task.title,
                    'proof_type': task.proof_type
                })

        all_core_passed = (completed_core == total_core) and (total_core > 0)

        # ===== SUPPORT TASKS: WEIGHTED SCORE ≥70% =====
        total_weight = 0
        weighted_score_sum = 0
        support_task_details = []

        for task in support_tasks:
            weight = task.weight if task.weight > 0 else 1
            total_weight += weight

            # Check if passed using first_passed_at
            if task.first_passed_at and task.best_pass_score:
                task_score = task.best_pass_score
                weighted_score_sum += (task_score * weight)
                support_task_details.append({
                    'task_id': str(task.task_id),
                    'title': task.title,
                    'weight': weight,
                    'score': task_score,
                    'passed': True
                })
            else:
                # Not passed - contributes 0
                support_task_details.append({
                    'task_id': str(task.task_id),
                    'title': task.title,
                    'weight': weight,
                    'score': 0,
                    'passed': False
                })

        # Calculate weighted average
        if total_weight > 0:
            weighted_avg = weighted_score_sum / total_weight
        else:
            weighted_avg = 100.0  # No support tasks = automatically pass

        support_passed = weighted_avg >= 70.0

        # ===== FINAL ELIGIBILITY =====
        # Check for admin override first
        from .remediation_models import EligibilityOverride

        active_override = EligibilityOverride.objects.filter(
            user=user,
            roadmap__in=user_roadmaps,
            is_active=True
        ).order_by('-created_at').first()

        if active_override:
            # Override active - user is eligible
            is_eligible = True
            message = f"✅ Eligible (Admin Override: {active_override.justification[:50]}...)"
        else:
            # Normal eligibility logic
            is_eligible = all_core_passed and support_passed

            # Message
            if is_eligible:
                message = "✅ Eligible for output generation"
            elif not all_core_passed:
                message = f"❌ Complete {len(remaining_core)} core task(s) to unlock eligibility"
            elif not support_passed:
                message = f"❌ Support task score: {weighted_avg:.1f}% (need 70%)"
            else:
                message = "❌ Not eligible for output generation"

        serializer = OutputEligibilitySerializer({
            'is_eligible': is_eligible,
            'core_status': {
                'completed': completed_core,
                'total': total_core,
                'all_passed': all_core_passed,
                'remaining': remaining_core
            },
            'support_status': {
                'weighted_score': round(weighted_avg, 2),
                'required_score': 70.0,
                'passed': support_passed,
                'total_weight': total_weight,
                'tasks': support_task_details
            },
            'message': message
        })

        return Response(serializer.data)


class StagnationCheckView(views.APIView):
    """
    Check user's task progress for stagnation.
    Provides remediation recommendations.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        GET /tasks/stagnation-check/?roadmap_id=<uuid>

        Returns stagnation analysis with recommendations.
        """
        roadmap_id = request.query_params.get('roadmap_id')

        roadmap = None
        if roadmap_id:
            from roadmap_ai.models import Roadmap
            try:
                roadmap = Roadmap.objects.get(id=roadmap_id, user=request.user)
            except Roadmap.DoesNotExist:
                return Response(
                    {'error': 'Roadmap not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

        # Run stagnation detection
        detector = StagnationDetector(request.user, roadmap)
        analysis = detector.analyze()

        return Response(analysis)

    def post(self, request):
        """
        POST /tasks/stagnation-check/remediate/

        Apply remediation action.

        Body: {
            "action": "difficulty_downgrade",
            "task_id": "uuid",
            "level": "moderate"
        }
        or
        {
            "action": "suggest_scope_reduction",
            "roadmap_id": "uuid"
        }
        """
        action = request.data.get('action')

        if action == 'difficulty_downgrade':
            task_id = request.data.get('task_id')
            level = request.data.get('level', 'moderate')

            try:
                task = Task.objects.get(task_id=task_id, user=request.user)
            except Task.DoesNotExist:
                return Response(
                    {'error': 'Task not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            result = apply_difficulty_downgrade(task, level)
            return Response(result)

        elif action == 'suggest_scope_reduction':
            roadmap_id = request.data.get('roadmap_id')

            if roadmap_id:
                tasks = Task.objects.filter(
                    roadmap_id=roadmap_id,
                    user=request.user
                )
            else:
                tasks = Task.objects.filter(user=request.user)

            suggestions = suggest_scope_reduction(list(tasks))
            return Response(suggestions)

        else:
            return Response(
                {'error': 'Invalid action'},
                status=status.HTTP_400_BAD_REQUEST
            )
