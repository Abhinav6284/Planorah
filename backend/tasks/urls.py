from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .task_views import TaskViewSet, TaskAttemptViewSet, OutputEligibilityView, StagnationCheckView
from .admin_views import (
    PendingManualValidationsView,
    FlaggedSubmissionsView,
    EligibilityOverrideViewSet,
    RemediationViewSet
)
from .resume_views import ResumeGenerateView, ResumeViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'attempts', TaskAttemptViewSet, basename='attempt')
router.register(r'notes', views.NoteViewSet, basename='note')
router.register(r'remediations', RemediationViewSet, basename='remediation')
router.register(r'admin/eligibility-overrides',
                EligibilityOverrideViewSet, basename='admin-override')
router.register(r'resume', ResumeViewSet, basename='resume')

urlpatterns = [
    path('', include(router.urls)),
    path('tasks/output-eligibility/',
         OutputEligibilityView.as_view(), name='output-eligibility'),
    path('tasks/stagnation-check/',
         StagnationCheckView.as_view(), name='stagnation-check'),
    # Resume generation
    path('resume/generate/',
         ResumeGenerateView.as_view(), name='resume-generate'),
    # Admin panel endpoints
    path('admin/pending-validations/',
         PendingManualValidationsView.as_view(), name='admin-pending-validations'),
    path('admin/flagged-submissions/',
         FlaggedSubmissionsView.as_view(), name='admin-flagged-submissions'),
]
