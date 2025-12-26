from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.analyze_resume, name='analyze-resume'),
    path('history/', views.get_ats_history, name='ats-history'),
]
