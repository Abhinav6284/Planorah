from django.db import models


class Plan(models.Model):
    """
    Subscription plans for the career execution platform.
    Pricing and limits are locked as per specification.
    """
    PLAN_CHOICES = [
        ('free', 'Free'),
        ('starter', 'Starter'),
        ('pro', 'Pro'),
        ('elite', 'Elite'),
    ]

    name = models.CharField(max_length=50, choices=PLAN_CHOICES, unique=True)
    display_name = models.CharField(max_length=100)
    price_inr = models.DecimalField(max_digits=10, decimal_places=2)
    validity_days = models.IntegerField(default=30)

    # Roadmap limits (-1 = unlimited)
    roadmap_limit = models.IntegerField(help_text="Roadmaps per month, -1 for unlimited")

    # Resume
    resume_full = models.BooleanField(default=False, help_text="Full resume generator vs basic")

    # Job Finder
    job_finder_unlimited = models.BooleanField(default=False)

    # Quicky AI
    quicky_ai_daily_limit = models.IntegerField(default=5, help_text="Daily AI query limit, -1 for unlimited")

    # Task & Project Management
    has_project_management = models.BooleanField(default=False)

    # ATS Scanner
    ats_scan_limit = models.IntegerField(default=0, help_text="ATS scans allowed, -1 for unlimited, 0 for none")
    ats_rate_limit_per_day = models.IntegerField(default=0)

    # Resources Hub
    has_resources_hub = models.BooleanField(default=False)

    # Portfolio Live
    has_portfolio_live = models.BooleanField(default=False)
    portfolio_addon_price_inr = models.DecimalField(max_digits=6, decimal_places=2, default=0, help_text="0 if included, >0 if addon")

    # 1:1 Sessions
    sessions_per_month = models.IntegerField(default=0)
    session_duration_minutes = models.IntegerField(default=0)

    # Elite extras
    has_priority_booking = models.BooleanField(default=False)
    has_async_support = models.BooleanField(default=False)
    has_early_access = models.BooleanField(default=False)

    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['price_inr']

    def __str__(self):
        return f"{self.display_name} - ₹{self.price_inr}"

    # ---------------------------------------------------------------------
    # Legacy fields (API/backward compatibility)
    #
    # The frontend and several backend modules still expect the older plan
    # fields (project/resume limits, portfolio analytics, etc.). These were
    # removed from the database schema in 2026-04-22 migrations, but keeping
    # them as computed properties preserves the public API contract and
    # prevents subscription endpoints from failing at runtime.
    # ---------------------------------------------------------------------

    _LEGACY_BY_NAME = {
        # Mirrors the values used by the frontend fallback plans.
        'free': {
            'is_short_roadmap': False,
            'project_limit_min': 1,
            'project_limit_max': 5,
            'resume_limit': 1,
            'portfolio_analytics': False,
            'custom_subdomain': False,
        },
        'starter': {
            'is_short_roadmap': False,
            'project_limit_min': 1,
            'project_limit_max': 9999,
            'resume_limit': -1,
            'portfolio_analytics': False,
            'custom_subdomain': False,
        },
        'pro': {
            'is_short_roadmap': False,
            'project_limit_min': 1,
            'project_limit_max': 9999,
            'resume_limit': -1,
            'portfolio_analytics': False,
            'custom_subdomain': False,
        },
        'elite': {
            'is_short_roadmap': False,
            'project_limit_min': 1,
            'project_limit_max': 9999,
            'resume_limit': -1,
            'portfolio_analytics': False,
            'custom_subdomain': False,
        },
    }

    def _legacy(self, key, default):
        return self._LEGACY_BY_NAME.get(self.name, {}).get(key, default)

    @property
    def is_short_roadmap(self):
        return bool(self._legacy('is_short_roadmap', False))

    @property
    def project_limit_min(self):
        return int(self._legacy('project_limit_min', 0))

    @property
    def project_limit_max(self):
        return int(self._legacy('project_limit_max', 0))

    @property
    def resume_limit(self):
        return int(self._legacy('resume_limit', 0))

    @property
    def portfolio_analytics(self):
        return bool(self._legacy('portfolio_analytics', False))

    @property
    def custom_subdomain(self):
        return bool(self._legacy('custom_subdomain', False))

    @classmethod
    def create_default_plans(cls):
        """Create the 4 pricing plans."""
        allowed_names = [name for name, _ in cls.PLAN_CHOICES]
        plans_data = [
            {
                'name': 'free',
                'display_name': 'Free',
                'price_inr': 0,
                'validity_days': 36500,  # effectively permanent
                'roadmap_limit': 1,
                'resume_full': False,
                'job_finder_unlimited': False,
                'quicky_ai_daily_limit': 5,
                'has_project_management': False,
                'ats_scan_limit': 0,
                'ats_rate_limit_per_day': 0,
                'has_resources_hub': False,
                'has_portfolio_live': False,
                'portfolio_addon_price_inr': 0,
                'sessions_per_month': 0,
                'session_duration_minutes': 0,
                'has_priority_booking': False,
                'has_async_support': False,
                'has_early_access': False,
            },
            {
                'name': 'starter',
                'display_name': 'Starter',
                'price_inr': 99,
                'validity_days': 30,
                'roadmap_limit': 5,
                'resume_full': True,
                'job_finder_unlimited': True,
                'quicky_ai_daily_limit': -1,
                'has_project_management': True,
                'ats_scan_limit': 0,
                'ats_rate_limit_per_day': 0,
                'has_resources_hub': False,
                'has_portfolio_live': True,
                'portfolio_addon_price_inr': 79,  # addon price
                'sessions_per_month': 0,
                'session_duration_minutes': 0,
                'has_priority_booking': False,
                'has_async_support': False,
                'has_early_access': False,
            },
            {
                'name': 'pro',
                'display_name': 'Pro',
                'price_inr': 249,
                'validity_days': 30,
                'roadmap_limit': 15,
                'resume_full': True,
                'job_finder_unlimited': True,
                'quicky_ai_daily_limit': -1,
                'has_project_management': True,
                'ats_scan_limit': -1,
                'ats_rate_limit_per_day': 0,
                'has_resources_hub': True,
                'has_portfolio_live': True,
                'portfolio_addon_price_inr': 0,  # included
                'sessions_per_month': 5,
                'session_duration_minutes': 30,
                'has_priority_booking': False,
                'has_async_support': False,
                'has_early_access': False,
            },
            {
                'name': 'elite',
                'display_name': 'Elite',
                'price_inr': 499,
                'validity_days': 30,
                'roadmap_limit': -1,
                'resume_full': True,
                'job_finder_unlimited': True,
                'quicky_ai_daily_limit': -1,
                'has_project_management': True,
                'ats_scan_limit': -1,
                'ats_rate_limit_per_day': 0,
                'has_resources_hub': True,
                'has_portfolio_live': True,
                'portfolio_addon_price_inr': 0,  # included
                'sessions_per_month': 10,
                'session_duration_minutes': 45,
                'has_priority_booking': True,
                'has_async_support': True,
                'has_early_access': True,
            },
        ]

        for plan_data in plans_data:
            cls.objects.update_or_create(
                name=plan_data['name'],
                defaults=plan_data
            )

        # Deactivate any legacy/old plans that are no longer offered.
        cls.objects.exclude(name__in=allowed_names).filter(is_active=True).update(is_active=False)
