# Generated manually for users app - add lifecycle fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0009_add_deleted_user_model'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='lifecycle_state',
            field=models.CharField(default='ONBOARDING', help_text='Current phase in the user lifecycle', max_length=50),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='goal_locked_at',
            field=models.DateTimeField(blank=True, help_text='Timestamp when goal was locked (point of no return)', null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='last_activity_date',
            field=models.DateField(blank=True, help_text='Last date user had meaningful activity for consistency tracking', null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='consistency_score',
            field=models.FloatField(default=0.0, help_text="Score tracking user's consistency in executing their roadmap"),
        ),
    ]
