from rest_framework import serializers
from .models import Plan


class PlanSerializer(serializers.ModelSerializer):
    """Serializer for Plan model."""
    
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
            'ats_scan_limit',
            'ats_rate_limit_per_day',
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
        
        # Roadmap
        roadmap_text = f"{obj.roadmap_limit} {'short ' if obj.is_short_roadmap else ''}roadmap{'s' if obj.roadmap_limit > 1 else ''}"
        features.append({'name': 'Roadmaps', 'value': roadmap_text})
        
        # Projects
        if obj.project_limit_min == obj.project_limit_max:
            project_text = f"{obj.project_limit_min} project{'s' if obj.project_limit_min > 1 else ''}"
        else:
            project_text = f"{obj.project_limit_min}-{obj.project_limit_max} projects"
        features.append({'name': 'Projects', 'value': project_text})
        
        # Resume
        if obj.resume_limit == -1:
            resume_text = "Unlimited (time-bound)"
        else:
            resume_text = f"{obj.resume_limit} resume{'s' if obj.resume_limit > 1 else ''}"
        features.append({'name': 'Resumes', 'value': resume_text})
        
        # ATS
        if obj.ats_scan_limit == -1:
            ats_text = f"Unlimited ({obj.ats_rate_limit_per_day}/day)"
        else:
            ats_text = f"{obj.ats_scan_limit} scan{'s' if obj.ats_scan_limit > 1 else ''}"
        features.append({'name': 'ATS Scans', 'value': ats_text})
        
        # Portfolio features
        if obj.portfolio_analytics:
            features.append({'name': 'Portfolio Analytics', 'value': 'Yes'})
        if obj.custom_subdomain:
            features.append({'name': 'Custom Subdomain', 'value': 'Yes'})
        
        return features
