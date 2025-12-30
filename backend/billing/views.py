from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import Payment, Invoice, Coupon, CouponUsage
from .serializers import (
    PaymentSerializer,
    CreatePaymentSerializer,
    VerifyPaymentSerializer,
    InvoiceSerializer,
    CouponSerializer,
    ApplyCouponSerializer
)
from plans.models import Plan


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
        """Verify payment completion and activate subscription."""
        serializer = VerifyPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        order_id = serializer.validated_data['order_id']
        payment_id = serializer.validated_data['payment_id']
        signature = serializer.validated_data['signature']
        
        # Find payment by receipt number
        try:
            payment = Payment.objects.get(
                receipt_number=order_id,
                user=request.user,
                status='pending'
            )
        except Payment.DoesNotExist:
            return Response({
                'error': 'Payment order not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # In production, verify signature with payment gateway
        # For now, assume verification passes
        
        # Mark payment as completed
        payment.mark_completed(payment_id, signature)
        
        # Create subscription
        from subscriptions.models import Subscription
        subscription = Subscription.objects.create(
            user=request.user,
            plan=payment.plan,
            start_date=timezone.now(),
            status='active',
            payment_id=payment_id
        )
        
        payment.subscription = subscription
        payment.save()
        
        # Create invoice
        tax_rate = 18.00  # GST in India
        subtotal = float(payment.amount) / 1.18
        tax_amount = float(payment.amount) - subtotal
        
        Invoice.objects.create(
            payment=payment,
            billing_name=request.user.get_full_name() or request.user.username,
            billing_email=request.user.email,
            subtotal=round(subtotal, 2),
            tax_rate=tax_rate,
            tax_amount=round(tax_amount, 2),
            total=float(payment.amount)
        )
        
        # Activate portfolio if exists
        if hasattr(request.user, 'portfolio'):
            request.user.portfolio.transition_to_active()
        
        return Response({
            'message': 'Payment verified and subscription activated',
            'subscription_id': subscription.id
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
