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
    project_limit = serializers.IntegerField(source='plan.project_limit_max', read_only=True)
    resume_limit = serializers.IntegerField(source='plan.resume_limit', read_only=True)
    ats_scan_limit = serializers.IntegerField(source='plan.ats_scan_limit', read_only=True)
    
    can_create_roadmap = serializers.SerializerMethodField()
    can_create_project = serializers.SerializerMethodField()
    can_create_resume = serializers.SerializerMethodField()
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
            'projects_used',
            'project_limit',
            'can_create_project',
            'resumes_used',
            'resume_limit',
            'can_create_resume',
            'ats_scans_used',
            'ats_scan_limit',
            'can_run_ats_scan',
        ]

    def get_can_create_roadmap(self, obj):
        return obj.can_create_roadmap()

    def get_can_create_project(self, obj):
        return obj.can_create_project()

    def get_can_create_resume(self, obj):
        return obj.can_create_resume()

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
