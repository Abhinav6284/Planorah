from django.core.management.base import BaseCommand
from plans.models import Plan


class Command(BaseCommand):
    help = 'Create default subscription plans'

    def handle(self, *args, **options):
        plans_data = [
            {
                'name': 'free',
                'display_name': 'Free',
                'price_inr': 0,
                'validity_days': 36500,
                'roadmap_limit': 1,
                'resume_full': False,
                'job_finder_unlimited': False,
                'quicky_ai_daily_limit': 5,
                'has_project_management': False,
                'ats_scan_limit': 0,
                'ats_rate_limit_per_day': 0,
                'has_resources_hub': False,
                'has_portfolio_live': False,
                'portfolio_addon_price_inr': 0,
                'sessions_per_month': 0,
                'session_duration_minutes': 0,
                'has_priority_booking': False,
                'has_async_support': False,
                'has_early_access': False,
            },
            {
                'name': 'starter',
                'display_name': 'Starter',
                'price_inr': 99,
                'validity_days': 30,
                'roadmap_limit': 5,
                'resume_full': True,
                'job_finder_unlimited': True,
                'quicky_ai_daily_limit': -1,
                'has_project_management': True,
                'ats_scan_limit': 0,
                'ats_rate_limit_per_day': 0,
                'has_resources_hub': False,
                'has_portfolio_live': True,
                'portfolio_addon_price_inr': 79,
                'sessions_per_month': 0,
                'session_duration_minutes': 0,
                'has_priority_booking': False,
                'has_async_support': False,
                'has_early_access': False,
            },
            {
                'name': 'pro',
                'display_name': 'Pro',
                'price_inr': 249,
                'validity_days': 30,
                'roadmap_limit': 15,
                'resume_full': True,
                'job_finder_unlimited': True,
                'quicky_ai_daily_limit': -1,
                'has_project_management': True,
                'ats_scan_limit': -1,
                'ats_rate_limit_per_day': 0,
                'has_resources_hub': True,
                'has_portfolio_live': True,
                'portfolio_addon_price_inr': 0,
                'sessions_per_month': 2,
                'session_duration_minutes': 30,
                'has_priority_booking': False,
                'has_async_support': False,
                'has_early_access': False,
            },
            {
                'name': 'elite',
                'display_name': 'Elite',
                'price_inr': 499,
                'validity_days': 30,
                'roadmap_limit': -1,
                'resume_full': True,
                'job_finder_unlimited': True,
                'quicky_ai_daily_limit': -1,
                'has_project_management': True,
                'ats_scan_limit': -1,
                'ats_rate_limit_per_day': 0,
                'has_resources_hub': True,
                'has_portfolio_live': True,
                'portfolio_addon_price_inr': 0,
                'sessions_per_month': 10,
                'session_duration_minutes': 45,
                'has_priority_booking': True,
                'has_async_support': True,
                'has_early_access': True,
            },
        ]

        for plan_data in plans_data:
            plan, created = Plan.objects.update_or_create(
                name=plan_data['name'],
                defaults=plan_data
            )
            status = 'Created' if created else 'Updated'
            self.stdout.write(
                self.style.SUCCESS(f'✅ {status} plan: {plan.display_name} (₹{plan.price_inr})')
            )

        self.stdout.write(
            self.style.SUCCESS('\n✅ Default plans setup completed!')
        )
