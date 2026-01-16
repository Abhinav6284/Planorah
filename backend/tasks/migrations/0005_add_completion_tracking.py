# Generated migration for completion tracking fields

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0004_taskvalidator_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='first_passed_at',
            field=models.DateTimeField(
                blank=True, help_text='When user first passed this task - never revoked unless proof invalidated', null=True),
        ),
        migrations.AddField(
            model_name='task',
            name='best_pass_score',
            field=models.FloatField(
                blank=True, help_text='Highest score from PASS attempts - defines completion quality', null=True),
        ),
        migrations.AddField(
            model_name='task',
            name='best_pass_attempt',
            field=models.ForeignKey(blank=True, help_text='Reference to the best PASS attempt', null=True,
                                    on_delete=django.db.models.deletion.SET_NULL, related_name='task_best_pass', to='tasks.taskattempt'),
        ),
    ]
