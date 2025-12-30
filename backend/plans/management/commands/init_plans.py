from django.core.management.base import BaseCommand
from plans.models import Plan


class Command(BaseCommand):
    help = 'Initialize default subscription plans'

    def handle(self, *args, **options):
        self.stdout.write('Creating default plans...')
        Plan.create_default_plans()
        
        plans = Plan.objects.all()
        for plan in plans:
            self.stdout.write(
                self.style.SUCCESS(
                    f'  - {plan.display_name}: ₹{plan.price_inr} ({plan.validity_days} days)'
                )
            )
        
        self.stdout.write(self.style.SUCCESS('Plans initialized successfully!'))
