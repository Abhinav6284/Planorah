from django.core.management.base import BaseCommand
from plans.models import Plan


class Command(BaseCommand):
    help = 'Create default subscription plans'

    def handle(self, *args, **options):
        plans_data = [
            {
                'name': 'explorer',
                'display_name': 'Explorer',
                'price_inr': 49,
                'validity_days': 14,
                'roadmap_limit': 1,
                'is_short_roadmap': True,
                'project_limit_min': 1,
                'project_limit_max': 1,
                'resume_limit': 1,
                'ats_scan_limit': 1,
                'ats_rate_limit_per_day': 0,
                'portfolio_analytics': False,
                'custom_subdomain': False,
            },
            {
                'name': 'starter',
                'display_name': 'Starter Builder',
                'price_inr': 99,
                'validity_days': 30,
                'roadmap_limit': 1,
                'is_short_roadmap': False,
                'project_limit_min': 2,
                'project_limit_max': 3,
                'resume_limit': 2,
                'ats_scan_limit': 3,
                'ats_rate_limit_per_day': 0,
                'portfolio_analytics': False,
                'custom_subdomain': False,
            },
            {
                'name': 'career_ready',
                'display_name': 'Career Ready',
                'price_inr': 199,
                'validity_days': 60,
                'roadmap_limit': 2,
                'is_short_roadmap': False,
                'project_limit_min': 4,
                'project_limit_max': 5,
                'resume_limit': -1,
                'ats_scan_limit': 10,
                'ats_rate_limit_per_day': 0,
                'portfolio_analytics': True,
                'custom_subdomain': False,
            },
            {
                'name': 'placement_pro',
                'display_name': 'Placement Pro',
                'price_inr': 299,
                'validity_days': 90,
                'roadmap_limit': 5,
                'is_short_roadmap': False,
                'project_limit_min': 5,
                'project_limit_max': 10,
                'resume_limit': -1,
                'ats_scan_limit': -1,
                'ats_rate_limit_per_day': 10,
                'portfolio_analytics': True,
                'custom_subdomain': True,
            },
        ]

        for plan_data in plans_data:
            plan, created = Plan.objects.get_or_create(
                name=plan_data['name'],
                defaults=plan_data
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Created plan: {plan.display_name} (₹{plan.price_inr})')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'⚠️  Plan already exists: {plan.display_name}')
                )

        self.stdout.write(
            self.style.SUCCESS('\n✅ Default plans setup completed!')
        )
