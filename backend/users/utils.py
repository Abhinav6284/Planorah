from datetime import timedelta
import logging
from django.utils import timezone
from .models import UserProfile, StreakLog

logger = logging.getLogger(__name__)

def update_streak(user, activity_type="generic"):
    """
    Updates the user's streak based on activity.
    Should be called whenever a user performs a meaningful action.
    """
    # Use Django's timezone-aware local date to avoid server timezone mismatches.
    today = timezone.localdate()
    
    # Log the activity in StreakLog (idempotent for same day via unique_together if we enforce it, 
    # but since we want to log multiple activities, maybe unique_together on date is too strict for logs? 
    # Actually, for streak calculation, we just need to know IF they did something today.
    # The model definition I just added handles unique_together on user+date which means 1 log per day.
    # Let's catch IntegrityError or check existence.
    
    log_exists = StreakLog.objects.filter(user=user, activity_date=today).exists()
    if not log_exists:
        try:
            StreakLog.objects.create(
                user=user,
                activity_type=activity_type,
                activity_date=today
            )
        except Exception:
            # Race condition or already exists
            logger.exception("Failed to create streak log for user %s", getattr(user, "id", None))
    
    # Update UserProfile streak
    profile, _ = UserProfile.objects.get_or_create(user=user)
    
    if profile.last_study_date == today:
        # Already counted today
        return
    
    if profile.last_study_date == today - timedelta(days=1):
        # Consecutive day
        profile.streak_count += 1
    else:
        # Broken streak (or first day)
        profile.streak_count = 1
        
    profile.last_study_date = today
    
    # Award XP (simplistic version)
    profile.xp_points += 10 
    
    profile.save()

    # Keep analytics UserProgress in sync (derived cache).
    try:
        from analytics.models import UserProgress
        progress, _ = UserProgress.objects.get_or_create(user=user)
        progress.current_streak = profile.streak_count
        progress.longest_streak = max(progress.longest_streak, progress.current_streak)
        progress.last_activity_date = profile.last_study_date
        progress.save(update_fields=['current_streak', 'longest_streak', 'last_activity_date'])
    except Exception:
        logger.exception("Failed to sync UserProgress for user %s", getattr(user, "id", None))
