from rest_framework import serializers
from .models import UserProject, ProjectFile


class ProjectFileSerializer(serializers.ModelSerializer):
    """Serializer for individual project files."""
    
    class Meta:
        model = ProjectFile
        fields = ['id', 'path', 'content', 'language', 'filename', 'extension', 'created_at', 'updated_at']
        read_only_fields = ['id', 'filename', 'extension', 'created_at', 'updated_at']


class UserProjectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for project lists."""
    file_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = UserProject
        fields = [
            'id', 'title', 'description', 'status', 'language', 
            'tech_stack', 'github_repo_url', 'file_count',
            'created_at', 'updated_at'
        ]


class UserProjectDetailSerializer(serializers.ModelSerializer):
    """Full serializer with files included."""
    files = ProjectFileSerializer(many=True, read_only=True)
    file_count = serializers.IntegerField(read_only=True)
    total_size = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = UserProject
        fields = [
            'id', 'title', 'description', 'status', 'language', 
            'tech_stack', 'github_repo_url', 'github_repo_name',
            'roadmap', 'files', 'file_count', 'total_size',
            'created_at', 'updated_at'
        ]


class CreateProjectSerializer(serializers.ModelSerializer):
    """Serializer for creating a project with files."""
    files = serializers.ListField(
        child=serializers.DictField(),
        write_only=True
    )
    
    class Meta:
        model = UserProject
        fields = ['title', 'description', 'language', 'tech_stack', 'roadmap', 'files']
    
    def create(self, validated_data):
        files_data = validated_data.pop('files', [])
        project = UserProject.objects.create(**validated_data)
        
        for file_data in files_data:
            ProjectFile.objects.create(
                project=project,
                path=file_data.get('path', 'untitled'),
                content=file_data.get('content', ''),
                language=file_data.get('language', '')
            )
        
        return project
    
    def update(self, instance, validated_data):
        files_data = validated_data.pop('files', None)
        
        # Update project fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update files if provided
        if files_data is not None:
            # Delete existing files
            instance.files.all().delete()
            
            # Create new files
            for file_data in files_data:
                ProjectFile.objects.create(
                    project=instance,
                    path=file_data.get('path', 'untitled'),
                    content=file_data.get('content', ''),
                    language=file_data.get('language', '')
                )
        
        return instance
