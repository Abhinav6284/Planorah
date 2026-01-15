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
    
    project_title = serializers.SerializerMethodField()
    
    class Meta:
        model = GitHubRepository
        fields = [
            'id',
            'project_type',
            'project',
            'student_project',
            'project_title',
            'repo_name',
            'repo_full_name',
            'repo_url',
            'clone_url',
            'is_private',
            'stars_count',
            'forks_count',
            'watchers_count',
            'last_commit_date',
            'last_commit_message',
            'last_synced_at',
            'sync_error',
            'created_at',
        ]
        read_only_fields = fields
    
    def get_project_title(self, obj):
        """Get project title based on type."""
        project = obj.get_project()
        return project.title if project else "Untitled"


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
    project_type = serializers.ChoiceField(choices=['roadmap', 'student'], default='roadmap')
    repo_name = serializers.CharField(max_length=100, required=False)
    is_private = serializers.BooleanField(default=False)
    commit_message = serializers.CharField(max_length=500, default='Initial commit from Planorah')

    def validate(self, data):
        """Validate project exists based on type."""
        project_id = data['project_id']
        project_type = data['project_type']
        
        if project_type == 'roadmap':
            from roadmap_ai.models import Project
            try:
                Project.objects.get(id=project_id)
            except Project.DoesNotExist:
                raise serializers.ValidationError("Roadmap project not found.")
        else:
            from roadmap_ai.models import StudentProject
            try:
                StudentProject.objects.get(id=project_id)
            except StudentProject.DoesNotExist:
                raise serializers.ValidationError("Student project not found.")
        
        return data


class GitHubConnectSerializer(serializers.Serializer):
    """Serializer for GitHub OAuth connection."""
    
    code = serializers.CharField()
    redirect_uri = serializers.CharField(required=False)
