from django.core.management.base import BaseCommand
from plans.models import Plan


class Command(BaseCommand):
    help = 'Create default subscription plans'

    def handle(self, *args, **options):
        plans_data = [
            {
                'name': 'free',
                'display_name': 'Free',
                'price': 0,
                'validity_days': 365,
                'roadmap_limit': 1,
                'project_limit_max': 3,
                'ats_scans_per_day': 2,
                'custom_subdomain': False,
                'portfolio_analytics': False,
            },
            {
                'name': 'basic',
                'display_name': 'Basic',
                'price': 9.99,
                'validity_days': 30,
                'roadmap_limit': 5,
                'project_limit_max': 10,
                'ats_scans_per_day': 5,
                'custom_subdomain': False,
                'portfolio_analytics': False,
            },
            {
                'name': 'pro',
                'display_name': 'Pro',
                'price': 29.99,
                'validity_days': 30,
                'roadmap_limit': 20,
                'project_limit_max': 50,
                'ats_scans_per_day': 20,
                'custom_subdomain': True,
                'portfolio_analytics': True,
            },
        ]

        for plan_data in plans_data:
            plan, created = Plan.objects.get_or_create(
                name=plan_data['name'],
                defaults=plan_data
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Created plan: {plan.display_name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'⚠️  Plan already exists: {plan.display_name}')
                )

        self.stdout.write(
            self.style.SUCCESS('\n✅ Default plans setup completed!')
        )
