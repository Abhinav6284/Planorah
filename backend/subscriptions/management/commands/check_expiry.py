from django.core.management.base import BaseCommand
from django.utils import timezone
from subscriptions.models import Subscription
from portfolio.models import Portfolio


class Command(BaseCommand):
    help = 'Check subscription expiry and update statuses'

    def handle(self, *args, **options):
        self.stdout.write('Checking subscription expiry...')
        
        # Get all active or grace subscriptions
        subscriptions = Subscription.objects.filter(
            status__in=['active', 'grace']
        )
        
        updated_count = 0
        
        for subscription in subscriptions:
            old_status = subscription.status
            new_status = subscription.check_and_update_status()
            
            if old_status != new_status:
                updated_count += 1
                self.stdout.write(
                    f'  - User {subscription.user.username}: {old_status} -> {new_status}'
                )
                
                # Update portfolio status
                try:
                    portfolio = Portfolio.objects.get(user=subscription.user)
                    portfolio.update_status_from_subscription(subscription)
                    self.stdout.write(
                        f'    Portfolio status updated to: {portfolio.status}'
                    )
                except Portfolio.DoesNotExist:
                    pass
        
        self.stdout.write(
            self.style.SUCCESS(f'Updated {updated_count} subscription(s)')
        )
