from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.chat, name='assistant-chat'),
    path('v2/config/', views.assistant_v2_config, name='assistant-v2-config'),
    path('v2/turn/', views.assistant_v2_turn, name='assistant-v2-turn'),
    path('v2/action/confirm/', views.assistant_v2_action_confirm, name='assistant-v2-action-confirm'),
    path('v2/jobs/<uuid:job_id>/', views.assistant_v2_job_status, name='assistant-v2-job-status'),
    path('v2/user-context/', views.assistant_user_context, name='assistant-v2-user-context'),
    path('v2/suggestions/', views.assistant_suggestions, name='assistant-v2-suggestions'),
]
