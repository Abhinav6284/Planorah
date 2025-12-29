from django.db import models
from django.conf import settings
from django.utils import timezone


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

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='portfolio'
    )
    
    # Portfolio URL configuration
    slug = models.SlugField(max_length=100, unique=True)
    custom_subdomain = models.CharField(max_length=50, blank=True, null=True, unique=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='archived')
    
    # Content
    title = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    headline = models.CharField(max_length=200, blank=True)
    
    # Social links
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)
    
    # Settings
    show_email = models.BooleanField(default=False)
    theme = models.CharField(max_length=50, default='default')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_status_change = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Portfolios'

    def __str__(self):
        return f"{self.user.username}'s Portfolio ({self.status})"

    @property
    def public_url(self):
        """Get the public URL for this portfolio."""
        if self.custom_subdomain:
            return f"https://{self.custom_subdomain}.planorah.me"
        return f"https://planorah.me/p/{self.slug}"

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
            self.transition_to_archived()
            return
        
        if subscription.is_active:
            self.transition_to_active()
        elif subscription.is_in_grace:
            self.transition_to_grace()
        elif subscription.status == 'expired':
            self.transition_to_read_only()
        else:
            self.transition_to_archived()


class PortfolioProject(models.Model):
    """
    Project displayed on the portfolio.
    Links to the roadmap project.
    """
    portfolio = models.ForeignKey(
        Portfolio,
        on_delete=models.CASCADE,
        related_name='portfolio_projects'
    )
    project = models.ForeignKey(
        'roadmap_ai.Project',
        on_delete=models.CASCADE,
        related_name='portfolio_entries'
    )
    
    # Display settings
    order = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_visible = models.BooleanField(default=True)
    
    # Custom overrides for display
    custom_title = models.CharField(max_length=255, blank=True)
    custom_description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_featured', 'order']
        unique_together = ['portfolio', 'project']

    def __str__(self):
        return f"{self.portfolio.user.username} - {self.project.title}"

    @property
    def display_title(self):
        return self.custom_title or self.project.title

    @property
    def display_description(self):
        return self.custom_description or self.project.description


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
        unique_together = ['portfolio', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.portfolio.user.username} - {self.date}"
