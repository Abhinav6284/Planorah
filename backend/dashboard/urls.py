from django.urls import path
from . import views

urlpatterns = [
    path('tasks/', views.get_tasks, name='get_tasks'),
    path('tasks/create/', views.create_task, name='create_task'),
    path('stats/', views.get_dashboard_stats, name='dashboard_stats'),
]
