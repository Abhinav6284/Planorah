from django.urls import path
from . import views

urlpatterns = [
    # Main intelligence endpoint
    path('behavioral/', views.behavioral_intelligence, name='behavioral_intelligence'),

    # Event tracking
    path('events/', views.track_event, name='intelligence_track_event'),

    # Insights
    path('insights/', views.insight_list, name='intelligence_insight_list'),
    path('insights/<uuid:pk>/dismiss/', views.insight_dismiss, name='intelligence_insight_dismiss'),

    # Adaptations
    path('adaptations/', views.adaptation_list, name='intelligence_adaptation_list'),
    path('adaptations/<uuid:pk>/apply/', views.adaptation_apply, name='intelligence_adaptation_apply'),
    path('adaptations/<uuid:pk>/revert/', views.adaptation_revert, name='intelligence_adaptation_revert'),

    # Snapshots & Patterns
    path('snapshots/', views.behavior_snapshots, name='intelligence_snapshots'),
    path('patterns/', views.behavior_patterns, name='intelligence_patterns'),
]
