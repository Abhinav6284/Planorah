from datetime import date, timedelta
from .models import UserProfile, StreakLog

def update_streak(user, activity_type="generic"):
    """
    Updates the user's streak based on activity.
    Should be called whenever a user performs a meaningful action.
    """
    today = date.today()
    
    # Log the activity in StreakLog (idempotent for same day via unique_together if we enforce it, 
    # but since we want to log multiple activities, maybe unique_together on date is too strict for logs? 
    # Actually, for streak calculation, we just need to know IF they did something today.
    # The model definition I just added handles unique_together on user+date which means 1 log per day.
    # Let's catch IntegrityError or check existence.
    
    log_exists = StreakLog.objects.filter(user=user, activity_date=today).exists()
    if not log_exists:
        try:
            StreakLog.objects.create(user=user, activity_type=activity_type)
        except:
            pass # Race condition or already exists
    
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
