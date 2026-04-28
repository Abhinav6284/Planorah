from rest_framework import serializers
from .models import Subscription
from plans.serializers import PlanSerializer


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for Subscription model."""
    
    plan_details = PlanSerializer(source='plan', read_only=True)
    days_remaining = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    is_in_grace = serializers.ReadOnlyField()
    
    class Meta:
        model = Subscription
        fields = [
            'id',
            'plan',
            'plan_details',
            'start_date',
            'end_date',
            'grace_end_date',
            'status',
            'days_remaining',
            'is_active',
            'is_in_grace',
            'roadmaps_used',
            'projects_used',
            'resumes_used',
            'ats_scans_used',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'start_date',
            'end_date',
            'grace_end_date',
            'status',
            'roadmaps_used',
            'projects_used',
            'resumes_used',
            'ats_scans_used',
            'created_at',
        ]


class SubscriptionUsageSerializer(serializers.ModelSerializer):
    """Serializer for subscription usage details."""
    
    plan_name = serializers.CharField(source='plan.display_name', read_only=True)
    roadmap_limit = serializers.IntegerField(source='plan.roadmap_limit', read_only=True)
    ats_scan_limit = serializers.IntegerField(source='plan.ats_scan_limit', read_only=True)
    ats_rate_limit_per_day = serializers.IntegerField(source='plan.ats_rate_limit_per_day', read_only=True)

    # Plan feature flags / limits (not all are "usage-metered")
    resume_full = serializers.BooleanField(source='plan.resume_full', read_only=True)
    job_finder_unlimited = serializers.BooleanField(source='plan.job_finder_unlimited', read_only=True)
    quicky_ai_daily_limit = serializers.IntegerField(source='plan.quicky_ai_daily_limit', read_only=True)
    has_project_management = serializers.BooleanField(source='plan.has_project_management', read_only=True)
    has_resources_hub = serializers.BooleanField(source='plan.has_resources_hub', read_only=True)
    has_portfolio_live = serializers.BooleanField(source='plan.has_portfolio_live', read_only=True)
    portfolio_addon_price_inr = serializers.DecimalField(
        source='plan.portfolio_addon_price_inr',
        max_digits=6,
        decimal_places=2,
        read_only=True,
    )
    sessions_per_month = serializers.IntegerField(source='plan.sessions_per_month', read_only=True)
    session_duration_minutes = serializers.IntegerField(source='plan.session_duration_minutes', read_only=True)
    has_priority_booking = serializers.BooleanField(source='plan.has_priority_booking', read_only=True)
    has_async_support = serializers.BooleanField(source='plan.has_async_support', read_only=True)
    has_early_access = serializers.BooleanField(source='plan.has_early_access', read_only=True)
    
    can_create_roadmap = serializers.SerializerMethodField()
    can_run_ats_scan = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscription
        fields = [
            'plan_name',
            'status',
            'days_remaining',
            'roadmaps_used',
            'roadmap_limit',
            'can_create_roadmap',
            'ats_scans_used',
            'ats_scans_today',
            'ats_scan_limit',
            'ats_rate_limit_per_day',
            'can_run_ats_scan',
            # Plan features
            'resume_full',
            'job_finder_unlimited',
            'quicky_ai_daily_limit',
            'has_project_management',
            'has_resources_hub',
            'has_portfolio_live',
            'portfolio_addon_price_inr',
            'sessions_per_month',
            'session_duration_minutes',
            'has_priority_booking',
            'has_async_support',
            'has_early_access',
        ]

    def get_can_create_roadmap(self, obj):
        return obj.can_create_roadmap()

    def get_can_run_ats_scan(self, obj):
        return obj.can_run_ats_scan()


class SubscriptionCreateSerializer(serializers.Serializer):
    """Serializer for creating a new subscription."""
    
    plan_id = serializers.IntegerField()
    payment_id = serializers.CharField(required=False, allow_blank=True)
    
    def validate_plan_id(self, value):
        from plans.models import Plan
        try:
            plan = Plan.objects.get(id=value, is_active=True)
        except Plan.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive plan.")
        return value
