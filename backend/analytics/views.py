from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta

from .models import UserProgress, RoadmapProgress, DailyActivity, UsageLog
from .serializers import (
    UserProgressSerializer,
    RoadmapProgressSerializer,
    DailyActivitySerializer,
    UsageLogSerializer,
    DashboardStatsSerializer,
    ActivityChartSerializer
)
from subscriptions.models import Subscription


class AnalyticsViewSet(viewsets.ViewSet):
    """
    ViewSet for analytics and progress tracking.
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get dashboard statistics."""
        user = request.user
        subscription = Subscription.get_active_subscription(user)
        
        # Get or create user progress
        progress, _ = UserProgress.objects.get_or_create(user=user)
        
        # Get today's activity
        today = timezone.now().date()
        daily_activity, _ = DailyActivity.objects.get_or_create(
            user=user,
            date=today
        )
        
        # Build stats
        stats = {
            'subscription_status': subscription.status if subscription else 'none',
            'plan_name': subscription.plan.display_name if subscription else 'No Plan',
            'days_remaining': subscription.days_remaining if subscription else 0,
            'roadmaps_used': subscription.roadmaps_used if subscription else 0,
            'roadmaps_limit': subscription.plan.roadmap_limit if subscription else 0,
            'projects_used': subscription.projects_used if subscription else 0,
            'projects_limit': subscription.plan.project_limit_max if subscription else 0,
            'resumes_used': subscription.resumes_used if subscription else 0,
            'resumes_limit': subscription.plan.resume_limit if subscription else 0,
            'ats_scans_used': subscription.ats_scans_used if subscription else 0,
            'ats_scans_limit': subscription.plan.ats_scan_limit if subscription else 0,
            'current_streak': progress.current_streak,
            'tasks_completed_today': daily_activity.tasks_completed,
            'overall_completion': 0.0
        }
        
        # Calculate overall completion
        roadmap_progress = RoadmapProgress.objects.filter(user=user)
        if roadmap_progress.exists():
            total_completion = sum(rp.completion_percentage for rp in roadmap_progress)
            stats['overall_completion'] = float(total_completion / roadmap_progress.count())
        
        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def progress(self, request):
        """Get overall user progress."""
        progress, _ = UserProgress.objects.get_or_create(user=request.user)
        serializer = UserProgressSerializer(progress)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def roadmaps(self, request):
        """Get progress for all roadmaps."""
        roadmap_progress = RoadmapProgress.objects.filter(user=request.user)
        serializer = RoadmapProgressSerializer(roadmap_progress, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def activity_chart(self, request):
        """Get activity data for charts."""
        days = int(request.query_params.get('days', 30))
        days = min(days, 90)  # Cap at 90 days
        
        start_date = timezone.now().date() - timedelta(days=days)
        
        activities = DailyActivity.objects.filter(
            user=request.user,
            date__gte=start_date
        ).order_by('date')
        
        dates = []
        tasks_completed = []
        minutes_active = []
        
        for activity in activities:
            dates.append(activity.date)
            tasks_completed.append(activity.tasks_completed)
            minutes_active.append(activity.minutes_active)
        
        return Response({
            'dates': dates,
            'tasks_completed': tasks_completed,
            'minutes_active': minutes_active
        })

    @action(detail=False, methods=['get'])
    def usage_logs(self, request):
        """Get recent usage logs."""
        limit = int(request.query_params.get('limit', 50))
        limit = min(limit, 100)
        
        logs = UsageLog.objects.filter(user=request.user)[:limit]
        serializer = UsageLogSerializer(logs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def log_activity(self, request):
        """Log user activity."""
        action_type = request.data.get('action')
        resource_type = request.data.get('resource_type', '')
        resource_id = request.data.get('resource_id')
        
        if not action_type:
            return Response({
                'error': 'Action type required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        subscription = Subscription.get_active_subscription(request.user)
        
        UsageLog.objects.create(
            user=request.user,
            subscription=subscription,
            action=action_type,
            resource_type=resource_type,
            resource_id=resource_id
        )
        
        # Update daily activity
        today = timezone.now().date()
        daily_activity, _ = DailyActivity.objects.get_or_create(
            user=request.user,
            date=today
        )
        
        if action_type == 'task_complete':
            daily_activity.tasks_completed += 1
        elif action_type == 'project_work':
            daily_activity.projects_worked += 1
        elif action_type == 'resume_create':
            daily_activity.resumes_created += 1
        elif action_type == 'ats_scan':
            daily_activity.ats_scans_run += 1
        
        daily_activity.save()
        
        # Update user progress streak
        progress, _ = UserProgress.objects.get_or_create(user=request.user)
        progress.update_streak()
        
        return Response({'message': 'Activity logged'})
