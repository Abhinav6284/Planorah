from django.urls import path
from . import views

urlpatterns = [
    path('session/', views.create_session, name='mentoring-create-session'),
    path('sessions/', views.list_sessions, name='mentoring-list-sessions'),
]
