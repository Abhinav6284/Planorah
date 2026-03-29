from django.urls import path
from . import views

urlpatterns = [
    path('tasks/', views.get_tasks, name='get_tasks'),
    path('tasks/create/', views.create_task, name='create_task'),
    path('stats/', views.get_dashboard_stats, name='dashboard_stats'),
    path('onboarding-insights/', views.get_onboarding_insights,
         name='dashboard_onboarding_insights'),
    path('today-task/', views.get_today_task, name='dashboard_today_task'),
    path('ai/coach/', views.ai_coach, name='dashboard_ai_coach'),
    path('focus-session/', views.focus_session, name='dashboard_focus_session'),
    path('exam/plan/', views.exam_plan, name='dashboard_exam_plan'),
    path('rewards/apply/', views.rewards_apply, name='dashboard_rewards_apply'),
    path('execution/tasks/', views.execution_tasks,
         name='dashboard_execution_tasks'),
    path('execution/tasks/<uuid:task_id>/guidance/',
         views.execution_task_guidance,
         name='dashboard_execution_task_guidance'),
    path('execution/progress/', views.execution_progress,
         name='dashboard_execution_progress'),
]
