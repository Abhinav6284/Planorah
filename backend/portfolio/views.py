import logging
import uuid

from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from roadmap_ai.models import Project, StudentProject
from subscriptions.models import Subscription
from subscriptions.permissions import (
    CanAccessPortfolioAnalytics,
    CanUseCustomSubdomain,
    HasActiveSubscription,
)

from .models import Portfolio, PortfolioProject, PortfolioAnalytics, PortfolioEvent
from .serializers import (
    PortfolioSerializer,
    PortfolioUpdateSerializer,
    PortfolioProjectSerializer,
    PublicPortfolioSerializer,
    PortfolioAnalyticsSerializer,
    PortfolioEventTrackSerializer,
)
from .services import compute_portfolio_completeness
from .throttles import PortfolioEventThrottle

logger = logging.getLogger(__name__)


class PortfolioViewSet(viewsets.ModelViewSet):
    """ViewSet for Portfolio model."""

    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Portfolio.objects.filter(user=self.request.user)
            .select_related('user')
            .prefetch_related(
                Prefetch(
                    'portfolio_projects',
                    queryset=PortfolioProject.objects.select_related(
                        'project',
                        'student_project',
                    ),
                )
            )
        )

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            return [IsAuthenticated(), HasActiveSubscription()]
        return super().get_permissions()

    def perform_create(self, serializer):
        base_slug = slugify(self.request.user.username)
        slug = base_slug
        counter = 1
        while Portfolio.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        serializer.save(user=self.request.user, slug=slug)

    @action(detail=False, methods=['get'])
    def my_portfolio(self, request):
        """Get or create current user's portfolio in a production-safe way."""
        try:
            portfolio, _ = Portfolio.objects.get_or_create(
                user=request.user,
                defaults={
                    'slug': f"{slugify(request.user.username)}-{str(uuid.uuid4())[:8]}",
                    'status': 'read_only',
                    'is_published': True,
                    'published_at': timezone.now(),
                },
            )
            subscription = Subscription.get_active_subscription(request.user)
            portfolio.update_status_from_subscription(subscription)
            serializer = self.get_serializer(portfolio)
            return Response(serializer.data)
        except Exception:
            logger.exception("Failed to fetch portfolio for user_id=%s", request.user.id)
            return Response(
                {"error": "Failed to initialize or fetch portfolio."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_settings(self, request):
        """Manual save entrypoint."""
        portfolio = get_object_or_404(Portfolio, user=request.user)
        serializer = PortfolioUpdateSerializer(
            portfolio,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(self.get_serializer(portfolio).data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def autosave(self, request):
        """Debounced autosave entrypoint. Idempotent partial update."""
        portfolio = get_object_or_404(Portfolio, user=request.user)
        serializer = PortfolioUpdateSerializer(
            portfolio,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "saved_at": timezone.now(),
                "portfolio": self.get_serializer(portfolio).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def completeness(self, request):
        """Return completeness score + missing fields for publish readiness."""
        portfolio = get_object_or_404(Portfolio, user=request.user)
        return Response(compute_portfolio_completeness(portfolio))

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def publish(self, request):
        """
        Publish / unpublish portfolio.
        Payload:
            {"is_published": true|false}
        """
        portfolio = get_object_or_404(Portfolio, user=request.user)
        desired_state = request.data.get('is_published', True)
        desired_state = bool(desired_state)

        if desired_state:
            completeness = compute_portfolio_completeness(portfolio)
            if not completeness['is_publish_ready']:
                return Response(
                    {
                        "error": "Portfolio is not publish-ready.",
                        "completeness": completeness,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            portfolio.is_published = True
            portfolio.published_at = portfolio.published_at or timezone.now()
            portfolio.save(update_fields=['is_published', 'published_at', 'updated_at'])
        else:
            portfolio.is_published = False
            portfolio.save(update_fields=['is_published', 'updated_at'])

        return Response(
            {
                "portfolio": self.get_serializer(portfolio).data,
                "completeness": compute_portfolio_completeness(portfolio),
            }
        )

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[AllowAny],
        throttle_classes=[PortfolioEventThrottle],
    )
    def track_event(self, request):
        """Track public engagement events with lightweight writes."""
        serializer = PortfolioEventTrackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        portfolio = get_object_or_404(
            Portfolio.objects.select_related('user'),
            slug=data['slug'],
            is_published=True,
        )

        if portfolio.status == 'archived':
            return Response({"error": "Portfolio not found"}, status=status.HTTP_404_NOT_FOUND)

        if not request.session.session_key:
            request.session.create()

        event_type = data['event_type']
        event_metadata = data.get('metadata', {})
        if data.get('target_url'):
            event_metadata['target_url'] = data['target_url']
        if data.get('project_id'):
            event_metadata['project_id'] = data['project_id']

        PortfolioEvent.objects.create(
            portfolio=portfolio,
            event_type=event_type,
            referrer=request.headers.get('Referer', '')[:500],
            session_key=request.session.session_key or '',
            metadata=event_metadata,
        )

        # Aggregate high-level conversion metrics for paid analytics endpoint.
        if portfolio.status in ['active', 'grace']:
            today = timezone.now().date()
            analytics, _ = PortfolioAnalytics.objects.get_or_create(
                portfolio=portfolio,
                date=today,
            )
            if event_type == 'project_click':
                analytics.project_clicks += 1
            elif event_type == 'cta_click':
                analytics.github_clicks += 1
            elif event_type == 'resume_click':
                analytics.resume_downloads += 1
            analytics.save()

        return Response({"ok": True}, status=status.HTTP_202_ACCEPTED)

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[IsAuthenticated, CanUseCustomSubdomain],
    )
    def set_subdomain(self, request):
        """Set custom subdomain for portfolio."""
        portfolio = get_object_or_404(Portfolio, user=request.user)
        subdomain = request.data.get('subdomain', '').lower().strip()

        if not subdomain:
            return Response(
                {"error": "Subdomain is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        import re
        if not re.match(r'^[a-z0-9-]+$', subdomain):
            return Response(
                {"error": "Subdomain can only contain lowercase letters, numbers, and hyphens"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Portfolio.objects.filter(custom_subdomain=subdomain).exclude(id=portfolio.id).exists():
            return Response(
                {"error": "Subdomain is already taken"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        portfolio.custom_subdomain = subdomain
        portfolio.save(update_fields=['custom_subdomain', 'updated_at'])
        return Response(self.get_serializer(portfolio).data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def add_project(self, request):
        """Add a roadmap or student project to portfolio."""
        portfolio = get_object_or_404(Portfolio, user=request.user)
        project_id = request.data.get('project_id')
        project_type = request.data.get('project_type', 'roadmap')

        if not project_id:
            return Response({"error": "project_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        if project_type not in ['roadmap', 'student']:
            return Response(
                {"error": "project_type must be 'roadmap' or 'student'"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if project_type == 'roadmap':
            project = get_object_or_404(Project, id=project_id)
            if project.milestone.roadmap.user != request.user:
                return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)

            if PortfolioProject.objects.filter(
                portfolio=portfolio,
                project_type='roadmap',
                project=project,
            ).exists():
                return Response(
                    {"error": "Project already in portfolio"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            portfolio_project = PortfolioProject.objects.create(
                portfolio=portfolio,
                project_type='roadmap',
                project=project,
            )
        else:
            student_project = get_object_or_404(StudentProject, id=project_id)
            if student_project.user != request.user:
                return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)

            if PortfolioProject.objects.filter(
                portfolio=portfolio,
                project_type='student',
                student_project=student_project,
            ).exists():
                return Response(
                    {"error": "Project already in portfolio"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            portfolio_project = PortfolioProject.objects.create(
                portfolio=portfolio,
                project_type='student',
                student_project=student_project,
            )

        return Response(
            PortfolioProjectSerializer(portfolio_project).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def remove_project(self, request):
        """Remove project from portfolio."""
        portfolio = get_object_or_404(Portfolio, user=request.user)
        project_id = request.data.get('project_id')
        project_type = request.data.get('project_type', 'roadmap')

        if project_type == 'roadmap':
            portfolio_project = get_object_or_404(
                PortfolioProject,
                portfolio=portfolio,
                project_type='roadmap',
                project_id=project_id,
            )
        else:
            portfolio_project = get_object_or_404(
                PortfolioProject,
                portfolio=portfolio,
                project_type='student',
                student_project_id=project_id,
            )
        portfolio_project.delete()
        return Response({"message": "Project removed from portfolio"})

    @action(
        detail=False,
        methods=['get'],
        permission_classes=[IsAuthenticated, CanAccessPortfolioAnalytics],
    )
    def analytics(self, request):
        """Get 30-day portfolio analytics."""
        portfolio = get_object_or_404(Portfolio, user=request.user)
        from datetime import timedelta

        thirty_days_ago = timezone.now().date() - timedelta(days=30)
        analytics = PortfolioAnalytics.objects.filter(
            portfolio=portfolio,
            date__gte=thirty_days_ago,
        )
        serializer = PortfolioAnalyticsSerializer(analytics, many=True)
        totals = {
            'total_page_views': sum(a.page_views for a in analytics),
            'total_unique_visitors': sum(a.unique_visitors for a in analytics),
            'total_project_clicks': sum(a.project_clicks for a in analytics),
            'total_github_clicks': sum(a.github_clicks for a in analytics),
            'total_resume_downloads': sum(a.resume_downloads for a in analytics),
        }
        return Response({'daily': serializer.data, 'totals': totals})


def _track_page_view(request, portfolio):
    if portfolio.status not in ['active', 'grace']:
        return

    today = timezone.now().date()
    analytics, _ = PortfolioAnalytics.objects.get_or_create(
        portfolio=portfolio,
        date=today,
    )
    analytics.page_views += 1

    if not request.session.session_key:
        request.session.create()
    session_key = request.session.session_key or ''
    if session_key:
        ref_data = analytics.referrer_data or {}
        sessions = set(ref_data.get('sessions', []))
        if session_key not in sessions:
            sessions.add(session_key)
            ref_data['sessions'] = list(sessions)[-200:]
            analytics.unique_visitors = len(sessions)
            analytics.referrer_data = ref_data

    analytics.save()


@api_view(['GET'])
@permission_classes([AllowAny])
def public_portfolio(request, slug):
    """Public portfolio by slug with status + publish gating."""
    portfolio = get_object_or_404(
        Portfolio.objects.select_related('user').prefetch_related(
            'portfolio_projects__project',
            'portfolio_projects__student_project',
        ),
        slug=slug,
        is_published=True,
    )

    if portfolio.status == 'archived':
        return Response({"error": "Portfolio not found"}, status=status.HTTP_404_NOT_FOUND)

    _track_page_view(request, portfolio)
    serializer = PublicPortfolioSerializer(portfolio, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_portfolio_by_subdomain(request, subdomain):
    """Public portfolio by custom subdomain with status + publish gating."""
    portfolio = get_object_or_404(
        Portfolio.objects.select_related('user').prefetch_related(
            'portfolio_projects__project',
            'portfolio_projects__student_project',
        ),
        custom_subdomain=subdomain,
        is_published=True,
    )

    if portfolio.status == 'archived':
        return Response({"error": "Portfolio not found"}, status=status.HTTP_404_NOT_FOUND)

    _track_page_view(request, portfolio)
    serializer = PublicPortfolioSerializer(portfolio, context={'request': request})
    return Response(serializer.data)
