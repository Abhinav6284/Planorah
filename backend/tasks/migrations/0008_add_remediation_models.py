# Migration for RemediationAction and EligibilityOverride models

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('roadmap_ai', '0012_task'),
        ('tasks', '0007_add_plagiarism_and_sla'),
    ]

    operations = [
        migrations.CreateModel(
            name='RemediationAction',
            fields=[
                ('remediation_id', models.UUIDField(default=uuid.uuid4,
                 editable=False, primary_key=True, serialize=False)),
                ('action_type', models.CharField(choices=[('difficulty_downgrade', 'Difficulty Downgrade'), ('scope_reduction', 'Scope Reduction'), (
                    'deadline_extension', 'Deadline Extension'), ('task_removal', 'Task Removal')], max_length=30)),
                ('status', models.CharField(choices=[('SUGGESTED', 'Suggested (awaiting user)'), ('ACCEPTED', 'Accepted by user'), (
                    'REJECTED', 'Rejected by user'), ('AUTO_APPLIED', 'Auto-applied (emergency)')], default='SUGGESTED', max_length=20)),
                ('reason', models.TextField(
                    help_text='Clear explanation of why remediation is needed')),
                ('proposed_changes', models.JSONField(default=dict,
                 help_text='Detailed changes that will be applied')),
                ('applied_changes', models.JSONField(blank=True, default=dict,
                 help_text='Actual changes applied (may differ from proposed)')),
                ('suggested_at', models.DateTimeField(auto_now_add=True)),
                ('responded_at', models.DateTimeField(blank=True, null=True)),
                ('applied_at', models.DateTimeField(blank=True, null=True)),
                ('expires_at', models.DateTimeField(
                    blank=True, help_text='Suggestion expires if not responded to', null=True)),
                ('user_comment', models.TextField(blank=True,
                 help_text="User's comment on accepting/rejecting")),
                ('roadmap', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE,
                 related_name='remediations', to='roadmap_ai.roadmap')),
                ('task', models.ForeignKey(blank=True, null=True,
                 on_delete=django.db.models.deletion.CASCADE, related_name='remediations', to='tasks.task')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                 related_name='remediations', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-suggested_at'],
            },
        ),
        migrations.CreateModel(
            name='EligibilityOverride',
            fields=[
                ('override_id', models.UUIDField(default=uuid.uuid4,
                 editable=False, primary_key=True, serialize=False)),
                ('justification', models.TextField(
                    help_text='Why this override was granted - required for audit trail')),
                ('eligibility_snapshot', models.JSONField(default=dict,
                 help_text='Eligibility status when override was granted')),
                ('is_active', models.BooleanField(
                    default=True, help_text='Override can be revoked')),
                ('expires_at', models.DateTimeField(blank=True,
                 help_text='Optional expiration date', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('revoked_at', models.DateTimeField(blank=True, null=True)),
                ('revocation_reason', models.TextField(blank=True)),
                ('granted_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL,
                 related_name='granted_overrides', to=settings.AUTH_USER_MODEL)),
                ('revoked_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                 related_name='revoked_overrides', to=settings.AUTH_USER_MODEL)),
                ('roadmap', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                 related_name='eligibility_overrides', to='roadmap_ai.roadmap')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                 related_name='eligibility_overrides', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='remediationaction',
            index=models.Index(
                fields=['user', 'status'], name='tasks_remed_user_id_e8f05a_idx'),
        ),
        migrations.AddIndex(
            model_name='remediationaction',
            index=models.Index(
                fields=['status', 'suggested_at'], name='tasks_remed_status_9c9e2a_idx'),
        ),
        migrations.AddIndex(
            model_name='eligibilityoverride',
            index=models.Index(
                fields=['user', 'is_active'], name='tasks_eligi_user_id_8f7e5c_idx'),
        ),
        migrations.AddIndex(
            model_name='eligibilityoverride',
            index=models.Index(
                fields=['roadmap', 'is_active'], name='tasks_eligi_roadmap_7a2d3b_idx'),
        ),
    ]
