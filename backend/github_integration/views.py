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
        project_type = serializer.validated_data.get('project_type', 'roadmap')
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
        
        # Get project based on type
        if project_type == 'roadmap':
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
            
            # Check if repo already exists
            existing_repo = GitHubRepository.objects.filter(
                project_type='roadmap',
                project=project
            ).first()
        else:  # student project
            from roadmap_ai.models import StudentProject
            try:
                project = StudentProject.objects.get(id=project_id)
            except StudentProject.DoesNotExist:
                return Response({
                    'error': 'Project not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Verify project belongs to user
            if project.user != request.user:
                return Response({
                    'error': 'Project not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Check if repo already exists
            existing_repo = GitHubRepository.objects.filter(
                project_type='student',
                student_project=project
            ).first()
        
        if existing_repo:
            return Response({
                'error': 'Project already published to GitHub',
                'repo_url': existing_repo.repo_url
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate repo name if not provided
        if not repo_name:
            repo_name = project.title.lower().replace(' ', '-')
            repo_name = ''.join(c if c.isalnum() or c == '-' else '' for c in repo_name)
        
        # Generate README content
        tech_stack = project.tech_stack if hasattr(project, 'tech_stack') else []
        tech_stack_str = ', '.join(tech_stack) if isinstance(tech_stack, list) else str(tech_stack)
        
        readme_content = f"""# {project.title}

{project.description}

## Tech Stack
{tech_stack_str}

## About
This project was created using [Planorah](https://planorah.me) - Your Career Execution Platform.

## Getting Started
Add your setup instructions here.

## License
MIT License
"""
        
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
                'auto_init': False  # We'll create README manually
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
        repo_full_name = repo_data.get('full_name')
        
        # Create README.md file
        import base64
        readme_encoded = base64.b64encode(readme_content.encode()).decode()
        
        readme_response = requests.put(
            f'https://api.github.com/repos/{repo_full_name}/contents/README.md',
            headers={
                'Authorization': f'Bearer {credential.access_token}',
                'Accept': 'application/json'
            },
            json={
                'message': commit_message,
                'content': readme_encoded
            },
            timeout=30
        )
        
        # Save repository reference
        github_repo_data = {
            'user': request.user,
            'project_type': project_type,
            'repo_name': repo_name,
            'repo_full_name': repo_full_name,
            'repo_url': repo_data.get('html_url'),
            'clone_url': repo_data.get('clone_url'),
            'is_private': is_private,
            'last_synced_at': timezone.now()
        }
        
        if project_type == 'roadmap':
            github_repo_data['project'] = project
        else:
            github_repo_data['student_project'] = project
        
        github_repo = GitHubRepository.objects.create(**github_repo_data)
        
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
    
    @action(detail=False, methods=['post'])
    def sync_stats(self, request):
        """Sync GitHub stats for user's repositories."""
        repo_id = request.data.get('repo_id')
        
        try:
            credential = GitHubCredential.objects.get(user=request.user)
        except GitHubCredential.DoesNotExist:
            return Response({
                'error': 'GitHub not connected'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if repo_id:
            repos = GitHubRepository.objects.filter(id=repo_id, user=request.user)
        else:
            repos = GitHubRepository.objects.filter(user=request.user)
        
        synced_count = 0
        errors = []
        
        for repo in repos:
            try:
                # Fetch repository data from GitHub
                repo_response = requests.get(
                    f'https://api.github.com/repos/{repo.repo_full_name}',
                    headers={
                        'Authorization': f'Bearer {credential.access_token}',
                        'Accept': 'application/json'
                    },
                    timeout=30
                )
                
                if repo_response.status_code == 200:
                    repo_data = repo_response.json()
                    
                    # Update stats
                    repo.stars_count = repo_data.get('stargazers_count', 0)
                    repo.forks_count = repo_data.get('forks_count', 0)
                    repo.watchers_count = repo_data.get('watchers_count', 0)
                    
                    # Fetch latest commit
                    commits_response = requests.get(
                        f'https://api.github.com/repos/{repo.repo_full_name}/commits',
                        headers={
                            'Authorization': f'Bearer {credential.access_token}',
                            'Accept': 'application/json'
                        },
                        params={'per_page': 1},
                        timeout=30
                    )
                    
                    if commits_response.status_code == 200:
                        commits = commits_response.json()
                        if commits:
                            latest_commit = commits[0]
                            from django.utils.dateparse import parse_datetime
                            commit_date_str = latest_commit.get('commit', {}).get('author', {}).get('date')
                            if commit_date_str:
                                repo.last_commit_date = parse_datetime(commit_date_str)
                            repo.last_commit_message = latest_commit.get('commit', {}).get('message', '')[:200]
                    
                    repo.last_synced_at = timezone.now()
                    repo.sync_error = ''
                    repo.save()
                    synced_count += 1
                else:
                    error_msg = f"Failed to fetch {repo.repo_name}: {repo_response.status_code}"
                    repo.sync_error = error_msg
                    repo.save()
                    errors.append(error_msg)
                    
            except Exception as e:
                error_msg = f"Error syncing {repo.repo_name}: {str(e)}"
                repo.sync_error = error_msg
                repo.save()
                errors.append(error_msg)
        
        return Response({
            'message': f'Synced {synced_count} repositories',
            'synced_count': synced_count,
            'total_repos': repos.count(),
            'errors': errors
        })
