# Migration for plagiarism detection and SLA fields

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0006_add_task_weight'),
    ]

    operations = [
        # Add plagiarism detection fields to TaskAttempt
        migrations.AddField(
            model_name='taskattempt',
            name='code_similarity_hash',
            field=models.CharField(
                blank=True, db_index=True, help_text='Code similarity hash for plagiarism detection (future)', max_length=64, null=True),
        ),
        migrations.AddField(
            model_name='taskattempt',
            name='flagged_for_similarity',
            field=models.BooleanField(
                db_index=True, default=False, help_text='True if flagged for potential plagiarism (future)'),
        ),
        migrations.AddField(
            model_name='taskattempt',
            name='similarity_confidence',
            field=models.FloatField(
                blank=True, help_text='Similarity confidence score 0-1 (future)', null=True),
        ),

        # Add SLA fields to TaskValidator
        migrations.AddField(
            model_name='taskvalidator',
            name='sla_hours',
            field=models.IntegerField(
                default=48, help_text='SLA for review completion (hours)'),
        ),
        migrations.AddField(
            model_name='taskvalidator',
            name='escalated',
            field=models.BooleanField(
                default=False, help_text='True if SLA exceeded and escalated'),
        ),
        migrations.AddField(
            model_name='taskvalidator',
            name='auto_timeout_action',
            field=models.CharField(choices=[('FAIL', 'Auto-fail if timeout'), ('DOWNGRADE', 'Downgrade task difficulty'), (
                'NOTIFY', 'Notify only, keep pending')], default='NOTIFY', help_text='Action to take if SLA exceeded', max_length=20),
        ),
    ]
