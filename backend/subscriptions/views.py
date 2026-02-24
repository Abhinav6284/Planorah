from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Subscription
from .serializers import (
    SubscriptionSerializer,
    SubscriptionUsageSerializer,
    SubscriptionCreateSerializer
)
from plans.models import Plan


class SubscriptionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Subscription model.
    """
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get the user's current active subscription."""
        try:
            subscription = Subscription.get_active_subscription(request.user)

            if subscription is None:
                return Response(
                    {"message": "No active subscription found", "status": "none"},
                    status=status.HTTP_200_OK
                )

            # Update status based on current date
            subscription.check_and_update_status()

            serializer = SubscriptionSerializer(subscription)
            return Response(serializer.data)
        except Exception as e:
            # Log the error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(
                f"Error fetching current subscription: {str(e)}", exc_info=True)

            # Return a safe default response
            return Response(
                {"message": "No active subscription found", "status": "none"},
                status=status.HTTP_200_OK
            )

    @action(detail=False, methods=['get'])
    def usage(self, request):
        """Get detailed usage information for current subscription."""
        subscription = Subscription.get_active_subscription(request.user)

        if subscription is None:
            return Response(
                {"message": "No active subscription found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = SubscriptionUsageSerializer(subscription)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def activate(self, request):
        """Activate a subscription after payment."""
        serializer = SubscriptionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan = Plan.objects.get(id=serializer.validated_data['plan_id'])
        payment_id = serializer.validated_data.get('payment_id', '')

        # Check for existing active subscription
        existing = Subscription.get_active_subscription(request.user)
        if existing and existing.is_active:
            return Response(
                {"error": "You already have an active subscription"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create new subscription
        subscription = Subscription.objects.create(
            user=request.user,
            plan=plan,
            start_date=timezone.now(),
            status='active',
            payment_id=payment_id
        )

        # Activate portfolio if exists
        if hasattr(request.user, 'portfolio'):
            request.user.portfolio.transition_to_active()

        serializer = SubscriptionSerializer(subscription)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def renew(self, request):
        """Renew an expired subscription."""
        serializer = SubscriptionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan = Plan.objects.get(id=serializer.validated_data['plan_id'])
        payment_id = serializer.validated_data.get('payment_id', '')

        # Get existing subscription to extend or create new
        existing = Subscription.get_active_subscription(request.user)

        if existing and existing.status == 'active':
            # Extend existing subscription
            from datetime import timedelta
            existing.end_date = existing.end_date + \
                timedelta(days=plan.validity_days)
            existing.grace_end_date = existing.end_date + timedelta(days=14)
            existing.save()
            subscription = existing
        else:
            # Create new subscription
            subscription = Subscription.objects.create(
                user=request.user,
                plan=plan,
                start_date=timezone.now(),
                status='active',
                payment_id=payment_id
            )

        # Reactivate portfolio
        if hasattr(request.user, 'portfolio'):
            request.user.portfolio.transition_to_active()

        serializer = SubscriptionSerializer(subscription)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a subscription."""
        subscription = self.get_object()

        if subscription.status == 'cancelled':
            return Response(
                {"error": "Subscription is already cancelled"},
                status=status.HTTP_400_BAD_REQUEST
            )

        subscription.status = 'cancelled'
        subscription.save()

        # Move portfolio to grace period
        if hasattr(request.user, 'portfolio'):
            request.user.portfolio.transition_to_grace()

        return Response({"message": "Subscription cancelled"})

    @action(detail=False, methods=['get'])
    def check_expiry(self, request):
        """Check subscription expiry and update status."""
        subscription = Subscription.get_active_subscription(request.user)

        if subscription is None:
            return Response({
                "status": "no_subscription",
                "message": "No subscription found"
            })

        old_status = subscription.status
        new_status = subscription.check_and_update_status()

        # Update portfolio status if subscription status changed
        if old_status != new_status and hasattr(request.user, 'portfolio'):
            request.user.portfolio.update_status_from_subscription(
                subscription)

        return Response({
            "status": new_status,
            "days_remaining": subscription.days_remaining,
            "end_date": subscription.end_date,
            "grace_end_date": subscription.grace_end_date
        })
