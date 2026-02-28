"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/users/', include('users.urls')),
    path('api/resume/', include('resume.urls')),
    path('api/ats/', include('ats.urls')),
    path('api/interview/', include('interview.urls')),
    path('api/dashboard/', include('dashboard.urls')),
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
    path('api/portfolio/', include('portfolio.urls')),
    path('api/github/', include('github_integration.urls')),
    path('api/billing/', include('billing.urls')),
    path('api/analytics/', include('analytics.urls')),
    # AI outbound calls (onboarding guide + call logs)
    path('api/ai-calls/', include('ai_calls.urls')),
    # Reusable AI Mentoring Engine
    path('api/ai-mentoring/', include('ai_mentoring.urls')),
    # JWT token endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
