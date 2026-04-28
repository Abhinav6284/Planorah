"""
Payment gateway webhook verification.
Validates that webhooks come from legitimate payment provider (Razorpay/Stripe).
"""

import hmac
import hashlib
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


class RazorpayWebhookVerifier:
    """Verify Razorpay webhook signatures."""

    @staticmethod
    def verify_signature(payload: str, signature: str) -> bool:
        """
        Verify Razorpay webhook signature.

        Args:
            payload: Raw webhook body (string)
            signature: X-Razorpay-Signature header value

        Returns:
            True if signature is valid, False otherwise
        """
        if not settings.RAZORPAY_WEBHOOK_SECRET:
            logger.error("RAZORPAY_WEBHOOK_SECRET not configured")
            return False

        try:
            # Razorpay signature = HMAC-SHA256(payload, webhook_secret)
            expected_signature = hmac.new(
                settings.RAZORPAY_WEBHOOK_SECRET.encode(),
                payload.encode(),
                hashlib.sha256
            ).hexdigest()

            # Constant-time comparison to prevent timing attacks
            return hmac.compare_digest(signature, expected_signature)
        except Exception as e:
            logger.error(f"Webhook signature verification error: {e}")
            return False


class StripeWebhookVerifier:
    """Verify Stripe webhook signatures."""

    @staticmethod
    def verify_signature(payload: str, signature: str) -> bool:
        """
        Verify Stripe webhook signature.

        Args:
            payload: Raw webhook body (string)
            signature: Stripe-Signature header value

        Returns:
            True if signature is valid, False otherwise
        """
        if not settings.STRIPE_WEBHOOK_SECRET:
            logger.error("STRIPE_WEBHOOK_SECRET not configured")
            return False

        try:
            # Stripe signature format: t=timestamp,v1=signature
            import stripe
            stripe.Webhook.construct_event(
                payload,
                signature,
                settings.STRIPE_WEBHOOK_SECRET
            )
            return True
        except stripe.error.SignatureVerificationError as e:
            logger.warning(f"Stripe signature verification failed: {e}")
            return False
        except Exception as e:
            logger.error(f"Stripe webhook verification error: {e}")
            return False


def verify_webhook_signature(gateway: str, payload: str, signature: str) -> bool:
    """
    Verify webhook signature from payment gateway.

    Args:
        gateway: 'razorpay' or 'stripe'
        payload: Raw webhook body
        signature: Signature header value

    Returns:
        True if signature is valid
    """
    if gateway.lower() == 'razorpay':
        return RazorpayWebhookVerifier.verify_signature(payload, signature)
    elif gateway.lower() == 'stripe':
        return StripeWebhookVerifier.verify_signature(payload, signature)
    else:
        logger.error(f"Unknown payment gateway: {gateway}")
        return False
