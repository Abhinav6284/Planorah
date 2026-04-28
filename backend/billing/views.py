from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
import logging

from .models import Payment, Invoice, Coupon, CouponUsage
from .serializers import (
    PaymentSerializer,
    CreatePaymentSerializer,
    VerifyPaymentSerializer,
    InvoiceSerializer,
    CouponSerializer,
    ApplyCouponSerializer
)
from .webhook_verification import verify_webhook_signature
from .webhook_handler import WebhookHandler
from plans.models import Plan

logger = logging.getLogger(__name__)


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Payment model.
    """
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def create_order(self, request):
        """Create a payment order."""
        serializer = CreatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        plan = Plan.objects.get(id=serializer.validated_data['plan_id'])
        coupon_code = serializer.validated_data.get('coupon_code')
        
        amount = float(plan.price_inr)
        
        # Apply coupon if provided
        coupon = None
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)
                if coupon.is_valid:
                    # Check user usage limit
                    user_usage = CouponUsage.objects.filter(
                        coupon=coupon,
                        user=request.user
                    ).count()
                    if user_usage < coupon.max_uses_per_user:
                        amount = coupon.apply_discount(amount)
            except Coupon.DoesNotExist:
                pass
        
        # Create payment record
        payment = Payment.objects.create(
            user=request.user,
            plan=plan,
            amount=amount,
            currency='INR',
            status='pending'
        )
        
        # In production, integrate with Razorpay/Stripe here
        # For now, return order details
        
        return Response({
            'order_id': payment.receipt_number,
            'amount': amount,
            'currency': 'INR',
            'plan_name': plan.display_name,
            'payment_id': payment.id
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def verify(self, request):
        """
        CHECK PAYMENT STATUS (READ-ONLY).

        IMPORTANT: This endpoint NO LONGER creates subscriptions.
        Subscriptions are ONLY created via webhook from payment gateway.

        This endpoint checks if a payment has been processed by the gateway,
        but does NOT grant any access.
        """
        serializer = VerifyPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order_id = serializer.validated_data['order_id']
        payment_id = serializer.validated_data.get('payment_id')

        # Find payment
        try:
            payment = Payment.objects.get(
                receipt_number=order_id,
                user=request.user
            )
        except Payment.DoesNotExist:
            return Response({
                'error': 'Payment order not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Return payment status only (no activation)
        return Response({
            'order_id': payment.receipt_number,
            'status': payment.status,
            'message': (
                'Payment activation happens automatically via secure webhook. '
                'Check your subscription status in /subscriptions/current/'
            )
        })

    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get payment history."""
        payments = self.get_queryset().order_by('-created_at')
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)


class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Invoice model.
    """
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Invoice.objects.filter(payment__user=self.request.user)


class CouponViewSet(viewsets.ViewSet):
    """
    ViewSet for Coupon operations.
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def validate(self, request):
        """Validate and apply a coupon code."""
        serializer = ApplyCouponSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        coupon = serializer.validated_data['coupon']
        plan = serializer.validated_data['plan']
        
        # Check user's usage of this coupon
        user_usage = CouponUsage.objects.filter(
            coupon=coupon,
            user=request.user
        ).count()
        
        if user_usage >= coupon.max_uses_per_user:
            return Response({
                'error': 'You have already used this coupon'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate discount
        original_price = float(plan.price_inr)
        discounted_price = coupon.apply_discount(original_price)
        discount_amount = original_price - discounted_price
        
        return Response({
            'valid': True,
            'coupon_code': coupon.code,
            'discount_type': coupon.discount_type,
            'discount_value': float(coupon.discount_value),
            'original_price': original_price,
            'discounted_price': discounted_price,
            'discount_amount': discount_amount
        })


# ============================================================================
# WEBHOOK ENDPOINTS - Only authorized place where subscriptions are activated
# ============================================================================

@csrf_exempt  # Webhooks don't have CSRF tokens
@api_view(['POST'])
@permission_classes([AllowAny])
def razorpay_webhook(request):
    """
    Razorpay webhook endpoint for payment notifications.

    SECURITY CRITICAL:
    - Verifies webhook signature using RAZORPAY_WEBHOOK_SECRET
    - Only processes events with valid signatures
    - Only creates subscriptions via this webhook, never via client requests
    - Implements idempotency to prevent duplicate processing
    """
    try:
        # Get raw request body for signature verification
        raw_body = request.body.decode('utf-8')
        signature = request.headers.get('X-Razorpay-Signature', '')

        if not signature:
            logger.warning("Razorpay webhook missing signature")
            return JsonResponse({
                'error': 'Missing signature'
            }, status=400)

        # Verify signature
        if not verify_webhook_signature('razorpay', raw_body, signature):
            logger.error("Razorpay webhook signature verification failed")
            return JsonResponse({
                'error': 'Invalid signature'
            }, status=401)

        # Parse payload
        payload = json.loads(raw_body)
        event_id = payload.get('id')

        if not event_id:
            logger.warning("Razorpay webhook missing event ID")
            return JsonResponse({
                'error': 'Missing event ID'
            }, status=400)

        # Handle webhook event
        success = WebhookHandler.handle_razorpay_webhook(event_id, payload)

        if success:
            return JsonResponse({
                'status': 'ok'
            }, status=200)
        else:
            return JsonResponse({
                'error': 'Failed to process webhook'
            }, status=500)

    except json.JSONDecodeError:
        logger.error("Razorpay webhook invalid JSON")
        return JsonResponse({
            'error': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        logger.exception(f"Razorpay webhook error: {e}")
        return JsonResponse({
            'error': 'Server error'
        }, status=500)
