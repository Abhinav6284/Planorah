from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.utils import timezone
import requests

from .models import GitHubCredential, GitHubRepository, GitHubPublishLog
from .serializers import (
    GitHubCredentialSerializer,
    GitHubRepositorySerializer,
    GitHubPublishLogSerializer,
    GitHubPublishRequestSerializer,
    GitHubConnectSerializer
)
from subscriptions.models import Subscription
from subscriptions.permissions import HasActiveSubscription


class GitHubIntegrationViewSet(viewsets.ViewSet):
    """
    ViewSet for GitHub integration.
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def status(self, request):
        """Check GitHub connection status."""
        try:
            credential = GitHubCredential.objects.get(user=request.user)
            serializer = GitHubCredentialSerializer(credential)
            return Response({
                'connected': True,
                **serializer.data
            })
        except GitHubCredential.DoesNotExist:
            return Response({
                'connected': False,
                'message': 'GitHub not connected'
            })

    @action(detail=False, methods=['post'])
    def connect(self, request):
        """Connect GitHub account using OAuth code."""
        serializer = GitHubConnectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        code = serializer.validated_data['code']
        redirect_uri = serializer.validated_data.get(
            'redirect_uri',
            settings.GITHUB_OAUTH_REDIRECT_URI
        )
        
        # Exchange code for access token
        token_response = requests.post(
            'https://github.com/login/oauth/access_token',
            data={
                'client_id': settings.GITHUB_OAUTH_CLIENT_ID,
                'client_secret': settings.GITHUB_OAUTH_CLIENT_SECRET,
                'code': code,
                'redirect_uri': redirect_uri,
            },
            headers={'Accept': 'application/json'},
            timeout=30
        )
        
        token_data = token_response.json()
        
        if 'error' in token_data:
            return Response({
                'error': 'Failed to connect GitHub',
                'details': token_data.get('error_description', token_data.get('error'))
            }, status=status.HTTP_400_BAD_REQUEST)
        
        access_token = token_data.get('access_token')
        scope = token_data.get('scope', '')
        
        if not access_token:
            return Response({
                'error': 'No access token received'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Fetch GitHub user info
        user_response = requests.get(
            'https://api.github.com/user',
            headers={
                'Authorization': f'Bearer {access_token}',
                'Accept': 'application/json'
            },
            timeout=30
        )
        
        github_user = user_response.json()
        
        # Create or update credential
        credential, created = GitHubCredential.objects.update_or_create(
            user=request.user,
            defaults={
                'access_token': access_token,
                'scope': scope,
                'github_username': github_user.get('login', ''),
                'github_id': str(github_user.get('id', '')),
                'github_avatar_url': github_user.get('avatar_url', ''),
            }
        )
        
        return Response({
            'message': 'GitHub connected successfully',
            'github_username': credential.github_username
        })

    @action(detail=False, methods=['post'])
    def disconnect(self, request):
        """Disconnect GitHub account."""
        try:
            credential = GitHubCredential.objects.get(user=request.user)
            credential.delete()
            return Response({'message': 'GitHub disconnected'})
        except GitHubCredential.DoesNotExist:
            return Response({
                'error': 'GitHub not connected'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, HasActiveSubscription])
    def publish(self, request):
        """Publish a project to GitHub."""
        serializer = GitHubPublishRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        project_id = serializer.validated_data['project_id']
        repo_name = serializer.validated_data.get('repo_name')
        is_private = serializer.validated_data.get('is_private', False)
        commit_message = serializer.validated_data.get('commit_message', 'Initial commit from Planorah')
        
        # Check subscription limits
        subscription = Subscription.get_active_subscription(request.user)
        if not subscription or not subscription.is_active:
            return Response({
                'error': 'Active subscription required'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get GitHub credential
        try:
            credential = GitHubCredential.objects.get(user=request.user)
        except GitHubCredential.DoesNotExist:
            return Response({
                'error': 'GitHub not connected. Please connect your GitHub account first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get project
        from roadmap_ai.models import Project
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({
                'error': 'Project not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Verify project belongs to user
        if project.milestone.roadmap.user != request.user:
            return Response({
                'error': 'Project not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Generate repo name if not provided
        if not repo_name:
            repo_name = project.title.lower().replace(' ', '-')
            repo_name = ''.join(c if c.isalnum() or c == '-' else '' for c in repo_name)
        
        # Check if repo already exists for this project
        existing_repo = GitHubRepository.objects.filter(project=project).first()
        if existing_repo:
            return Response({
                'error': 'Project already published to GitHub',
                'repo_url': existing_repo.repo_url
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create repository on GitHub
        create_response = requests.post(
            'https://api.github.com/user/repos',
            headers={
                'Authorization': f'Bearer {credential.access_token}',
                'Accept': 'application/json'
            },
            json={
                'name': repo_name,
                'description': project.description[:200] if project.description else '',
                'private': is_private,
                'auto_init': True
            },
            timeout=30
        )
        
        if create_response.status_code not in [200, 201]:
            error_data = create_response.json()
            return Response({
                'error': 'Failed to create repository',
                'details': error_data.get('message', 'Unknown error')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        repo_data = create_response.json()
        
        # Save repository reference
        github_repo = GitHubRepository.objects.create(
            user=request.user,
            project=project,
            repo_name=repo_name,
            repo_full_name=repo_data.get('full_name'),
            repo_url=repo_data.get('html_url'),
            clone_url=repo_data.get('clone_url'),
            is_private=is_private,
            last_synced_at=timezone.now()
        )
        
        # Log the publish action
        GitHubPublishLog.objects.create(
            repository=github_repo,
            action='create',
            status='success',
            commit_message=commit_message
        )
        
        # Update project with GitHub URL
        project.github_url = repo_data.get('html_url')
        project.save()
        
        return Response({
            'message': 'Project published to GitHub',
            'repo_url': repo_data.get('html_url'),
            'clone_url': repo_data.get('clone_url')
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def repositories(self, request):
        """List all published repositories."""
        repos = GitHubRepository.objects.filter(user=request.user)
        serializer = GitHubRepositorySerializer(repos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def logs(self, request):
        """Get publish logs for a repository."""
        repo_id = request.query_params.get('repo_id')
        
        if repo_id:
            logs = GitHubPublishLog.objects.filter(
                repository_id=repo_id,
                repository__user=request.user
            )
        else:
            logs = GitHubPublishLog.objects.filter(
                repository__user=request.user
            )[:50]
        
        serializer = GitHubPublishLogSerializer(logs, many=True)
        return Response(serializer.data)
