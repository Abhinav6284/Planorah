import logging

from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import CustomUser, DeletedUser

logger = logging.getLogger(__name__)


@receiver(post_delete, sender=CustomUser)
def track_deleted_user(sender, instance, **kwargs):
    """
    When a user is deleted, add their email to DeletedUser table
    to prevent re-registration via OAuth.
    """
    email = (getattr(instance, 'email', '') or '').strip().lower()
    if not email:
        return

    try:
        DeletedUser.objects.get_or_create(
            email=email,
            defaults={'deletion_reason': 'User account deleted'}
        )
    except Exception:
        # Deletion should never fail just because audit tracking failed.
        logger.exception("Failed to persist deleted user audit entry for %s", email)
