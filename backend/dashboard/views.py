from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Task, DailySummary
from .serializers import TaskSerializer, DailySummarySerializer
from resume.models import Resume
from ats.models import ATSAnalysis
from users.models import UserProfile



@api_view(['GET'])
@permission_classes([IsAuthenticated])  # ← ADD THIS
def get_tasks(request):
    # Filter tasks by the authenticated user
    tasks = Task.objects.filter(user=request.user)
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])  # ← ADD THIS
def create_task(request):
    serializer = TaskSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)  # ← Save with user
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    """Get summary statistics for the dashboard"""
    try:
        from roadmap_ai.models import Roadmap
        
        user = request.user
        
        # User Profile Data
        try:
            profile = user.profile
            streak = profile.streak_count
            xp = profile.xp_points
            level = profile.experience_level
            role = profile.target_role
        except Exception:
            streak = 0
            xp = 0
            level = "N/A"
            role = "N/A"
        
        # Roadmap counts
        total_roadmaps = Roadmap.objects.filter(user=user).count()
        latest_roadmap = Roadmap.objects.filter(user=user).order_by('-created_at').first()
        
        # Task counts
        total_tasks = Task.objects.filter(user=user).count()
        completed_tasks = Task.objects.filter(user=user, status='completed').count()
        pending_tasks = total_tasks - completed_tasks
        
        # Resume & ATS counts
        resume_count = Resume.objects.filter(user=user).count()
        ats_scans = ATSAnalysis.objects.filter(user=user).count()
        latest_ats = ATSAnalysis.objects.filter(user=user).order_by('-created_at').first()
        ats_score = latest_ats.match_score if latest_ats else 0
        
        return Response({
            "profile": {
                "streak": streak,
                "xp": xp,
                "level": level,
                "role": role,
                "username": user.username,
                "avatar": profile.avatar.url if profile.avatar else None,
                "bio": profile.bio
            },
            "roadmaps": {
                 "total": total_roadmaps,
                 "latest_title": latest_roadmap.title if latest_roadmap else None
            },
            "tasks": {
                "total": total_tasks,
                "completed": completed_tasks,
                "pending": pending_tasks
            },
            "tools": {
                "resumes_created": resume_count,
                "ats_scans": ats_scans,
                "latest_ats_score": ats_score
            }
        })
    except Exception as e:
        return Response({
            "error": "Failed to fetch dashboard stats",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
