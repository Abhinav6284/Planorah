from rest_framework import serializers
from .models import Plan


class PlanSerializer(serializers.ModelSerializer):
    """Serializer for Plan model."""

    # Legacy/computed fields (kept for frontend/backward compatibility)
    is_short_roadmap = serializers.BooleanField(read_only=True)
    project_limit_min = serializers.IntegerField(read_only=True)
    project_limit_max = serializers.IntegerField(read_only=True)
    resume_limit = serializers.IntegerField(read_only=True)
    portfolio_analytics = serializers.BooleanField(read_only=True)
    custom_subdomain = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Plan
        fields = [
            'id',
            'name',
            'display_name',
            'price_inr',
            'validity_days',
            'roadmap_limit',
            'is_short_roadmap',
            'project_limit_min',
            'project_limit_max',
            'resume_limit',
            # Current schema fields
            'resume_full',
            'job_finder_unlimited',
            'quicky_ai_daily_limit',
            'has_project_management',
            'ats_scan_limit',
            'ats_rate_limit_per_day',
            'has_resources_hub',
            'has_portfolio_live',
            'portfolio_addon_price_inr',
            'sessions_per_month',
            'session_duration_minutes',
            'has_priority_booking',
            'has_async_support',
            'has_early_access',
            # Legacy flags
            'portfolio_analytics',
            'custom_subdomain',
            'is_active',
        ]
        read_only_fields = fields


class PlanComparisonSerializer(serializers.ModelSerializer):
    """Serializer for plan comparison view."""
    
    features = serializers.SerializerMethodField()
    
    class Meta:
        model = Plan
        fields = [
            'id',
            'name',
            'display_name',
            'price_inr',
            'validity_days',
            'features',
        ]

    def get_features(self, obj):
        """Get formatted feature list for comparison."""
        features = []
        
        # Roadmaps
        if obj.roadmap_limit == -1:
            roadmap_text = "Unlimited"
        else:
            roadmap_text = f"{obj.roadmap_limit}/month"
        features.append({'name': 'Career Roadmaps', 'value': roadmap_text})

        # Resume generator
        features.append({'name': 'Resume Generator', 'value': 'Full' if obj.resume_full else 'Basic'})

        # Job finder
        features.append({'name': 'Job Finder', 'value': 'Unlimited' if obj.job_finder_unlimited else 'Limited'})

        # Quicky AI
        if obj.quicky_ai_daily_limit == -1:
            ai_text = "Unlimited"
        else:
            ai_text = f"{obj.quicky_ai_daily_limit}/day"
        features.append({'name': 'Quicky AI', 'value': ai_text})

        # Task & project management
        features.append({'name': 'Task & Project Management', 'value': 'Yes' if obj.has_project_management else 'Basic'})

        # ATS scanner
        if obj.ats_scan_limit == -1:
            ats_text = "Unlimited"
        elif obj.ats_scan_limit == 0:
            ats_text = "Not included"
        else:
            ats_text = f"{obj.ats_scan_limit}"
        features.append({'name': 'ATS Scanner', 'value': ats_text})

        # Resources hub
        features.append({'name': 'Resources Hub', 'value': 'Yes' if obj.has_resources_hub else 'No'})

        # Portfolio live
        if obj.has_portfolio_live and obj.portfolio_addon_price_inr and obj.portfolio_addon_price_inr > 0:
            portfolio_text = f"Addon (₹{obj.portfolio_addon_price_inr})"
        elif obj.has_portfolio_live:
            portfolio_text = "Included"
        else:
            portfolio_text = "No"
        features.append({'name': 'Portfolio Live', 'value': portfolio_text})

        # Sessions
        if obj.sessions_per_month and obj.sessions_per_month > 0:
            features.append({
                'name': '1:1 Sessions',
                'value': f"{obj.sessions_per_month}/month ({obj.session_duration_minutes} min)",
            })

        # Elite extras
        if obj.has_priority_booking:
            features.append({'name': 'Priority booking', 'value': 'Yes'})
        if obj.has_async_support:
            features.append({'name': 'Async support', 'value': 'Yes'})
        if obj.has_early_access:
            features.append({'name': 'Early access', 'value': 'Yes'})
        
        return features
