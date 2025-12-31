from rest_framework import serializers
from .models import GitHubCredential, GitHubRepository, GitHubPublishLog


class GitHubCredentialSerializer(serializers.ModelSerializer):
    """Serializer for GitHub credentials."""
    
    is_connected = serializers.SerializerMethodField()
    
    class Meta:
        model = GitHubCredential
        fields = [
            'github_username',
            'github_avatar_url',
            'is_connected',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_is_connected(self, obj):
        return obj.is_valid


class GitHubRepositorySerializer(serializers.ModelSerializer):
    """Serializer for GitHub repositories."""
    
    project_title = serializers.CharField(source='project.title', read_only=True)
    
    class Meta:
        model = GitHubRepository
        fields = [
            'id',
            'project',
            'project_title',
            'repo_name',
            'repo_full_name',
            'repo_url',
            'clone_url',
            'is_private',
            'last_synced_at',
            'sync_error',
            'created_at',
        ]
        read_only_fields = fields


class GitHubPublishLogSerializer(serializers.ModelSerializer):
    """Serializer for GitHub publish logs."""
    
    class Meta:
        model = GitHubPublishLog
        fields = [
            'id',
            'action',
            'status',
            'commit_sha',
            'commit_message',
            'error_message',
            'created_at',
        ]
        read_only_fields = fields


class GitHubPublishRequestSerializer(serializers.Serializer):
    """Serializer for GitHub publish request."""
    
    project_id = serializers.IntegerField()
    repo_name = serializers.CharField(max_length=100, required=False)
    is_private = serializers.BooleanField(default=False)
    commit_message = serializers.CharField(max_length=500, default='Initial commit from Planorah')

    def validate_project_id(self, value):
        from roadmap_ai.models import Project
        try:
            Project.objects.get(id=value)
        except Project.DoesNotExist:
            raise serializers.ValidationError("Project not found.")
        return value


class GitHubConnectSerializer(serializers.Serializer):
    """Serializer for GitHub OAuth connection."""
    
    code = serializers.CharField()
    redirect_uri = serializers.CharField(required=False)
