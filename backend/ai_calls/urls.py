from django.urls import path
from . import views

urlpatterns = [
    # Manually re-trigger the onboarding call (for testing or missed calls)
    path("trigger/onboarding/", views.retrigger_onboarding_call,
         name="ai_call_trigger_onboarding"),
    # View call history for the logged-in user
    path("logs/", views.call_logs, name="ai_call_logs"),
]
