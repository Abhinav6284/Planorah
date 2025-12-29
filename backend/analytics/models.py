from django.db import models
from django.conf import settings
from django.utils import timezone


class UserProgress(models.Model):
    """
    Track overall user progress across all roadmaps.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='progress'
    )
    
    # Overall stats
    total_roadmaps_completed = models.IntegerField(default=0)
    total_projects_completed = models.IntegerField(default=0)
    total_tasks_completed = models.IntegerField(default=0)
    total_resumes_created = models.IntegerField(default=0)
    total_ats_scans = models.IntegerField(default=0)
    
    # Time tracking
    total_study_minutes = models.IntegerField(default=0)
    
    # Last activity
    last_active_at = models.DateTimeField(auto_now=True)
    
    # Streak tracking
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Progress: {self.user.username}"

    def update_streak(self):
        """Update user streak based on activity."""
        today = timezone.now().date()
        
        if self.last_activity_date is None:
            self.current_streak = 1
        elif self.last_activity_date == today:
            pass  # Already counted today
        elif (today - self.last_activity_date).days == 1:
            self.current_streak += 1
        else:
            self.current_streak = 1
        
        self.last_activity_date = today
        self.longest_streak = max(self.longest_streak, self.current_streak)
        self.save()


class RoadmapProgress(models.Model):
    """
    Track progress per roadmap.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='roadmap_progress'
    )
    roadmap = models.ForeignKey(
        'roadmap_ai.Roadmap',
        on_delete=models.CASCADE,
        related_name='user_progress'
    )
    
    # Progress stats
    milestones_completed = models.IntegerField(default=0)
    total_milestones = models.IntegerField(default=0)
    tasks_completed = models.IntegerField(default=0)
    total_tasks = models.IntegerField(default=0)
    projects_completed = models.IntegerField(default=0)
    total_projects = models.IntegerField(default=0)
    
    # Percentage
    completion_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Time tracking
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_activity_at = models.DateTimeField(auto_now=True)
    
    # Status
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ['user', 'roadmap']

    def __str__(self):
        return f"{self.user.username} - {self.roadmap.title} ({self.completion_percentage}%)"

    def update_progress(self):
        """Recalculate progress from related objects."""
        from roadmap_ai.models import Milestone
        from tasks.models import Task
        
        milestones = self.roadmap.milestones.all()
        self.total_milestones = milestones.count()
        self.milestones_completed = milestones.filter(is_completed=True).count()
        
        tasks = Task.objects.filter(roadmap=self.roadmap, user=self.user)
        self.total_tasks = tasks.count()
        self.tasks_completed = tasks.filter(status='completed').count()
        
        projects = []
        for milestone in milestones:
            projects.extend(list(milestone.projects.all()))
        self.total_projects = len(projects)
        self.projects_completed = len([p for p in projects if p.completed])
        
        # Calculate percentage
        if self.total_tasks > 0:
            self.completion_percentage = (self.tasks_completed / self.total_tasks) * 100
        
        # Check if completed
        if self.completion_percentage >= 100:
            self.is_completed = True
            if not self.completed_at:
                self.completed_at = timezone.now()
        
        self.save()


class DailyActivity(models.Model):
    """
    Track daily activity for analytics.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='daily_activities'
    )
    date = models.DateField()
    
    # Activity counts
    tasks_completed = models.IntegerField(default=0)
    projects_worked = models.IntegerField(default=0)
    resumes_created = models.IntegerField(default=0)
    ats_scans_run = models.IntegerField(default=0)
    
    # Time
    minutes_active = models.IntegerField(default=0)
    
    # Session info
    login_count = models.IntegerField(default=0)

    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username} - {self.date}"


class UsageLog(models.Model):
    """
    Detailed log of feature usage for cost control.
    """
    ACTION_CHOICES = [
        ('roadmap_create', 'Roadmap Created'),
        ('project_create', 'Project Created'),
        ('resume_create', 'Resume Created'),
        ('ats_scan', 'ATS Scan'),
        ('github_publish', 'GitHub Publish'),
        ('portfolio_view', 'Portfolio View'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='usage_logs'
    )
    subscription = models.ForeignKey(
        'subscriptions.Subscription',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='usage_logs'
    )
    
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    
    # Resource reference
    resource_type = models.CharField(max_length=50, blank=True)
    resource_id = models.IntegerField(null=True, blank=True)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'action']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.action}"
