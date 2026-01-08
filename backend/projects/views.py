from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError

from .models import UserProject, ProjectFile
from .serializers import (
    UserProjectListSerializer,
    UserProjectDetailSerializer,
    CreateProjectSerializer,
    ProjectFileSerializer
)
from .security import validate_project_files, sanitize_repo_name


class UserProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user code projects.
    Includes security validation on all file uploads.
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserProject.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserProjectListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CreateProjectSerializer
        return UserProjectDetailSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new project with security validation."""
        files = request.data.get('files', [])
        
        # Security validation
        try:
            validate_project_files(files)
        except ValidationError as e:
            return Response(
                {'error': str(e.message)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, status='saved')
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Update project with security validation."""
        files = request.data.get('files', [])
        
        if files:
            try:
                validate_project_files(files)
            except ValidationError as e:
                return Response(
                    {'error': str(e.message)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return super().update(request, *args, **kwargs)
    
    @action(detail=True, methods=['get'])
    def files(self, request, pk=None):
        """Get all files for a project."""
        project = self.get_object()
        serializer = ProjectFileSerializer(project.files.all(), many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_file(self, request, pk=None):
        """Add a single file to project with security check."""
        project = self.get_object()
        
        path = request.data.get('path', '')
        content = request.data.get('content', '')
        
        # Security validation
        try:
            validate_project_files([{'path': path, 'content': content}])
        except ValidationError as e:
            return Response(
                {'error': str(e.message)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if file exists
        existing = project.files.filter(path=path).first()
        if existing:
            existing.content = content
            existing.save()
            return Response(ProjectFileSerializer(existing).data)
        
        # Create new file
        file = ProjectFile.objects.create(
            project=project,
            path=path,
            content=content
        )
        project.updated_at = file.created_at
        project.save()
        
        return Response(ProjectFileSerializer(file).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'], url_path='files/(?P<file_path>.+)')
    def delete_file(self, request, pk=None, file_path=None):
        """Delete a file from project."""
        project = self.get_object()
        file = project.files.filter(path=file_path).first()
        
        if not file:
            return Response(
                {'error': 'File not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        file.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def prepare_github(self, request, pk=None):
        """Prepare project for GitHub push - sanitize name and validate."""
        project = self.get_object()
        
        repo_name = request.data.get('repo_name', project.title)
        sanitized_name = sanitize_repo_name(repo_name)
        
        # Check if project has files
        if project.files.count() == 0:
            return Response(
                {'error': 'Project has no files to push'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'sanitized_repo_name': sanitized_name,
            'file_count': project.files.count(),
            'total_size': project.total_size,
            'ready': True
        })
