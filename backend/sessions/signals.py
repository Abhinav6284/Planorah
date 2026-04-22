import logging
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.utils import timezone

logger = logging.getLogger(__name__)


@receiver(pre_save, sender='session_booking.SessionRequest')
def capture_previous_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._prev_status = sender.objects.get(pk=instance.pk).status
        except sender.DoesNotExist:
            instance._prev_status = None
    else:
        instance._prev_status = None


@receiver(post_save, sender='session_booking.SessionRequest')
def on_session_request_saved(sender, instance, created, **kwargs):
    if created:
        return

    prev = getattr(instance, '_prev_status', None)
    if prev == instance.STATUS_CONFIRMED or instance.status != instance.STATUS_CONFIRMED:
        return

    # Stamp confirmed_at if not already set
    if not instance.confirmed_at:
        type(instance).objects.filter(pk=instance.pk).update(confirmed_at=timezone.now())

    from .models import Notification
    from backend.email_service import send_session_confirmation_email

    Notification.objects.create(
        user=instance.user,
        session=instance,
        message=(
            f"Your 1:1 session has been confirmed! "
            f"{'Scheduled for ' + instance.scheduled_at.strftime('%b %d at %I:%M %p') if instance.scheduled_at else 'Details will follow.'}"
        ),
    )

    try:
        send_session_confirmation_email(
            to_email=instance.user.email,
            username=getattr(instance.user, 'username', instance.user.email),
            scheduled_at=instance.scheduled_at,
            meeting_link=instance.meeting_link or '',
        )
    except Exception:
        logger.exception("Failed to send session confirmation email for session %s", instance.pk)
