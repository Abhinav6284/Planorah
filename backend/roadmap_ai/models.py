from django.db import models
from django.conf import settings
import uuid
import hashlib
import uuid
import hashlib
from django.utils import timezone


class Roadmap(models.Model):
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    CATEGORY_CHOICES = [
        ('project', 'Project-Based'),
        ('career', 'Career Path'),
        ('research', 'Research & Academia'),
        ('skill_mastery', 'Skill Mastery'),
        ('exam_prep', 'Exam Preparation'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE, related_name='roadmaps')
    title = models.CharField(max_length=255)
    goal = models.TextField()
    overview = models.TextField(blank=True)
    estimated_duration = models.CharField(
        max_length=100, blank=True, default='6 months')
    daily_commitment = models.CharField(max_length=100, blank=True, null=True)
    difficulty_level = models.CharField(
        max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    category = models.CharField(
        max_length=20, choices=CATEGORY_CHOICES, default='career')

    # New fields for comprehensive roadmap
    tech_stack = models.TextField(
        blank=True, help_text="Preferred tech stack or domain")
    output_format = models.CharField(
        max_length=50, blank=True, default='Milestone-based')
    learning_constraints = models.TextField(
        blank=True, help_text="Time, budget, or resource constraints")
    motivation_style = models.CharField(
        max_length=50, blank=True, default='Milestones')
    success_definition = models.TextField(
        blank=True, help_text="How success is defined")

    # Exam Preparation fields
    exam_name = models.CharField(
        max_length=255, blank=True, help_text="Name of the exam/paper")
    exam_date = models.DateField(
        null=True, blank=True, help_text="Date of the exam")
    syllabus_text = models.TextField(
        blank=True, help_text="Pasted syllabus content")

    prerequisites = models.JSONField(default=list, blank=True)
    career_outcomes = models.JSONField(default=list, blank=True)
    tips = models.JSONField(default=list, blank=True)
    faqs = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"

    class Meta:
        ordering = ['-created_at']


class Milestone(models.Model):
    roadmap = models.ForeignKey(
        Roadmap, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    duration = models.CharField(max_length=100, blank=True)
    order = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    resources = models.JSONField(default=list, blank=True)
    topics = models.JSONField(default=list, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.roadmap.title} - {self.title}"

    class Meta:
        ordering = ['order']


class Project(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    milestone = models.ForeignKey(
        Milestone, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=255)
    description = models.TextField()
    difficulty = models.CharField(
        max_length=20, choices=DIFFICULTY_CHOICES, default='medium')
    estimated_hours = models.IntegerField(default=0)
    tech_stack = models.JSONField(default=list)
    learning_outcomes = models.JSONField(default=list)
    completed = models.BooleanField(default=False)
    github_url = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.title


class StudentProject(models.Model):
    """
    Student-uploaded custom projects.
    These are separate from roadmap projects and allow students to showcase their own work.
    """
    SOURCE_TYPE_CHOICES = [
        ('upload', 'Upload (ZIP/Folder)'),
        ('git_url', 'Git Repository URL'),
        ('manual', 'Manual Entry'),
    ]

    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_projects'
    )

    # Basic info
    title = models.CharField(max_length=255)
    description = models.TextField()
    tech_stack = models.JSONField(default=list)

    # Source information
    source_type = models.CharField(
        max_length=20, choices=SOURCE_TYPE_CHOICES, default='manual')
    git_url = models.URLField(blank=True, null=True,
                              help_text='Original Git repository URL')
    file_path = models.CharField(
        max_length=500, blank=True, help_text='Path to uploaded files')

    # Project links
    github_url = models.URLField(
        blank=True, null=True, help_text='Published GitHub URL')
    live_demo_url = models.URLField(blank=True, null=True)

    # Settings
    visibility = models.CharField(
        max_length=20, choices=VISIBILITY_CHOICES, default='public')

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Student Project'
        verbose_name_plural = 'Student Projects'

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class Task(models.Model):
    """
    Immutable task contract with strict validation rules.
    Tasks define what needs to be proven, not how to do it.
    """
    PROOF_TYPE_CHOICES = [
        ('GITHUB_REPO', 'GitHub Repository'),
        ('QUIZ', 'Quiz/Assessment'),
        ('FILE_UPLOAD', 'File Upload (PDF/ZIP)'),
        ('URL', 'Live URL/Deployment'),
    ]

    VALIDATOR_TYPE_CHOICES = [
        ('AUTO_GITHUB', 'Automated GitHub Validator'),
        ('AUTO_QUIZ', 'Automated Quiz Validator'),
        ('MANUAL', 'Manual Human Review'),
    ]

    # Identity
    task_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)
    roadmap = models.ForeignKey(
        Roadmap, on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)
    milestone = models.ForeignKey(
        Milestone, on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)

    # Contract specification
    objective = models.TextField(
        help_text="Measurable outcome - what needs to be proven")
    description = models.TextField(
        blank=True, help_text="Additional context or instructions")

    # Proof configuration
    proof_type = models.CharField(
        max_length=20, choices=PROOF_TYPE_CHOICES, help_text="Type of acceptable proof")
    validator_type = models.CharField(
        max_length=20, choices=VALIDATOR_TYPE_CHOICES, help_text="How proof will be validated")

    # Validation rules (JSON structure depends on validator type)
    acceptance_rules = models.JSONField(
        default=dict,
        help_text="Validator-specific rules. For GitHub: min_commits, required_files, required_keywords"
    )

    # Scoring
    min_pass_score = models.IntegerField(
        default=70, help_text="Minimum score (0-100) to pass")
    max_attempts = models.IntegerField(
        null=True, blank=True, help_text="Max attempts allowed (null = unlimited)")

    # Metadata
    is_core_task = models.BooleanField(
        default=False, help_text="Core tasks required for output eligibility")
    order = models.IntegerField(
        default=0, help_text="Display order within roadmap/milestone")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'

    def __str__(self):
        return f"Task: {self.objective[:50]}... ({self.validator_type})"

    def get_user_status(self, user):
        """
        Derived status - computed from latest attempt, never stored.
        Returns: 'COMPLETED', 'IN_PROGRESS', or 'NOT_STARTED'
        """
        latest_attempt = self.attempts.filter(
            user=user).order_by('-submitted_at').first()

        if not latest_attempt:
            return 'NOT_STARTED'

        if latest_attempt.validation_status == 'PASS':
            return 'COMPLETED'

        return 'IN_PROGRESS'

    def can_attempt(self, user):
        """Check if user can make another attempt"""
        if self.max_attempts is None:
            return True

        attempt_count = self.attempts.filter(user=user).count()
        return attempt_count < self.max_attempts
