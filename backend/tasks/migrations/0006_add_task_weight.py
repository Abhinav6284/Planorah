# Generated migration for task criticality fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0005_add_completion_tracking'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='weight',
            field=models.IntegerField(
                default=1, help_text='Task weight (1-5) for scoring. Higher weight = more important for eligibility'),
        ),
        migrations.AlterField(
            model_name='task',
            name='is_core_task',
            field=models.BooleanField(
                default=False, help_text='Core tasks MUST pass for output eligibility (100% required)'),
        ),
    ]
