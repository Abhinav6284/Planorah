from django.urls import path
from . import views

urlpatterns = [
    path('intake/', views.reality_intake_view, name='reality-intake'),
    path('lock-goal/', views.lock_goal_view, name='lock-goal'),
    path('eligibility/', views.eligibility_status_view, name='eligibility-status'),
    path('grant-eligibility/', views.grant_eligibility_view, name='grant-eligibility'),
    path('events/', views.lifecycle_events_view, name='lifecycle-events'),
    path('reset/', views.reset_goal_view, name='reset-goal'),
]
