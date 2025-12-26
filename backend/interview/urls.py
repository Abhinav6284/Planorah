from django.urls import path
from . import views

urlpatterns = [
    path('start/', views.start_interview, name='start_interview'),
    path('<int:session_id>/message/', views.send_message, name='send_message'),
    path('<int:session_id>/', views.get_session, name='get_session'),
]
