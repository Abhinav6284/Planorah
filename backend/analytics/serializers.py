from rest_framework import serializers
from .models import UserProgress, RoadmapProgress, DailyActivity, UsageLog


class UserProgressSerializer(serializers.ModelSerializer):
    """Serializer for UserProgress model."""
    
    class Meta:
        model = UserProgress
        fields = [
            'total_roadmaps_completed',
            'total_projects_completed',
            'total_tasks_completed',
            'total_resumes_created',
            'total_ats_scans',
            'total_study_minutes',
            'current_streak',
            'longest_streak',
            'last_activity_date',
            'last_active_at',
        ]
        read_only_fields = fields


class RoadmapProgressSerializer(serializers.ModelSerializer):
    """Serializer for RoadmapProgress model."""
    
    roadmap_title = serializers.CharField(source='roadmap.title', read_only=True)
    
    class Meta:
        model = RoadmapProgress
        fields = [
            'id',
            'roadmap',
            'roadmap_title',
            'milestones_completed',
            'total_milestones',
            'tasks_completed',
            'total_tasks',
            'projects_completed',
            'total_projects',
            'completion_percentage',
            'is_completed',
            'started_at',
            'completed_at',
            'last_activity_at',
        ]
        read_only_fields = fields


class DailyActivitySerializer(serializers.ModelSerializer):
    """Serializer for DailyActivity model."""
    
    class Meta:
        model = DailyActivity
        fields = [
            'date',
            'tasks_completed',
            'projects_worked',
            'resumes_created',
            'ats_scans_run',
            'minutes_active',
            'login_count',
        ]
        read_only_fields = fields


class UsageLogSerializer(serializers.ModelSerializer):
    """Serializer for UsageLog model."""
    
    class Meta:
        model = UsageLog
        fields = [
            'id',
            'action',
            'resource_type',
            'resource_id',
            'metadata',
            'created_at',
        ]
        read_only_fields = fields


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics."""
    
    # Subscription info
    subscription_status = serializers.CharField()
    plan_name = serializers.CharField()
    days_remaining = serializers.IntegerField()
    
    # Usage
    roadmaps_used = serializers.IntegerField()
    roadmaps_limit = serializers.IntegerField()
    projects_used = serializers.IntegerField()
    projects_limit = serializers.IntegerField()
    resumes_used = serializers.IntegerField()
    resumes_limit = serializers.IntegerField()
    ats_scans_used = serializers.IntegerField()
    ats_scans_limit = serializers.IntegerField()
    
    # Progress
    current_streak = serializers.IntegerField()
    tasks_completed_today = serializers.IntegerField()
    overall_completion = serializers.FloatField()


class ActivityChartSerializer(serializers.Serializer):
    """Serializer for activity chart data."""
    
    dates = serializers.ListField(child=serializers.DateField())
    tasks_completed = serializers.ListField(child=serializers.IntegerField())
    minutes_active = serializers.ListField(child=serializers.IntegerField())
