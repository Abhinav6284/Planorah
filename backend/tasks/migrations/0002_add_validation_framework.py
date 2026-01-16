# Generated manually for tasks app - add validation fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0001_initial'),  # Adjust based on your last migration
    ]

    operations = [
        # Update STATUS_CHOICES
        migrations.AlterField(
            model_name='task',
            name='status',
            field=models.CharField(
                choices=[
                    ('not_started', 'Not Started'),
                    ('in_progress', 'In Progress'),
                    ('pending_validation', 'Pending Validation'),
                    ('completed', 'Completed'),
                    ('needs_revision', 'Needs Revision')
                ],
                default='not_started',
                max_length=20
            ),
        ),
        # Add validation fields
        migrations.AddField(
            model_name='task',
            name='proof_type',
            field=models.CharField(
                choices=[
                    ('github', 'GitHub Repository'),
                    ('quiz', 'Quiz'),
                    ('manual', 'Manual Review'),
                    ('none', 'No Validation Required')
                ],
                default='manual',
                help_text='Type of proof required to validate completion',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='task',
            name='minimum_pass_score',
            field=models.FloatField(
                default=70.0,
                help_text='Minimum score (0-100) required to mark task as complete'
            ),
        ),
        migrations.AddField(
            model_name='task',
            name='validator_data',
            field=models.JSONField(
                default=dict,
                help_text='Configuration for validator (e.g., required files for GitHub)'
            ),
        ),
        migrations.AddField(
            model_name='task',
            name='can_skip',
            field=models.BooleanField(
                default=False,
                help_text='Can user skip this task without completing it'
            ),
        ),
        migrations.AddField(
            model_name='task',
            name='can_edit_by_user',
            field=models.BooleanField(
                default=False,
                help_text='Can user edit task title/description'
            ),
        ),
        # Create TaskAttempt model
        migrations.CreateModel(
            name='TaskAttempt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('attempt_number', models.IntegerField(help_text='Attempt number for this task (1st, 2nd, etc.)')),
                ('proof_data', models.JSONField(help_text='Submitted proof (GitHub URL, quiz answers, description, etc.)')),
                ('validation_status', models.CharField(
                    choices=[('pending', 'Pending Validation'), ('pass', 'Passed'), ('fail', 'Failed')],
                    default='pending',
                    max_length=20
                )),
                ('score', models.FloatField(blank=True, help_text='Score (0-100) if validation complete', null=True)),
                ('validator_feedback', models.TextField(blank=True, help_text='Feedback from validator (auto or manual)')),
                ('submitted_at', models.DateTimeField(auto_now_add=True)),
                ('validated_at', models.DateTimeField(blank=True, null=True)),
                ('task', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='attempts', to='tasks.task')),
                ('user', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='task_attempts', to='users.customuser')),
            ],
            options={
                'ordering': ['-submitted_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='taskattempt',
            constraint=models.UniqueConstraint(fields=['task', 'attempt_number'], name='unique_task_attempt'),
        ),
        migrations.AddIndex(
            model_name='taskattempt',
            index=models.Index(fields=['user', 'validation_status'], name='tasks_taska_user_id_validat_idx'),
        ),
        migrations.AddIndex(
            model_name='taskattempt',
            index=models.Index(fields=['task', 'submitted_at'], name='tasks_taska_task_id_submit_idx'),
        ),
    ]
