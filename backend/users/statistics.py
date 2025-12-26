from django.db.models import Count, Q, Avg, Sum
from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import CustomUser
from tasks.models import Task
from roadmap_ai.models import Roadmap, Milestone


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_statistics(request):
    """
    Get comprehensive user statistics for profile dashboard.
    Returns task completion metrics, roadmap progress, streaks, skills, and activity data.
    """
    user = request.user
    
    # Task Statistics
    total_tasks = Task.objects.filter(user=user).count()
    completed_tasks = Task.objects.filter(user=user, status='completed').count()
    in_progress_tasks = Task.objects.filter(user=user, status='in_progress').count()
    pending_tasks = Task.objects.filter(user=user, status='not_started').count()
    
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    # Roadmap Statistics
    roadmaps = Roadmap.objects.filter(user=user)
    total_roadmaps = roadmaps.count()
    
    roadmap_stats = []
    for roadmap in roadmaps:
        roadmap_tasks = Task.objects.filter(user=user, roadmap=roadmap)
        total = roadmap_tasks.count()
        completed = roadmap_tasks.filter(status='completed').count()
        progress = (completed / total * 100) if total > 0 else 0
        
        roadmap_stats.append({
            'id': roadmap.id,
            'title': roadmap.title,
            'category': roadmap.category,
            'difficulty': roadmap.difficulty_level,
            'progress': round(progress, 1),
            'total_tasks': total,
            'completed_tasks': completed,
            'created_at': roadmap.created_at.isoformat()
        })
    
    # Milestone Statistics
    total_milestones = Milestone.objects.filter(roadmap__user=user).count()
    completed_milestones = Milestone.objects.filter(roadmap__user=user, is_completed=True).count()
    
    # Streak Data
    profile = getattr(user, 'profile', None)
    current_streak = profile.streak_count if profile else 0
    longest_streak = 0 # specific field for longest streak not in model yet
    last_activity = profile.last_study_date if profile else None
    
    # Time Statistics
    total_minutes = Task.objects.filter(user=user, status='completed').aggregate(
        total=Sum('actual_minutes')
    )['total'] or 0
    
    avg_task_time = Task.objects.filter(user=user, status='completed').aggregate(
        avg=Avg('actual_minutes')
    )['avg'] or 0
    
    # Skills from Roadmaps
    skills = set()
    for roadmap in roadmaps:
        if roadmap.tech_stack:
            skills.update([s.strip() for s in roadmap.tech_stack.split(',')])
    
    # Recent Activity (last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_tasks = Task.objects.filter(
        user=user, 
        updated_at__gte=thirty_days_ago
    ).order_by('-updated_at')[:10]
    
    recent_activity = []
    for task in recent_tasks:
        recent_activity.append({
            'id': task.id,
            'title': task.title,
            'status': task.status,
            'roadmap': task.roadmap.title if task.roadmap else None,
            'updated_at': task.updated_at.isoformat(),
            'completed_at': task.completed_at.isoformat() if task.completed_at else None
        })
    
    # Activity Heatmap Data (last 365 days)
    one_year_ago = timezone.now() - timedelta(days=365)
    try:
        from django.db.models.functions import TruncDate
        daily_activity = Task.objects.filter(
            user=user,
            completed_at__gte=one_year_ago,
            status='completed'
        ).annotate(date=TruncDate('completed_at')).values('date').annotate(
            count=Count('id')
        )
        activity_heatmap = {item['date'].isoformat(): item['count'] for item in daily_activity if item['date']}
    except Exception as e:
        pass # Error logging removed
        # print(f"Error generating activity heatmap: {e}")
        activity_heatmap = {}
    
    # Weekly Stats (last 7 days)
    seven_days_ago = timezone.now() - timedelta(days=7)
    weekly_completed = Task.objects.filter(
        user=user,
        status='completed',
        completed_at__gte=seven_days_ago
    ).count()
    
    # Category Distribution
    category_distribution = {}
    for roadmap in roadmaps:
        cat = roadmap.category
        if cat not in category_distribution:
            category_distribution[cat] = 0
        category_distribution[cat] += 1
    
    return Response({
        'overview': {
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'in_progress_tasks': in_progress_tasks,
            'pending_tasks': pending_tasks,
            'completion_rate': round(completion_rate, 1),
            'total_roadmaps': total_roadmaps,
            'total_milestones': total_milestones,
            'completed_milestones': completed_milestones,
        },
        'streak': {
            'current': current_streak,
            'longest': longest_streak,
            'last_activity': last_activity.isoformat() if last_activity else None,
        },
        'time_stats': {
            'total_minutes': int(total_minutes),
            'total_hours': round(total_minutes / 60, 1),
            'avg_task_minutes': round(avg_task_time, 1),
            'weekly_completed': weekly_completed,
        },
        'roadmaps': roadmap_stats,
        'skills': list(skills)[:20],  # Limit to top 20 skills
        'recent_activity': recent_activity,
        'activity_heatmap': activity_heatmap,
        'category_distribution': category_distribution,
    }, status=status.HTTP_200_OK)
