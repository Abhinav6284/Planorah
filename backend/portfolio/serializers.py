from rest_framework import serializers
from .models import Portfolio, PortfolioProject, PortfolioAnalytics


class PortfolioProjectSerializer(serializers.ModelSerializer):
    """Serializer for portfolio projects."""
    
    project_title = serializers.CharField(source='project.title', read_only=True)
    project_description = serializers.CharField(source='project.description', read_only=True)
    tech_stack = serializers.JSONField(source='project.tech_stack', read_only=True)
    github_url = serializers.URLField(source='project.github_url', read_only=True)
    display_title = serializers.ReadOnlyField()
    display_description = serializers.ReadOnlyField()
    
    class Meta:
        model = PortfolioProject
        fields = [
            'id',
            'project',
            'project_title',
            'project_description',
            'tech_stack',
            'github_url',
            'order',
            'is_featured',
            'is_visible',
            'custom_title',
            'custom_description',
            'display_title',
            'display_description',
        ]
        read_only_fields = ['id']


class PortfolioSerializer(serializers.ModelSerializer):
    """Serializer for Portfolio model."""
    
    portfolio_projects = PortfolioProjectSerializer(many=True, read_only=True)
    public_url = serializers.ReadOnlyField()
    is_publicly_viewable = serializers.ReadOnlyField()
    is_fully_accessible = serializers.ReadOnlyField()
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Portfolio
        fields = [
            'id',
            'slug',
            'custom_subdomain',
            'status',
            'title',
            'bio',
            'headline',
            'github_url',
            'linkedin_url',
            'twitter_url',
            'website_url',
            'show_email',
            'theme',
            'public_url',
            'is_publicly_viewable',
            'is_fully_accessible',
            'username',
            'portfolio_projects',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'status', 'created_at', 'updated_at']


class PortfolioUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating portfolio."""
    
    class Meta:
        model = Portfolio
        fields = [
            'title',
            'bio',
            'headline',
            'github_url',
            'linkedin_url',
            'twitter_url',
            'website_url',
            'show_email',
            'theme',
        ]


class PublicPortfolioSerializer(serializers.ModelSerializer):
    """Serializer for public portfolio view."""
    
    projects = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.SerializerMethodField()
    
    class Meta:
        model = Portfolio
        fields = [
            'slug',
            'username',
            'title',
            'bio',
            'headline',
            'github_url',
            'linkedin_url',
            'twitter_url',
            'website_url',
            'email',
            'theme',
            'projects',
            'status',
        ]

    def get_projects(self, obj):
        """Get visible projects with status-based filtering."""
        projects = obj.portfolio_projects.filter(is_visible=True)
        
        # If read-only status, only return basic info
        if obj.status == 'read_only':
            return [{'title': p.display_title} for p in projects]
        
        if obj.status in ['active', 'grace']:
            return PortfolioProjectSerializer(projects, many=True).data
        
        return []

    def get_email(self, obj):
        """Return email only if show_email is True and portfolio is active."""
        if obj.show_email and obj.status in ['active', 'grace']:
            return obj.user.email
        return None


class PortfolioAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for portfolio analytics."""
    
    class Meta:
        model = PortfolioAnalytics
        fields = [
            'date',
            'page_views',
            'unique_visitors',
            'project_clicks',
            'github_clicks',
            'resume_downloads',
            'referrer_data',
        ]
        read_only_fields = fields
