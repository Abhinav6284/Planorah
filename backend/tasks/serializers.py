"""
Task serializers with strict validation.
"""
from rest_framework import serializers
from django.utils import timezone
from .models import Task, TaskAttempt, TaskValidator, Note
from .validators import run_validation
import hashlib


class TaskValidatorSerializer(serializers.ModelSerializer):
    """Manual review records."""

    reviewer_name = serializers.CharField(
        source='reviewer.username', read_only=True)

    class Meta:
        model = TaskValidator
        fields = ['validator_id', 'reviewer_name', 'review_status', 'score',
                  'feedback', 'improvement_notes', 'created_at', 'reviewed_at']
        read_only_fields = fields


class TaskAttemptDetailSerializer(serializers.ModelSerializer):
    """
    Full task attempt details including validation results.
    Read-only - attempts are immutable.
    """

    user_name = serializers.CharField(source='user.username', read_only=True)
    manual_review = TaskValidatorSerializer(read_only=True)

    class Meta:
        model = TaskAttempt
        fields = ['attempt_id', 'user_name', 'attempt_number', 'validation_status',
                  'score', 'validator_output', 'manual_review', 'submitted_at', 'validated_at']
        read_only_fields = fields


class TaskAttemptListSerializer(serializers.ModelSerializer):
    """Lightweight task attempt serializer for lists."""

    class Meta:
        model = TaskAttempt
        fields = ['attempt_id', 'attempt_number',
                  'validation_status', 'score', 'submitted_at']
        read_only_fields = fields


class TaskSubmitSerializer(serializers.Serializer):
    """
    Validate and create a new task attempt.
    Write-only - used only for submission.
    """

    proof_payload = serializers.JSONField(
        help_text="Proof data: {'repo_url': '...'} for GitHub or {'answers': {...}} for Quiz"
    )

    def validate_proof_payload(self, value):
        """Ensure proof payload is not empty."""
        if not value:
            raise serializers.ValidationError("Proof payload cannot be empty")
        return value

    def create(self, validated_data):
        """
        Create a TaskAttempt and generate proof hash.
        Request context must have 'request' with authenticated user.
        Must have 'task' in validated_data.
        """
        request = self.context.get('request')
        task = self.context.get('task')

        if not request or not request.user or not task:
            raise serializers.ValidationError("Request context missing")

        user = request.user
        proof_payload = validated_data['proof_payload']

        # Get attempt number
        last_attempt = task.attempts.filter(
            user=user).order_by('-attempt_number').first()
        attempt_number = (
            last_attempt.attempt_number if last_attempt else 0) + 1

        # Generate proof hash: SHA256(task_id + user_id + payload)
        hash_input = f"{task.task_id}{user.id}{str(proof_payload)}"
        proof_hash = hashlib.sha256(hash_input.encode()).hexdigest()

        # Create attempt
        attempt = TaskAttempt.objects.create(
            task=task,
            user=user,
            proof_payload=proof_payload,
            proof_hash=proof_hash,
            attempt_number=attempt_number,
            validation_status='PENDING'
        )

        return attempt


class TaskSerializer(serializers.ModelSerializer):
    """
    Complete task serializer with derived status and latest attempt.
    Read-only fields for validation data.
    """

    user_status = serializers.SerializerMethodField()
    latest_attempt = serializers.SerializerMethodField()
    attempt_count = serializers.SerializerMethodField()
    can_attempt = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'task_id', 'title', 'description', 'objective',
            'status', 'user_status', 'day', 'due_date',
            'proof_type', 'validator_type', 'acceptance_rules',
            'minimum_pass_score', 'max_attempts', 'is_core_task',
            'estimated_minutes', 'actual_minutes',
            'can_skip', 'can_edit_by_user',
            'latest_attempt', 'attempt_count', 'can_attempt',
            'notes', 'tags', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'task_id', 'user_status', 'latest_attempt', 'attempt_count',
            'can_attempt', 'created_at', 'updated_at'
        ]

    def get_user_status(self, obj):
        """
        Derive current status from latest attempt.
        Returns: 'COMPLETED', 'IN_PROGRESS', or 'NOT_STARTED'
        """
        request = self.context.get('request')
        if not request or not request.user:
            return 'NOT_STARTED'

        return obj.get_user_status(request.user)

    def get_latest_attempt(self, obj):
        """Get most recent attempt details."""
        request = self.context.get('request')
        if not request or not request.user:
            return None

        attempt = obj.attempts.filter(
            user=request.user).order_by('-submitted_at').first()
        if attempt:
            return TaskAttemptListSerializer(attempt).data
        return None

    def get_attempt_count(self, obj):
        """Get total attempts by current user."""
        request = self.context.get('request')
        if not request or not request.user:
            return 0

        return obj.attempts.filter(user=request.user).count()

    def get_can_attempt(self, obj):
        """Check if user can make another attempt."""
        request = self.context.get('request')
        if not request or not request.user:
            return False

        return obj.can_attempt(request.user)


class OutputEligibilitySerializer(serializers.Serializer):
    """Check if user is eligible for output generation with weighted scoring."""

    is_eligible = serializers.BooleanField()
    core_status = serializers.DictField()
    support_status = serializers.DictField()
    message = serializers.CharField()


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'user', 'roadmap', 'title',
                  'content', 'tags', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
