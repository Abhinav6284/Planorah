from django.db import models


class Plan(models.Model):
    """
    Subscription plans for the career execution platform.
    Pricing and limits are locked as per specification.
    """
    PLAN_CHOICES = [
        ('explorer', 'Explorer'),
        ('starter', 'Starter Builder'),
        ('career_ready', 'Career Ready'),
        ('placement_pro', 'Placement Pro'),
    ]

    name = models.CharField(max_length=50, choices=PLAN_CHOICES, unique=True)
    display_name = models.CharField(max_length=100)
    price_inr = models.DecimalField(max_digits=10, decimal_places=2)
    validity_days = models.IntegerField()
    
    # Roadmap limits
    roadmap_limit = models.IntegerField(help_text="Number of roadmaps allowed")
    is_short_roadmap = models.BooleanField(default=False, help_text="True for Explorer plan short roadmaps")
    
    # Project limits
    project_limit_min = models.IntegerField(help_text="Minimum projects allowed")
    project_limit_max = models.IntegerField(help_text="Maximum projects allowed")
    
    # Resume limits
    resume_limit = models.IntegerField(help_text="Number of resume versions allowed, -1 for time-bound unlimited")
    
    # ATS scan limits
    ats_scan_limit = models.IntegerField(help_text="Number of ATS scans, -1 for rate-limited unlimited")
    ats_rate_limit_per_day = models.IntegerField(default=0, help_text="Daily rate limit for unlimited plans")
    
    # Portfolio features
    portfolio_analytics = models.BooleanField(default=False)
    custom_subdomain = models.BooleanField(default=False, help_text="name.platform.com")
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['price_inr']

    def __str__(self):
        return f"{self.display_name} - ₹{self.price_inr}"

    @classmethod
    def create_default_plans(cls):
        """Create the 4 locked pricing plans."""
        plans_data = [
            {
                'name': 'explorer',
                'display_name': 'Explorer',
                'price_inr': 49,
                'validity_days': 14,
                'roadmap_limit': 1,
                'is_short_roadmap': True,
                'project_limit_min': 1,
                'project_limit_max': 1,
                'resume_limit': 1,
                'ats_scan_limit': 1,
                'ats_rate_limit_per_day': 0,
                'portfolio_analytics': False,
                'custom_subdomain': False,
            },
            {
                'name': 'starter',
                'display_name': 'Starter Builder',
                'price_inr': 99,
                'validity_days': 30,
                'roadmap_limit': 1,
                'is_short_roadmap': False,
                'project_limit_min': 2,
                'project_limit_max': 3,
                'resume_limit': 2,
                'ats_scan_limit': 3,
                'ats_rate_limit_per_day': 0,
                'portfolio_analytics': False,
                'custom_subdomain': False,
            },
            {
                'name': 'career_ready',
                'display_name': 'Career Ready',
                'price_inr': 199,
                'validity_days': 60,
                'roadmap_limit': 2,
                'is_short_roadmap': False,
                'project_limit_min': 4,
                'project_limit_max': 5,
                'resume_limit': -1,  # Time-bound unlimited
                'ats_scan_limit': 10,
                'ats_rate_limit_per_day': 0,
                'portfolio_analytics': True,
                'custom_subdomain': False,
            },
            {
                'name': 'placement_pro',
                'display_name': 'Placement Pro',
                'price_inr': 399,
                'validity_days': 90,
                'roadmap_limit': 3,
                'is_short_roadmap': False,
                'project_limit_min': 6,
                'project_limit_max': 8,
                'resume_limit': -1,  # Time-bound unlimited
                'ats_scan_limit': -1,  # Rate-limited unlimited
                'ats_rate_limit_per_day': 5,
                'portfolio_analytics': True,
                'custom_subdomain': True,
            },
        ]
        
        for plan_data in plans_data:
            cls.objects.update_or_create(
                name=plan_data['name'],
                defaults=plan_data
            )
