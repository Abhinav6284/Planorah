from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PortfolioViewSet, public_portfolio, public_portfolio_by_subdomain

router = DefaultRouter()
router.register('', PortfolioViewSet, basename='portfolio')

urlpatterns = [
    path('', include(router.urls)),
    path('public/<slug:slug>/', public_portfolio, name='public_portfolio'),
    path('subdomain/<str:subdomain>/', public_portfolio_by_subdomain, name='public_portfolio_subdomain'),
]
