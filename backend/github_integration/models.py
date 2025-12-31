from django.db import models
from django.conf import settings
from django.utils import timezone


class GitHubCredential(models.Model):
    """
    Stores GitHub OAuth credentials for auto-publishing projects.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='github_credential'
    )
    
    access_token = models.TextField()
    refresh_token = models.TextField(blank=True, null=True)
    token_type = models.CharField(max_length=50, default='Bearer')
    scope = models.TextField(blank=True)
    
    # GitHub user info
    github_username = models.CharField(max_length=100, blank=True)
    github_id = models.CharField(max_length=50, blank=True)
    github_avatar_url = models.URLField(blank=True)
    
    # Token validity
    expires_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"GitHub: {self.github_username or self.user.username}"

    @property
    def is_valid(self):
        """Check if token is still valid."""
        if self.expires_at:
            return timezone.now() < self.expires_at
        return True  # Non-expiring tokens assumed valid


class GitHubRepository(models.Model):
    """
    Tracks repositories created for user projects.
    Supports both roadmap and student projects.
    """
    PROJECT_TYPE_CHOICES = [
        ('roadmap', 'Roadmap Project'),
        ('student', 'Student Project'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='github_repositories'
    )
    
    # Project references
    project_type = models.CharField(max_length=20, choices=PROJECT_TYPE_CHOICES, default='roadmap')
    project = models.OneToOneField(
        'roadmap_ai.Project',
        on_delete=models.CASCADE,
        related_name='github_repo',
        null=True,
        blank=True
    )
    student_project = models.OneToOneField(
        'roadmap_ai.StudentProject',
        on_delete=models.CASCADE,
        related_name='github_repo',
        null=True,
        blank=True
    )
    
    # Repository info
    repo_name = models.CharField(max_length=100)
    repo_full_name = models.CharField(max_length=200)  # username/repo
    repo_url = models.URLField()
    clone_url = models.URLField(blank=True)
    
    # Visibility
    is_private = models.BooleanField(default=False)
    
    # GitHub stats
    stars_count = models.IntegerField(default=0)
    forks_count = models.IntegerField(default=0)
    watchers_count = models.IntegerField(default=0)
    last_commit_date = models.DateTimeField(null=True, blank=True)
    last_commit_message = models.TextField(blank=True)
    
    # Sync status
    last_synced_at = models.DateTimeField(null=True, blank=True)
    sync_error = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'GitHub Repositories'
        constraints = [
            models.UniqueConstraint(fields=['user', 'repo_full_name'], name='unique_user_repo')
        ]

    def __str__(self):
        return self.repo_full_name
    
    def get_project(self):
        """Get the linked project."""
        if self.project_type == 'roadmap':
            return self.project
        return self.student_project


class GitHubPublishLog(models.Model):
    """
    Log of GitHub publishing actions.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    ]

    repository = models.ForeignKey(
        GitHubRepository,
        on_delete=models.CASCADE,
        related_name='publish_logs'
    )
    
    action = models.CharField(max_length=50)  # create, push, update
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Commit info
    commit_sha = models.CharField(max_length=40, blank=True)
    commit_message = models.TextField(blank=True)
    
    # Error tracking
    error_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.repository.repo_name} - {self.action} ({self.status})"
