"""
Minimal Admin Panel Views
ONLY the essentials for operations - no fancy dashboard.
"""
from rest_framework import views, status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from django.utils import timezone
from django.db.models import Q, Count
from datetime import timedelta

from .models import TaskValidator, TaskAttempt, Task
from .remediation_models import RemediationAction, EligibilityOverride
from .serializers import TaskValidatorSerializer
from .explainability import generate_clear_feedback


class PendingManualValidationsView(views.APIView):
    """
    Admin view: All pending manual validations.
    Sorted by SLA urgency.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        """
        GET /admin/pending-validations/

        Returns pending manual reviews sorted by SLA.
        """
        now = timezone.now()

        pending_reviews = TaskValidator.objects.filter(
            review_status='PENDING'
        ).select_related(
            'attempt__task',
            'attempt__user'
        ).prefetch_related('attempt').order_by('created_at')

        results = []
        for review in pending_reviews:
            # Get the attempt that links to this review
            try:
                attempt = TaskAttempt.objects.get(manual_review=review)
            except TaskAttempt.DoesNotExist:
                continue

            sla_deadline = review.created_at + \
                timedelta(hours=review.sla_hours)
            hours_remaining = (sla_deadline - now).total_seconds() / 3600

            results.append({
                'validator_id': str(review.validator_id),
                'attempt_id': str(attempt.attempt_id),
                'user': attempt.user.username,
                'task_title': attempt.task.title,
                'submitted_at': review.created_at.isoformat(),
                'sla_hours': review.sla_hours,
                'hours_remaining': round(hours_remaining, 1),
                'is_overdue': hours_remaining < 0,
                'escalated': review.escalated,
                'proof_payload': attempt.proof_payload,
                'prevalidation': attempt.proof_payload.get('_prevalidation', {})
            })

        # Sort by most urgent first
        results.sort(key=lambda x: x['hours_remaining'])

        return Response({
            'total_pending': len(results),
            'overdue': sum(1 for r in results if r['is_overdue']),
            'reviews': results
        })

    def post(self, request):
        """
        POST /admin/pending-validations/review/

        Submit a manual review decision.

        Body: {
            "validator_id": "uuid",
            "decision": "APPROVED" | "REJECTED",
            "score": 85.0,
            "feedback": "Great work!",
            "improvement_notes": "Consider adding tests"
        }
        """
        validator_id = request.data.get('validator_id')
        decision = request.data.get('decision')
        score = request.data.get('score')
        feedback = request.data.get('feedback', '')
        improvement_notes = request.data.get('improvement_notes', '')

        try:
            review = TaskValidator.objects.get(validator_id=validator_id)
        except TaskValidator.DoesNotExist:
            return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)

        if review.review_status != 'PENDING':
            return Response({'error': 'Review already completed'}, status=status.HTTP_400_BAD_REQUEST)

        # Update review
        review.review_status = decision
        review.score = score
        review.feedback = feedback
        review.improvement_notes = improvement_notes
        review.reviewer = request.user
        review.reviewed_at = timezone.now()
        review.save()

        # Update attempt
        try:
            attempt = TaskAttempt.objects.get(manual_review=review)
        except TaskAttempt.DoesNotExist:
            return Response({'error': 'Associated attempt not found'}, status=status.HTTP_404_NOT_FOUND)
        attempt.validation_status = 'PASS' if decision == 'APPROVED' else 'FAIL'
        attempt.score = score
        attempt.validated_at = timezone.now()
        attempt.save()

        # Update task completion if PASS
        if decision == 'APPROVED':
            attempt.task.update_completion_status(attempt)

        return Response({
            'message': 'Review completed',
            'attempt_id': str(attempt.attempt_id),
            'decision': decision,
            'score': score
        })


class FlaggedSubmissionsView(views.APIView):
    """
    Admin view: Suspicious submissions flagged by validators.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        """
        GET /admin/flagged-submissions/

        Returns submissions with warnings or suspicious patterns.
        """
        # Find attempts with warnings
        flagged_attempts = TaskAttempt.objects.filter(
            Q(validator_output__warnings__isnull=False) |
            Q(flagged_for_similarity=True)
        ).select_related('task', 'user').order_by('-submitted_at')[:50]

        results = []
        for attempt in flagged_attempts:
            warnings = attempt.validator_output.get('warnings', [])

            if warnings or attempt.flagged_for_similarity:
                results.append({
                    'attempt_id': str(attempt.attempt_id),
                    'user': attempt.user.username,
                    'task_title': attempt.task.title,
                    'submitted_at': attempt.submitted_at.isoformat(),
                    'status': attempt.validation_status,
                    'score': attempt.score,
                    'warnings': warnings,
                    'flagged_for_similarity': attempt.flagged_for_similarity,
                    'similarity_confidence': attempt.similarity_confidence,
                    'proof_payload': attempt.proof_payload
                })

        return Response({
            'total_flagged': len(results),
            'submissions': results
        })


class EligibilityOverrideViewSet(viewsets.ModelViewSet):
    """
    Admin viewset: Manage eligibility overrides for edge cases.
    """
    permission_classes = [IsAdminUser]
    queryset = EligibilityOverride.objects.all().order_by('-created_at')

    def create(self, request):
        """
        POST /admin/eligibility-overrides/

        Grant eligibility override.

        Body: {
            "user_id": 123,
            "roadmap_id": "uuid",
            "justification": "User at 68% support score, consistently engaged...",
            "eligibility_snapshot": {...}
        }
        """
        from django.contrib.auth import get_user_model
        from roadmap_ai.models import Roadmap

        User = get_user_model()

        user_id = request.data.get('user_id')
        roadmap_id = request.data.get('roadmap_id')
        justification = request.data.get('justification', '')
        eligibility_snapshot = request.data.get('eligibility_snapshot', {})

        if not justification:
            return Response(
                {'error': 'Justification is required for audit trail'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(id=user_id)
            roadmap = Roadmap.objects.get(id=roadmap_id)
        except (User.DoesNotExist, Roadmap.DoesNotExist) as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)

        # Check if override already exists
        existing = EligibilityOverride.objects.filter(
            user=user,
            roadmap=roadmap,
            is_active=True
        ).first()

        if existing:
            return Response(
                {'error': 'Active override already exists for this user/roadmap'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create override
        override = EligibilityOverride.objects.create(
            user=user,
            roadmap=roadmap,
            granted_by=request.user,
            justification=justification,
            eligibility_snapshot=eligibility_snapshot
        )

        return Response({
            'override_id': str(override.override_id),
            'message': 'Override granted',
            'user': user.username,
            'roadmap': roadmap.title
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        """
        POST /admin/eligibility-overrides/{id}/revoke/

        Revoke an override.

        Body: {
            "reason": "User completed tasks naturally"
        }
        """
        override = self.get_object()
        reason = request.data.get('reason', '')

        if not override.is_active:
            return Response(
                {'error': 'Override already revoked'},
                status=status.HTTP_400_BAD_REQUEST
            )

        override.revoke(revoked_by=request.user, reason=reason)

        return Response({
            'message': 'Override revoked',
            'revoked_at': override.revoked_at.isoformat()
        })


class RemediationViewSet(viewsets.ModelViewSet):
    """
    User + Admin viewset: Manage remediation suggestions and responses.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Users see their own, admins see all."""
        user = self.request.user
        if user.is_staff:
            return RemediationAction.objects.all().order_by('-suggested_at')
        return RemediationAction.objects.filter(user=user).order_by('-suggested_at')

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """
        POST /remediations/{id}/accept/

        User accepts a remediation suggestion.

        Body: {
            "comment": "Yes, please reduce difficulty"
        }
        """
        remediation = self.get_object()

        if remediation.user != request.user:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        if remediation.status != 'SUGGESTED':
            return Response(
                {'error': f'Cannot accept remediation in status: {remediation.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        comment = request.data.get('comment', '')

        try:
            remediation.accept(user_comment=comment)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': 'Remediation accepted and applied',
            'applied_changes': remediation.applied_changes,
            'applied_at': remediation.applied_at.isoformat()
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        POST /remediations/{id}/reject/

        User rejects a remediation suggestion.

        Body: {
            "comment": "I want to keep trying"
        }
        """
        remediation = self.get_object()

        if remediation.user != request.user:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        comment = request.data.get('comment', '')

        try:
            remediation.reject(user_comment=comment)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': 'Remediation rejected',
            'rejected_at': remediation.responded_at.isoformat()
        })
