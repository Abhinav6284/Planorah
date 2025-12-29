from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, InvoiceViewSet, CouponViewSet

router = DefaultRouter()
router.register('payments', PaymentViewSet, basename='payments')
router.register('invoices', InvoiceViewSet, basename='invoices')
router.register('coupons', CouponViewSet, basename='coupons')

urlpatterns = [
    path('', include(router.urls)),
]
