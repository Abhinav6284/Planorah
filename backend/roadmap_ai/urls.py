from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

router = DefaultRouter()
router.register('student-projects', views.StudentProjectViewSet,
                basename='student-project')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_output_eligibility(request):
    """Check if user is eligible for output (resume, portfolio) - DEPRECATED"""
    # This functionality has been moved to tasks app
    return Response({
        'message': 'Use /api/tasks/output-eligibility/ instead',
        'is_eligible': False
    })


urlpatterns = [
    # Generate AI roadmap
    path('generate/', views.generate_roadmap, name='generate_roadmap'),

    # Get all roadmaps for authenticated user
    path('list/', views.get_user_roadmaps, name='get_user_roadmaps'),

    # Get all roadmap projects with progress
    path('projects/', views.get_roadmap_projects, name='get_roadmap_projects'),

    # Get roadmap progress summary
    path('progress/', views.get_roadmap_progress, name='get_roadmap_progress'),

    # Get detailed roadmap by ID
    path('<int:roadmap_id>/', views.get_roadmap_detail, name='get_roadmap_detail'),

    # Delete roadmap by ID
    path('<int:roadmap_id>/delete/', views.delete_roadmap, name='delete_roadmap'),

    # Update milestone completion status
    path('milestone/<int:milestone_id>/progress/',
         views.update_milestone_progress, name='update_milestone_progress'),

    # Schedule roadmap
    path('<int:roadmap_id>/schedule/',
         views.schedule_roadmap, name='schedule_roadmap'),

    # Student projects router
    path('', include(router.urls)),

    # Legacy endpoint - deprecated
    path('check-eligibility/', check_output_eligibility, name='check_eligibility'),
]
