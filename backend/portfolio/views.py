from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.text import slugify
import uuid

from .models import Portfolio, PortfolioProject, PortfolioAnalytics
from .serializers import (
    PortfolioSerializer,
    PortfolioUpdateSerializer,
    PortfolioProjectSerializer,
    PublicPortfolioSerializer,
    PortfolioAnalyticsSerializer
)
from subscriptions.models import Subscription
from subscriptions.permissions import (
    HasActiveSubscription,
    HasActiveOrGraceSubscription,
    CanAccessPortfolioAnalytics,
    CanUseCustomSubdomain,
    IsGraceOrReadOnly
)


class PortfolioViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Portfolio model.
    """
    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Portfolio.objects.filter(user=self.request.user)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'add_project', 'remove_project']:
            return [IsAuthenticated(), HasActiveSubscription()]
        return super().get_permissions()

    def perform_create(self, serializer):
        # Generate unique slug
        base_slug = slugify(self.request.user.username)
        slug = base_slug
        counter = 1
        while Portfolio.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        serializer.save(user=self.request.user, slug=slug)

    @action(detail=False, methods=['get'])
    def my_portfolio(self, request):
        """Get or create user's portfolio."""
        try:
            portfolio, created = Portfolio.objects.get_or_create(
                user=request.user,
                defaults={
                    'slug': slugify(request.user.username) + '-' + str(uuid.uuid4())[:8],
                    'status': 'archived'
                }
            )
            
            # Update status based on subscription
            subscription = Subscription.get_active_subscription(request.user)
            portfolio.update_status_from_subscription(subscription)
            
            serializer = PortfolioSerializer(portfolio)
            return Response(serializer.data)
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"Portfolio Error: {error_details}")
            return Response(
                {
                    "error": str(e),
                    "traceback": error_details,
                    "message": "Failed to initialize or fetch portfolio"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_settings(self, request):
        """Update portfolio settings."""
        portfolio = get_object_or_404(Portfolio, user=request.user)
        
        serializer = PortfolioUpdateSerializer(portfolio, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(PortfolioSerializer(portfolio).data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, CanUseCustomSubdomain])
    def set_subdomain(self, request):
        """Set custom subdomain for portfolio."""
        portfolio = get_object_or_404(Portfolio, user=request.user)
        subdomain = request.data.get('subdomain', '').lower().strip()
        
        if not subdomain:
            return Response(
                {"error": "Subdomain is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate subdomain format
        import re
        if not re.match(r'^[a-z0-9-]+$', subdomain):
            return Response(
                {"error": "Subdomain can only contain lowercase letters, numbers, and hyphens"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if subdomain is available
        if Portfolio.objects.filter(custom_subdomain=subdomain).exclude(id=portfolio.id).exists():
            return Response(
                {"error": "Subdomain is already taken"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        portfolio.custom_subdomain = subdomain
        portfolio.save()
        
        return Response(PortfolioSerializer(portfolio).data)

    @action(detail=False, methods=['post'])
    def add_project(self, request):
        """Add a project to portfolio (roadmap or student project)."""
        portfolio = get_object_or_404(Portfolio, user=request.user)
        project_id = request.data.get('project_id')
        project_type = request.data.get('project_type', 'roadmap')
        
        if not project_id:
            return Response(
                {"error": "project_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if project_type not in ['roadmap', 'student']:
            return Response(
                {"error": "project_type must be 'roadmap' or 'student'"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if project_type == 'roadmap':
            from roadmap_ai.models import Project
            project = get_object_or_404(Project, id=project_id)
            
            # Verify project belongs to user's roadmap
            if project.milestone.roadmap.user != request.user:
                return Response(
                    {"error": "Project not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if already added
            if PortfolioProject.objects.filter(
                portfolio=portfolio, 
                project_type='roadmap',
                project=project
            ).exists():
                return Response(
                    {"error": "Project already in portfolio"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            portfolio_project = PortfolioProject.objects.create(
                portfolio=portfolio,
                project_type='roadmap',
                project=project
            )
        else:  # student project
            from roadmap_ai.models import StudentProject
            student_project = get_object_or_404(StudentProject, id=project_id)
            
            # Verify project belongs to user
            if student_project.user != request.user:
                return Response(
                    {"error": "Project not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if already added
            if PortfolioProject.objects.filter(
                portfolio=portfolio,
                project_type='student',
                student_project=student_project
            ).exists():
                return Response(
                    {"error": "Project already in portfolio"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            portfolio_project = PortfolioProject.objects.create(
                portfolio=portfolio,
                project_type='student',
                student_project=student_project
            )
        
        return Response(PortfolioProjectSerializer(portfolio_project).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def remove_project(self, request):
        """Remove a project from portfolio."""
        portfolio = get_object_or_404(Portfolio, user=request.user)
        project_id = request.data.get('project_id')
        project_type = request.data.get('project_type', 'roadmap')
        
        if project_type == 'roadmap':
            portfolio_project = get_object_or_404(
                PortfolioProject,
                portfolio=portfolio,
                project_type='roadmap',
                project_id=project_id
            )
        else:
            portfolio_project = get_object_or_404(
                PortfolioProject,
                portfolio=portfolio,
                project_type='student',
                student_project_id=project_id
            )
        
        portfolio_project.delete()
        
        return Response({"message": "Project removed from portfolio"})

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, CanAccessPortfolioAnalytics])
    def analytics(self, request):
        """Get portfolio analytics."""
        portfolio = get_object_or_404(Portfolio, user=request.user)
        
        # Get analytics for last 30 days
        from datetime import timedelta
        thirty_days_ago = timezone.now().date() - timedelta(days=30)
        
        analytics = PortfolioAnalytics.objects.filter(
            portfolio=portfolio,
            date__gte=thirty_days_ago
        )
        
        serializer = PortfolioAnalyticsSerializer(analytics, many=True)
        
        # Calculate totals
        totals = {
            'total_page_views': sum(a.page_views for a in analytics),
            'total_unique_visitors': sum(a.unique_visitors for a in analytics),
            'total_project_clicks': sum(a.project_clicks for a in analytics),
            'total_github_clicks': sum(a.github_clicks for a in analytics),
            'total_resume_downloads': sum(a.resume_downloads for a in analytics),
        }
        
        return Response({
            'daily': serializer.data,
            'totals': totals
        })


@api_view(['GET'])
@permission_classes([AllowAny])
def public_portfolio(request, slug):
    """
    Public portfolio view.
    Status-based access control:
    - ACTIVE: Full access
    - GRACE: Full access
    - READ_ONLY: Only name + project titles, no resume download, no GitHub deep links
    - ARCHIVED: 404
    """
    portfolio = get_object_or_404(Portfolio, slug=slug)
    
    if portfolio.status == 'archived':
        return Response(
            {"error": "Portfolio not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Track analytics
    if portfolio.status in ['active', 'grace']:
        today = timezone.now().date()
        analytics, created = PortfolioAnalytics.objects.get_or_create(
            portfolio=portfolio,
            date=today
        )
        analytics.page_views += 1
        analytics.save()
    
    serializer = PublicPortfolioSerializer(portfolio)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_portfolio_by_subdomain(request, subdomain):
    """
    Public portfolio view by custom subdomain.
    """
    portfolio = get_object_or_404(Portfolio, custom_subdomain=subdomain)
    
    if portfolio.status == 'archived':
        return Response(
            {"error": "Portfolio not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Track analytics
    if portfolio.status in ['active', 'grace']:
        today = timezone.now().date()
        analytics, created = PortfolioAnalytics.objects.get_or_create(
            portfolio=portfolio,
            date=today
        )
        analytics.page_views += 1
        analytics.save()
    
    serializer = PublicPortfolioSerializer(portfolio)
    return Response(serializer.data)
