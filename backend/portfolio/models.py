from django.db import models
from django.conf import settings
from django.utils import timezone

from .services import generate_public_url


class Portfolio(models.Model):
    """
    User portfolio with lifecycle states.
    Portfolio is NEVER permanently deleted.
    """
    STATUS_CHOICES = [
        ('active', 'Active'),        # Full access, public
        ('grace', 'Grace Period'),    # 7-14 days after expiry
        ('read_only', 'Read Only'),   # Public but limited
        ('archived', 'Archived'),     # Hidden, recoverable
    ]
    AVAILABILITY_CHOICES = [
        ('open', 'Open to opportunities'),
        ('interviewing', 'Interviewing'),
        ('not_looking', 'Not actively looking'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='portfolio'
    )

    # Portfolio URL configuration
    slug = models.SlugField(max_length=100, unique=True)
    custom_subdomain = models.CharField(
        max_length=50, blank=True, null=True, unique=True)

    # Status
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='archived')

    # Content
    title = models.CharField(max_length=200, blank=True)
    display_name = models.CharField(max_length=120, blank=True)
    location = models.CharField(max_length=120, blank=True)
    availability_status = models.CharField(
        max_length=20,
        choices=AVAILABILITY_CHOICES,
        default='open'
    )
    bio = models.TextField(blank=True)
    headline = models.CharField(max_length=200, blank=True)
    skills = models.JSONField(default=list, blank=True)

    # Social links
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)
    resume_url = models.URLField(blank=True)

    # CTA and SEO
    primary_cta_label = models.CharField(max_length=40, default='Hire Me')
    primary_cta_url = models.URLField(blank=True)
    seo_title = models.CharField(max_length=120, blank=True)
    seo_description = models.CharField(max_length=180, blank=True)
    og_image_url = models.URLField(blank=True)

    # Settings
    show_email = models.BooleanField(default=False)
    theme = models.CharField(max_length=50, default='default')
    settings_json = models.JSONField(default=dict, blank=True)

    # Metadata
    is_published = models.BooleanField(default=True)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_status_change = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Portfolios'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['is_published']),
            models.Index(fields=['status', 'is_published']),
        ]

    def __str__(self):
        return f"{self.user.username}'s Portfolio ({self.status})"

    @property
    def public_url(self):
        """Get the public URL for this portfolio."""
        return generate_public_url(self)

    @property
    def is_publicly_viewable(self):
        """Check if portfolio can be viewed publicly."""
        return self.status in ['active', 'grace', 'read_only']

    @property
    def is_fully_accessible(self):
        """Check if portfolio has full access."""
        return self.status == 'active'

    def transition_to_active(self):
        """Activate portfolio on subscription start/renewal."""
        self.status = 'active'
        self.last_status_change = timezone.now()
        self.save(update_fields=['status', 'last_status_change', 'updated_at'])

    def transition_to_grace(self):
        """Move to grace period on subscription expiry."""
        self.status = 'grace'
        self.last_status_change = timezone.now()
        self.save(update_fields=['status', 'last_status_change', 'updated_at'])

    def transition_to_read_only(self):
        """Move to read-only after grace period."""
        self.status = 'read_only'
        self.last_status_change = timezone.now()
        self.save(update_fields=['status', 'last_status_change', 'updated_at'])

    def transition_to_archived(self):
        """Archive portfolio (hidden but recoverable)."""
        self.status = 'archived'
        self.last_status_change = timezone.now()
        self.save(update_fields=['status', 'last_status_change', 'updated_at'])

    def update_status_from_subscription(self, subscription):
        """Update portfolio status based on subscription status."""
        if subscription is None:
            # Free users get read_only: portfolio is public but limited
            if self.status == 'archived':
                self.transition_to_read_only()
            return

        if subscription.is_active:
            self.transition_to_active()
        elif subscription.is_in_grace:
            self.transition_to_grace()
        elif subscription.status == 'expired':
            self.transition_to_read_only()
        else:
            self.transition_to_read_only()


class PortfolioProject(models.Model):
    """
    Project displayed on the portfolio.
    Links to either a roadmap project or a student project.
    """
    PROJECT_TYPE_CHOICES = [
        ('roadmap', 'Roadmap Project'),
        ('student', 'Student Project'),
    ]

    portfolio = models.ForeignKey(
        Portfolio,
        on_delete=models.CASCADE,
        related_name='portfolio_projects'
    )

    # Project type and references
    project_type = models.CharField(
        max_length=20, choices=PROJECT_TYPE_CHOICES, default='roadmap')
    project = models.ForeignKey(
        'roadmap_ai.Project',
        on_delete=models.CASCADE,
        related_name='portfolio_entries',
        null=True,
        blank=True
    )
    student_project = models.ForeignKey(
        'roadmap_ai.StudentProject',
        on_delete=models.CASCADE,
        related_name='portfolio_entries',
        null=True,
        blank=True
    )

    # Display settings
    order = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_visible = models.BooleanField(default=True)

    # Custom overrides for display
    custom_title = models.CharField(max_length=255, blank=True)
    custom_description = models.TextField(blank=True)
    role = models.CharField(max_length=120, blank=True)
    duration_text = models.CharField(max_length=100, blank=True)
    impact_metrics = models.JSONField(default=list, blank=True)
    project_url = models.URLField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_featured', 'order']

    def __str__(self):
        project_title = self.get_project_title()
        return f"{self.portfolio.user.username} - {project_title}"

    def get_project_title(self):
        """Get the title of the linked project."""
        if self.project_type == 'roadmap' and self.project:
            return self.project.title
        elif self.project_type == 'student' and self.student_project:
            return self.student_project.title
        return "Untitled Project"

    def get_project_description(self):
        """Get the description of the linked project."""
        if self.project_type == 'roadmap' and self.project:
            return self.project.description
        elif self.project_type == 'student' and self.student_project:
            return self.student_project.description
        return ""

    def get_tech_stack(self):
        """Get the tech stack of the linked project."""
        if self.project_type == 'roadmap' and self.project:
            return self.project.tech_stack
        elif self.project_type == 'student' and self.student_project:
            return self.student_project.tech_stack
        return []

    def get_github_url(self):
        """Get the GitHub URL of the linked project."""
        if self.project_type == 'roadmap' and self.project:
            return self.project.github_url
        elif self.project_type == 'student' and self.student_project:
            return self.student_project.github_url
        return None

    def get_demo_url(self):
        """Get the demo URL of the linked project."""
        if self.project_type == 'student' and self.student_project:
            return self.student_project.live_demo_url
        return None

    @property
    def display_title(self):
        return self.custom_title or self.get_project_title()

    @property
    def display_description(self):
        return self.custom_description or self.get_project_description()


class PortfolioAnalytics(models.Model):
    """
    Analytics for portfolio views.
    Only available for plans with portfolio_analytics.
    """
    portfolio = models.ForeignKey(
        Portfolio,
        on_delete=models.CASCADE,
        related_name='analytics'
    )

    date = models.DateField()
    page_views = models.IntegerField(default=0)
    unique_visitors = models.IntegerField(default=0)
    project_clicks = models.IntegerField(default=0)
    github_clicks = models.IntegerField(default=0)
    resume_downloads = models.IntegerField(default=0)

    # Referrer tracking
    referrer_data = models.JSONField(default=dict)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['portfolio', 'date'], name='unique_portfolio_date')
        ]
        ordering = ['-date']

    def __str__(self):
        return f"{self.portfolio.user.username} - {self.date}"


class PortfolioEvent(models.Model):
    """Lightweight event stream for conversion and engagement analytics."""

    EVENT_TYPE_CHOICES = [
        ('page_view', 'Page View'),
        ('cta_click', 'CTA Click'),
        ('project_click', 'Project Click'),
        ('resume_click', 'Resume Click'),
    ]

    portfolio = models.ForeignKey(
        Portfolio,
        on_delete=models.CASCADE,
        related_name='events'
    )
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES)
    referrer = models.CharField(max_length=500, blank=True)
    session_key = models.CharField(max_length=120, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['portfolio', 'event_type', 'created_at']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.portfolio.user.username}::{self.event_type}"
