from django.db import migrations

YEARLY_PLANS = [
    {
        'name': 'starter_yearly',
        'display_name': 'Starter',
        'price_inr': 1089,
        'validity_days': 365,
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
        'is_active': True,
    },
    {
        'name': 'pro_yearly',
        'display_name': 'Pro',
        'price_inr': 2400,
        'validity_days': 365,
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
        'sessions_per_month': 5,
        'session_duration_minutes': 30,
        'has_priority_booking': False,
        'has_async_support': False,
        'has_early_access': False,
        'is_active': True,
    },
    {
        'name': 'elite_yearly',
        'display_name': 'Elite',
        'price_inr': 5148,
        'validity_days': 365,
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
        'is_active': True,
    },
]


def insert_yearly_plans(apps, schema_editor):
    Plan = apps.get_model('plans', 'Plan')
    for data in YEARLY_PLANS:
        Plan.objects.get_or_create(
            name=data['name'],
            defaults={k: v for k, v in data.items() if k != 'name'},
        )


def remove_yearly_plans(apps, schema_editor):
    Plan = apps.get_model('plans', 'Plan')
    Plan.objects.filter(name__in=[p['name'] for p in YEARLY_PLANS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('plans', '0002_remove_plan_custom_subdomain_and_more'),
    ]

    operations = [
        migrations.RunPython(insert_yearly_plans, remove_yearly_plans),
    ]
