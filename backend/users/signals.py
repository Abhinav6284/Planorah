from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import CustomUser, DeletedUser


@receiver(post_delete, sender=CustomUser)
def track_deleted_user(sender, instance, **kwargs):
    """
    When a user is deleted, add their email to DeletedUser table
    to prevent re-registration via OAuth.
    """
    DeletedUser.objects.get_or_create(
        email=instance.email,
        defaults={'deletion_reason': 'User account deleted'}
    )
