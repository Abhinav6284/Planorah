# Generated manually for user_lifecycle app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='RealityIntake',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('education_level', models.CharField(choices=[('high_school', 'High School'), ('bachelors', "Bachelor's Degree"), ('masters', "Master's Degree"), ('phd', 'PhD'), ('bootcamp', 'Bootcamp Graduate'), ('self_taught', 'Self-Taught')], max_length=50)),
                ('branch_domain', models.CharField(choices=[('computer_science', 'Computer Science'), ('information_technology', 'Information Technology'), ('software_engineering', 'Software Engineering'), ('data_science', 'Data Science / AI / ML'), ('web_development', 'Web Development'), ('mobile_development', 'Mobile Development'), ('devops', 'DevOps / Cloud'), ('cybersecurity', 'Cybersecurity'), ('game_development', 'Game Development'), ('embedded_systems', 'Embedded Systems'), ('other_engineering', 'Other Engineering'), ('business', 'Business / Management'), ('design', 'Design / UX/UI'), ('marketing', 'Marketing'), ('other', 'Other')], max_length=50)),
                ('current_skills', models.JSONField(default=list, help_text='List of skill identifiers selected by user')),
                ('weekly_hours', models.IntegerField(help_text='Hours per week available for learning')),
                ('target_role', models.CharField(choices=[('software_engineer_intern', 'Software Engineer Intern'), ('software_engineer', 'Software Engineer'), ('frontend_developer', 'Frontend Developer'), ('backend_developer', 'Backend Developer'), ('fullstack_developer', 'Full Stack Developer'), ('data_scientist', 'Data Scientist'), ('ml_engineer', 'Machine Learning Engineer'), ('devops_engineer', 'DevOps Engineer'), ('cloud_engineer', 'Cloud Engineer'), ('mobile_developer', 'Mobile Developer'), ('qa_engineer', 'QA Engineer'), ('security_engineer', 'Security Engineer'), ('product_manager', 'Product Manager'), ('ui_ux_designer', 'UI/UX Designer')], max_length=50)),
                ('target_timeline_months', models.IntegerField(choices=[(3, '3 months'), (6, '6 months'), (12, '12 months'), (18, '18 months'), (24, '24 months')])),
                ('reality_gap_score', models.FloatField(default=0.0, help_text='Computed difficulty score based on gap between current and target')),
                ('intake_locked', models.BooleanField(default=False, help_text='True after goal confirmation (point of no return)')),
                ('locked_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='reality_intake', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Reality Intake',
                'verbose_name_plural': 'Reality Intakes',
            },
        ),
        migrations.CreateModel(
            name='LifecycleEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_type', models.CharField(choices=[('ACCOUNT_CREATED', 'Account Created'), ('EMAIL_VERIFIED', 'Email Verified'), ('INTAKE_SUBMITTED', 'Reality Intake Submitted'), ('GOAL_LOCKED', 'Goal Locked'), ('TASK_ATTEMPT', 'Task Attempt Submitted'), ('TASK_VALIDATED', 'Task Validated'), ('WARNING_EVENT', 'Inactivity Warning'), ('EXECUTION_INCOMPLETE', 'Execution Incomplete Event'), ('RESET_SUGGESTED', 'Reset Suggested'), ('OUTPUT_ELIGIBILITY_GRANTED', 'Output Eligibility Granted'), ('RESUME_GENERATED', 'Resume Generated'), ('JOB_APPLIED', 'Job Application Sent'), ('GOAL_RESET', 'Goal Reset')], max_length=50)),
                ('timestamp', models.DateTimeField(db_index=True, default=django.utils.timezone.now)),
                ('data', models.JSONField(default=dict, help_text='Event payload - structure depends on event_type')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='lifecycle_events', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-timestamp'],
            },
        ),
        migrations.AddIndex(
            model_name='lifecycleevent',
            index=models.Index(fields=['user', 'event_type'], name='user_lifecy_user_id_77b9ff_idx'),
        ),
        migrations.AddIndex(
            model_name='lifecycleevent',
            index=models.Index(fields=['user', 'timestamp'], name='user_lifecy_user_id_aa0e90_idx'),
        ),
    ]
