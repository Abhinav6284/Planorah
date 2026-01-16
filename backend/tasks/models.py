from django.db import models
from django.conf import settings
from roadmap_ai.models import Roadmap, Milestone
from django.utils import timezone
import uuid
import hashlib


class Task(models.Model):
    """
    Enhanced task model supporting strict validation contracts.
    Backward compatible with existing task system while adding:
    - Immutable contracts
    - Objective-based proof requirements
    - Automated & manual validation
    """

    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('pending_validation', 'Pending Validation'),
        ('completed', 'Completed'),
        ('needs_revision', 'Needs Revision'),
    ]

    PROOF_TYPE_CHOICES = [
        ('GITHUB_REPO', 'GitHub Repository'),
        ('QUIZ', 'Quiz'),
        ('FILE_UPLOAD', 'File Upload'),
        ('URL', 'Live URL'),
        ('none', 'No Validation Required'),
    ]

    VALIDATOR_TYPE_CHOICES = [
        ('AUTO_GITHUB', 'Automated GitHub Validator'),
        ('AUTO_QUIZ', 'Automated Quiz Validator'),
        ('MANUAL', 'Manual Human Review'),
        ('none', 'No Validation'),
    ]

    # UUID for strict contract identity
    task_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)

    # Ownership
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='roadmap_tasks')
    roadmap = models.ForeignKey(
        Roadmap, on_delete=models.CASCADE, related_name='task_contracts')
    milestone = models.ForeignKey(
        Milestone, on_delete=models.SET_NULL, null=True, blank=True, related_name='task_contracts')

    # Task details
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)

    # Status (legacy support)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='not_started')

    # ============ VALIDATION CONTRACT (NEW - STRICT) ============
    # What proof is needed
    objective = models.TextField(
        blank=True,
        help_text="Measurable outcome - what needs to be proven"
    )
    proof_type = models.CharField(
        max_length=20,
        choices=PROOF_TYPE_CHOICES,
        default='none',
        help_text="Type of proof required"
    )
    validator_type = models.CharField(
        max_length=20,
        choices=VALIDATOR_TYPE_CHOICES,
        default='none',
        help_text="How proof will be validated"
    )

    # Validation rules
    acceptance_rules = models.JSONField(
        default=dict,
        blank=True,
        help_text="Validator-specific rules (min_commits, required_files, answer_key, etc)"
    )
    minimum_pass_score = models.FloatField(
        default=70.0,
        help_text="Minimum score (0-100) required"
    )
    max_attempts = models.IntegerField(
        null=True,
        blank=True,
        help_text="Max attempts allowed (null = unlimited)"
    )

    # ============ TASK CRITICALITY (ELIGIBILITY WEIGHTING) ============
    is_core_task = models.BooleanField(
        default=False,
        help_text="Core tasks MUST pass for output eligibility (100% required)"
    )
    weight = models.IntegerField(
        default=1,
        help_text="Task weight (1-5) for scoring. Higher weight = more important for eligibility"
    )

    # Legacy validator data (for backward compatibility)
    validator_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="[LEGACY] Old validator configuration"
    )

    # ============ TASK CONTROLS ============
    can_skip = models.BooleanField(default=False)
    can_edit_by_user = models.BooleanField(default=False)

    # ============ SCHEDULING ============
    day = models.IntegerField(help_text="Day number in roadmap (1-based)")
    due_date = models.DateField()
    order_in_day = models.IntegerField(default=0)

    # ============ TIME TRACKING ============
    estimated_minutes = models.IntegerField(default=60)
    actual_minutes = models.IntegerField(default=0)

    # ============ NOTES & METADATA ============
    notes = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)
    is_revision = models.BooleanField(default=False)
    original_task = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='revision_tasks')

    # ============ TIMESTAMPS ============
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # ============ COMPLETION TRACKING (IMMUTABLE) ============
    first_passed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When user first passed this task - never revoked unless proof invalidated"
    )
    best_pass_score = models.FloatField(
        null=True,
        blank=True,
        help_text="Highest score from PASS attempts - defines completion quality"
    )
    best_pass_attempt = models.ForeignKey(
        'TaskAttempt',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='task_best_pass',
        help_text="Reference to the best PASS attempt"
    )

    class Meta:
        ordering = ['day', 'order_in_day', 'created_at']
        indexes = [
            models.Index(fields=['user', 'roadmap']),
            models.Index(fields=['user', 'day']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['is_core_task']),
        ]

    def __str__(self):
        return f"{self.title} (Day {self.day})"

    def mark_complete(self):
        """Mark task as complete and create revision tasks."""
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()

        # Create revision tasks
        self.create_revision_tasks()

    def create_revision_tasks(self):
        """Create revision tasks at 1, 3, and 7 days after completion."""
        if self.is_revision:
            return

        revision_days = [1, 3, 7]
        for days_after in revision_days:
            revision_due_date = self.completed_at.date() + timezone.timedelta(days=days_after)

            Task.objects.create(
                user=self.user,
                roadmap=self.roadmap,
                milestone=self.milestone,
                title=f"📝 Revision: {self.title}",
                description=f"Review and reinforce: {self.description}",
                status='not_started',
                day=self.day + days_after,
                due_date=revision_due_date,
                estimated_minutes=30,
                is_revision=True,
                original_task=self,
                tags=self.tags +
                ['revision'] if isinstance(self.tags, list) else ['revision']
            )

    def get_user_status(self, user):
        """
        Derived status - computed from completion state.
        CRITICAL: Once PASS is achieved (first_passed_at exists), status is COMPLETED.
        Later FAIL attempts do NOT revoke completion.

        Returns: 'COMPLETED', 'IN_PROGRESS', or 'NOT_STARTED'
        """
        # Check if ever passed
        if self.first_passed_at:
            return 'COMPLETED'

        # Check if any attempts exist
        has_attempts = self.attempts.filter(user=user).exists()
        if has_attempts:
            return 'IN_PROGRESS'

        return 'NOT_STARTED'

    def can_attempt(self, user):
        """Check if user can make another attempt"""
        if self.max_attempts is None:
            return True

        attempt_count = self.attempts.filter(user=user).count()
        return attempt_count < self.max_attempts

    def update_completion_status(self, passing_attempt):
        """
        Update task completion based on a PASS attempt.
        CRITICAL: Never revokes completion - only updates if better.

        Args:
            passing_attempt: TaskAttempt instance with validation_status='PASS'
        """
        if passing_attempt.validation_status != 'PASS':
            return

        # First pass ever
        if not self.first_passed_at:
            self.first_passed_at = passing_attempt.validated_at or timezone.now()
            self.completed_at = self.first_passed_at
            self.status = 'completed'
            self.best_pass_score = passing_attempt.score
            self.best_pass_attempt = passing_attempt
            self.save()
            return

        # Update best score if this is better
        if passing_attempt.score and (not self.best_pass_score or passing_attempt.score > self.best_pass_score):
            self.best_pass_score = passing_attempt.score
            self.best_pass_attempt = passing_attempt
            self.save()

    def invalidate_completion(self, reason: str):
        """
        Revoke completion status (ONLY for proof invalidation, plagiarism, etc).
        This is the ONLY way to revoke a PASS status.

        Args:
            reason: Why completion is being invalidated (logged)
        """
        self.first_passed_at = None
        self.best_pass_score = None
        self.best_pass_attempt = None
        self.status = 'needs_revision'
        self.save()

        # Log invalidation event
        from user_lifecycle.models import LifecycleEvent, EventType
        LifecycleEvent.objects.create(
            user=self.user,
            event_type=EventType.TASK_ATTEMPT,
            data={
                'task_id': str(self.task_id),
                'task_title': self.title,
                'action': 'completion_invalidated',
                'reason': reason
            }
        )


class TaskAttempt(models.Model):
    """
    Immutable audit trail of task attempts.
    Append-only design: new attempts added, never deleted or modified.
    """

    STATUS_CHOICES = [
        ('PENDING', 'Pending Validation'),
        ('PASS', 'Passed'),
        ('FAIL', 'Failed'),
    ]

    # UUID for strict attempt identity
    attempt_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)

    # Ownership
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='task_attempts')
    task = models.ForeignKey(
        Task, on_delete=models.CASCADE, related_name='attempts')

    # ============ IMMUTABLE PROOF SUBMISSION ============
    proof_payload = models.JSONField(
        default=dict,
        help_text="User's submitted proof (repo URL, quiz answers, file path, etc.)"
    )

    # Proof hash - ensures uniqueness and prevents repo reuse
    proof_hash = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        help_text="SHA256 of task+user+payload - prevents proof reuse"
    )

    # ============ FUTURE: PLAGIARISM DETECTION (SCHEMA READY) ============
    code_similarity_hash = models.CharField(
        max_length=64,
        null=True,
        blank=True,
        db_index=True,
        help_text="Code similarity hash for plagiarism detection (future)"
    )
    flagged_for_similarity = models.BooleanField(
        default=False,
        db_index=True,
        help_text="True if flagged for potential plagiarism (future)"
    )
    similarity_confidence = models.FloatField(
        null=True,
        blank=True,
        help_text="Similarity confidence score 0-1 (future)"
    )

    # ============ VALIDATION RESULTS (IMMUTABLE) ============
    attempt_number = models.IntegerField(
        help_text="Attempt count for this task")

    validation_status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='PENDING',
        help_text="Validation result: PENDING, PASS, or FAIL"
    )

    score = models.FloatField(
        null=True,
        blank=True,
        help_text="Validation score (0-100)"
    )

    # Detailed validator output (immutable record)
    validator_output = models.JSONField(
        default=dict,
        blank=True,
        help_text="Complete validator response (status, checks, errors, etc)"
    )

    # Manual review (if applicable)
    manual_review = models.OneToOneField(
        'TaskValidator',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='attempt'
    )

    # ============ TIMESTAMPS ============
    submitted_at = models.DateTimeField(auto_now_add=True, db_index=True)
    validated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['user', 'task', 'validation_status']),
            models.Index(fields=['user', '-submitted_at']),
            models.Index(fields=['task', 'validation_status']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['task', 'user', 'attempt_number'],
                name='unique_task_attempt'
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.task.title} #{self.attempt_number}"

    def save(self, *args, **kwargs):
        """Generate proof hash on creation."""
        if not self.pk:
            # Generate proof hash: SHA256(task_id + user_id + payload)
            hash_input = f"{self.task.task_id}{self.user.id}{str(self.proof_payload)}"
            self.proof_hash = hashlib.sha256(hash_input.encode()).hexdigest()

        # Prevent modification of immutable fields
        if self.pk:
            original = TaskAttempt.objects.get(pk=self.pk)
            if (original.proof_payload != self.proof_payload or
                original.validation_status != self.validation_status or
                    original.score != self.score):
                raise ValueError(
                    "TaskAttempt is immutable - cannot modify proof or validation data")

        super().save(*args, **kwargs)


class TaskValidator(models.Model):
    """
    Manual review records for tasks requiring human validation.
    One-to-one relationship with TaskAttempt.
    """

    REVIEW_STATUS_CHOICES = [
        ('PENDING', 'Pending Human Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('NEEDS_REVISION', 'Needs Revision'),
    ]

    validator_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)

    # Reviewer (staff member)
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='task_reviews'
    )

    # Review details
    review_status = models.CharField(
        max_length=20,
        choices=REVIEW_STATUS_CHOICES,
        default='PENDING'
    )
    score = models.FloatField(
        null=True,
        blank=True,
        help_text="Human-assigned score (0-100)"
    )
    feedback = models.TextField(
        blank=True,
        help_text="Human feedback on submission"
    )
    improvement_notes = models.TextField(
        blank=True,
        help_text="Suggestions for improvement"
    )

    # ============ SLA & TIMEOUT (OPERATIONAL SAFETY) ============
    sla_hours = models.IntegerField(
        default=48,
        help_text="SLA for review completion (hours)"
    )
    escalated = models.BooleanField(
        default=False,
        help_text="True if SLA exceeded and escalated"
    )
    auto_timeout_action = models.CharField(
        max_length=20,
        choices=[
            ('FAIL', 'Auto-fail if timeout'),
            ('DOWNGRADE', 'Downgrade task difficulty'),
            ('NOTIFY', 'Notify only, keep pending')
        ],
        default='NOTIFY',
        help_text="Action to take if SLA exceeded"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['reviewer', 'review_status']),
            models.Index(fields=['review_status']),
        ]

    def __str__(self):
        return f"Review #{self.validator_id} - {self.review_status}"


class Note(models.Model):
    """Standalone notes not tied to specific tasks."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE, related_name='notes')
    roadmap = models.ForeignKey(
        Roadmap, on_delete=models.CASCADE, null=True, blank=True, related_name='notes')

    title = models.CharField(max_length=500)
    content = models.TextField(help_text="Markdown formatted content")

    tags = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.title
