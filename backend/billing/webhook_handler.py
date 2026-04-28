"""
Payment gateway webhook handlers.
ONLY authorized place where subscriptions are activated.
"""

import logging
from decimal import Decimal
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db import transaction

from .models import Payment, PaymentWebhookEvent
from subscriptions.models import Subscription
from plans.models import Plan

logger = logging.getLogger(__name__)
User = get_user_model()


class WebhookHandler:
    """Base webhook handler - validates and processes payment events."""

    @staticmethod
    @transaction.atomic
    def handle_razorpay_webhook(gateway_event_id: str, payload: dict) -> bool:
        """
        Process Razorpay webhook event.

        Security: Only activates subscriptions if:
        1. Event hasn't been processed before (idempotent)
        2. Event is for a known payment order
        3. Payment amount matches plan price
        4. User doesn't already have active subscription
        5. Event signature was verified by caller

        Args:
            gateway_event_id: Razorpay event ID (for idempotency)
            payload: Webhook payload

        Returns:
            True if handled successfully
        """
        # Check for duplicate events (replay protection)
        existing_event = PaymentWebhookEvent.objects.filter(
            gateway='razorpay',
            event_id=gateway_event_id
        ).first()

        if existing_event:
            if existing_event.status == 'processed':
                logger.info(f"Razorpay event already processed: {gateway_event_id}")
                existing_event.status = 'duplicate'
                existing_event.save(update_fields=['status'])
            return True  # Don't reprocess

        # Create webhook event record
        event = PaymentWebhookEvent.objects.create(
            gateway='razorpay',
            event_id=gateway_event_id,
            event_type=payload.get('event', 'unknown'),
            payload=payload,
            status='pending'
        )

        try:
            # Handle payment authorization
            if payload.get('event') == 'payment.authorized':
                return WebhookHandler._handle_payment_authorized_razorpay(event, payload)

            # Handle payment failed
            elif payload.get('event') == 'payment.failed':
                return WebhookHandler._handle_payment_failed_razorpay(event, payload)

            else:
                logger.info(f"Ignoring Razorpay event type: {payload.get('event')}")
                event.status = 'processed'
                event.save(update_fields=['status', 'processed_at'])
                return True

        except Exception as e:
            logger.exception(f"Error handling Razorpay webhook {gateway_event_id}: {e}")
            event.status = 'failed'
            event.error_message = str(e)
            event.save(update_fields=['status', 'error_message'])
            return False

    @staticmethod
    def _handle_payment_authorized_razorpay(event: PaymentWebhookEvent, payload: dict) -> bool:
        """Handle Razorpay payment.authorized event."""
        try:
            # Extract payment details from webhook
            payment_data = payload.get('payload', {}).get('payment', {})
            order_id = payload.get('payload', {}).get('order', {}).get('id')
            payment_id = payment_data.get('id')

            if not payment_id or not order_id:
                raise ValueError("Missing payment_id or order_id in webhook")

            # Find the pending payment
            payment = Payment.objects.get(
                gateway_order_id=order_id,
                status='pending'
            )
            event.payment = payment
            event.save(update_fields=['payment'])

            # Verify amount matches
            webhook_amount = Decimal(str(payment_data.get('amount', 0))) / 100  # Razorpay sends in paise
            if webhook_amount != payment.amount:
                raise ValueError(
                    f"Amount mismatch: webhook={webhook_amount}, payment={payment.amount}"
                )

            # Verify user hasn't already been granted this
            existing_active = Subscription.get_active_subscription(payment.user)
            if existing_active and existing_active.is_active:
                logger.warning(f"User {payment.user.id} already has active subscription")
                event.error_message = "User already has active subscription"
                event.status = 'failed'
                event.save(update_fields=['status', 'error_message'])
                return False

            # Mark payment as completed
            payment.mark_completed(
                gateway_payment_id=payment_id,
                gateway_signature=payload.get('signature', '')
            )

            # CREATE SUBSCRIPTION (only here!)
            subscription = Subscription.objects.create(
                user=payment.user,
                plan=payment.plan,
                start_date=timezone.now(),
                status='active',
                payment_id=payment_id
            )

            logger.info(
                f"Subscription activated via webhook: user={payment.user.id}, "
                f"plan={payment.plan.id}, razorpay_order={order_id}"
            )

            # Activate portfolio if exists
            if hasattr(payment.user, 'portfolio'):
                payment.user.portfolio.transition_to_active()

            # Mark event as processed
            event.status = 'processed'
            event.processed_at = timezone.now()
            event.save(update_fields=['status', 'processed_at'])

            return True

        except Payment.DoesNotExist:
            raise ValueError(f"Payment not found for order {order_id}")

    @staticmethod
    def _handle_payment_failed_razorpay(event: PaymentWebhookEvent, payload: dict) -> bool:
        """Handle Razorpay payment.failed event."""
        try:
            payment_data = payload.get('payload', {}).get('payment', {})
            order_id = payload.get('payload', {}).get('order', {}).get('id')

            # Find payment
            payment = Payment.objects.get(gateway_order_id=order_id)
            event.payment = payment
            event.save(update_fields=['payment'])

            # Mark payment as failed
            error_msg = payment_data.get('error_reason', 'Payment failed')
            payment.mark_failed(error_msg)

            logger.info(f"Payment failed: user={payment.user.id}, order={order_id}, reason={error_msg}")

            # Mark event as processed
            event.status = 'processed'
            event.processed_at = timezone.now()
            event.save(update_fields=['status', 'processed_at'])

            return True

        except Payment.DoesNotExist:
            logger.warning(f"Payment not found for failed event: {order_id}")
            event.status = 'processed'
            event.processed_at = timezone.now()
            event.save(update_fields=['status', 'processed_at'])
            return True


# Similar handler for Stripe would follow the same pattern
# Only activate subscriptions from webhook, never from client requests
