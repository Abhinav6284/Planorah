from django.urls import path
from . import views

urlpatterns = [
    # Generate AI roadmap
    path('generate/', views.generate_roadmap, name='generate_roadmap'),

    # Get all roadmaps for authenticated user
    path('list/', views.get_user_roadmaps, name='get_user_roadmaps'),

    # Get detailed roadmap by ID
    path('<int:roadmap_id>/', views.get_roadmap_detail, name='get_roadmap_detail'),

    # Delete roadmap by ID
    path('<int:roadmap_id>/delete/', views.delete_roadmap, name='delete_roadmap'),

    # Update milestone completion status
    # Update milestone completion status
    path('milestone/<int:milestone_id>/progress/',
         views.update_milestone_progress, name='update_milestone_progress'),

    # Schedule roadmap
    path('<int:roadmap_id>/schedule/', views.schedule_roadmap, name='schedule_roadmap'),
]
