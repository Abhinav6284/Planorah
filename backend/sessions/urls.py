from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_sessions, name='session-list'),
    path('request/', views.request_session, name='session-request'),
    path('remaining/', views.remaining_sessions, name='session-remaining'),
    path('notifications/', views.list_notifications, name='session-notifications'),
    path('notifications/<uuid:pk>/read/', views.mark_notification_read, name='session-notification-read'),
]
