from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, InvoiceViewSet, CouponViewSet, razorpay_webhook

router = DefaultRouter()
router.register('payments', PaymentViewSet, basename='payments')
router.register('invoices', InvoiceViewSet, basename='invoices')
router.register('coupons', CouponViewSet, basename='coupons')

urlpatterns = [
    path('', include(router.urls)),
    # Webhook endpoints - NO authentication required (verified via signature instead)
    path('webhooks/razorpay/', razorpay_webhook, name='razorpay_webhook'),
]
