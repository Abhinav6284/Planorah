from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GitHubIntegrationViewSet

router = DefaultRouter()
router.register('', GitHubIntegrationViewSet, basename='github')

urlpatterns = [
    path('', include(router.urls)),
]
