"""
Consistency enforcement and inactivity tracking.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from users.models import CustomUser
from user_lifecycle.models import LifecycleEvent, EventType


class Command(BaseCommand):
    help = 'Check user inactivity and enforce consistency rules'
    
    def handle(self, *args, **options):
        today = timezone.now().date()
        
        # Find users in EXECUTING state
        executing_users = CustomUser.objects.filter(
            profile__lifecycle_state='EXECUTING'
        ).select_related('profile')
        
        for user in executing_users:
            profile = user.profile
            
            if not profile.last_activity_date:
                # No activity recorded yet, skip
                continue
            
            days_inactive = (today - profile.last_activity_date).days
            
            # 7 days inactive -> Warning
            if days_inactive == 7:
                LifecycleEvent.objects.create(
                    user=user,
                    event_type=EventType.WARNING_EVENT,
                    data={
                        'days_inactive': days_inactive,
                        'message': 'You have been inactive for 7 days'
                    }
                )
                self.stdout.write(
                    self.style.WARNING(f'Warning sent to {user.username} (7 days inactive)')
                )
            
            # 14 days inactive -> EXECUTION_INCOMPLETE
            elif days_inactive >= 14 and profile.lifecycle_state == 'EXECUTING':
                profile.lifecycle_state = 'EXECUTION_INCOMPLETE'
                profile.save()
                
                LifecycleEvent.objects.create(
                    user=user,
                    event_type=EventType.EXECUTION_INCOMPLETE_EVENT,
                    data={
                        'days_inactive': days_inactive,
                        'message': 'Marked as execution incomplete due to inactivity'
                    }
                )
                self.stdout.write(
                    self.style.ERROR(f'Marked {user.username} as EXECUTION_INCOMPLETE (14 days inactive)')
                )
            
            # 21 days inactive -> Reset Suggested
            elif days_inactive >= 21:
                LifecycleEvent.objects.create(
                    user=user,
                    event_type=EventType.RESET_SUGGESTED,
                    data={
                        'days_inactive': days_inactive,
                        'message': 'Goal reset suggested due to extended inactivity'
                    }
                )
                self.stdout.write(
                    self.style.ERROR(f'Reset suggested for {user.username} (21 days inactive)')
                )
        
        self.stdout.write(self.style.SUCCESS('Consistency check complete'))
