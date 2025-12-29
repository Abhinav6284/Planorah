from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class Subscription(models.Model):
    """
    User subscription with lifecycle management.
    Controls access to all platform features.
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('grace', 'Grace Period'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subscriptions'
    )
    plan = models.ForeignKey(
        'plans.Plan',
        on_delete=models.PROTECT,
        related_name='subscriptions'
    )
    
    # Lifecycle dates
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    grace_end_date = models.DateTimeField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Usage tracking
    roadmaps_used = models.IntegerField(default=0)
    projects_used = models.IntegerField(default=0)
    resumes_used = models.IntegerField(default=0)
    ats_scans_used = models.IntegerField(default=0)
    ats_scans_today = models.IntegerField(default=0)
    ats_scan_reset_date = models.DateField(null=True, blank=True)
    
    # Payment reference
    payment_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['end_date']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.plan.display_name} ({self.status})"

    def save(self, *args, **kwargs):
        # Set end_date based on plan validity if not set
        if not self.end_date:
            self.end_date = self.start_date + timedelta(days=self.plan.validity_days)
        # Set grace period (7-14 days after expiry)
        if not self.grace_end_date:
            self.grace_end_date = self.end_date + timedelta(days=14)
        super().save(*args, **kwargs)

    @property
    def is_active(self):
        """Check if subscription is currently active."""
        return self.status == 'active' and timezone.now() <= self.end_date

    @property
    def is_in_grace(self):
        """Check if subscription is in grace period."""
        now = timezone.now()
        return (
            self.status == 'grace' or 
            (self.end_date < now <= self.grace_end_date)
        )

    @property
    def days_remaining(self):
        """Get days remaining in subscription."""
        if self.is_active:
            return (self.end_date - timezone.now()).days
        return 0

    def check_and_update_status(self):
        """Update subscription status based on current date."""
        now = timezone.now()
        
        if self.status == 'cancelled':
            return self.status
            
        if now <= self.end_date:
            self.status = 'active'
        elif now <= self.grace_end_date:
            self.status = 'grace'
        else:
            self.status = 'expired'
        
        self.save(update_fields=['status', 'updated_at'])
        return self.status

    def can_create_roadmap(self):
        """Check if user can create a new roadmap."""
        if not self.is_active:
            return False
        return self.roadmaps_used < self.plan.roadmap_limit

    def can_create_project(self):
        """Check if user can create a new project."""
        if not self.is_active:
            return False
        return self.projects_used < self.plan.project_limit_max

    def can_create_resume(self):
        """Check if user can create a new resume."""
        if not self.is_active:
            return False
        if self.plan.resume_limit == -1:  # Time-bound unlimited
            return True
        return self.resumes_used < self.plan.resume_limit

    def can_run_ats_scan(self):
        """Check if user can run an ATS scan."""
        if not self.is_active:
            return False
        
        # Reset daily counter if needed
        today = timezone.now().date()
        if self.ats_scan_reset_date != today:
            self.ats_scans_today = 0
            self.ats_scan_reset_date = today
            self.save(update_fields=['ats_scans_today', 'ats_scan_reset_date'])
        
        # Check rate limit for unlimited plans
        if self.plan.ats_scan_limit == -1:
            return self.ats_scans_today < self.plan.ats_rate_limit_per_day
        
        return self.ats_scans_used < self.plan.ats_scan_limit

    def increment_roadmap_usage(self):
        """Increment roadmap usage counter."""
        self.roadmaps_used += 1
        self.save(update_fields=['roadmaps_used', 'updated_at'])

    def increment_project_usage(self):
        """Increment project usage counter."""
        self.projects_used += 1
        self.save(update_fields=['projects_used', 'updated_at'])

    def increment_resume_usage(self):
        """Increment resume usage counter."""
        self.resumes_used += 1
        self.save(update_fields=['resumes_used', 'updated_at'])

    def increment_ats_scan_usage(self):
        """Increment ATS scan usage counter."""
        self.ats_scans_used += 1
        self.ats_scans_today += 1
        self.save(update_fields=['ats_scans_used', 'ats_scans_today', 'updated_at'])

    @classmethod
    def get_active_subscription(cls, user):
        """Get the user's active subscription."""
        return cls.objects.filter(
            user=user,
            status__in=['active', 'grace']
        ).order_by('-end_date').first()
