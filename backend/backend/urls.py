"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from dashboard import views as dashboard_views
from rest_framework_simplejwt.views import TokenObtainPairView as DefaultTokenObtainPairView
from users.serializers import CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(DefaultTokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

urlpatterns = [
    path('admin/', admin.site.urls),
    path('saas-admin/', include('saas_admin.urls')),
    path('api/admin/', include('saas_admin.api_urls')),
    path('api/', include('api.urls')),
    path('api/users/', include('users.urls')),
    path('api/resume/', include('resume.urls')),
    path('api/ats/', include('ats.urls')),
    path('api/interview/', include('interview.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/today-task/', dashboard_views.get_today_task,
         name='api_today_task_alias'),
    path('api/ai/coach/', dashboard_views.ai_coach, name='api_ai_coach_alias'),
    path('api/rewards/apply/', dashboard_views.rewards_apply,
         name='api_rewards_apply_alias'),
    path('api/roadmap/', include('roadmap_ai.urls')),
    path('api/scheduler/', include('scheduler.urls')),
    path('api/', include('tasks.urls')),  # Tasks and Notes API
    path('api/assistant/', include('assistant.urls')),  # AI Assistant Chat
    # Music Integration (Spotify/YouTube)
    path('api/music/', include('music.urls')),
    # Phase-gating and Lifecycle
    path('api/lifecycle/', include('user_lifecycle.urls')),
    # Career execution platform modules
    path('api/plans/', include('plans.urls')),
    path('api/subscriptions/', include('subscriptions.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/portfolio/', include('portfolio.urls')),
    path('api/github/', include('github_integration.urls')),
    path('api/billing/', include('billing.urls')),
    path('api/analytics/', include('analytics.urls')),
    # AI outbound calls (onboarding guide + call logs)
    path('api/ai-calls/', include('ai_calls.urls')),
    # Reusable AI Mentoring Engine
    path('api/ai-mentoring/', include('ai_mentoring.urls')),
    # Planora AI-powered study platform
    path('api/planora/', include('planora.urls')),
    # Backward-compatible alias used by current production clients
    path('planora/', include(('planora.urls', 'planora'), namespace='planora_legacy')),
    # JWT token endpoints
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
