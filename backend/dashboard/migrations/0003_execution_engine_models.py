from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0002_task_estimated_pomodoros_task_priority_task_tags'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ExamPlan',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4,
                 editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(default='Exam Plan', max_length=255)),
                ('syllabus_text', models.TextField()),
                ('exam_pattern', models.TextField(blank=True)),
                ('topics', models.JSONField(blank=True, default=list)),
                ('revision_schedule', models.JSONField(blank=True, default=list)),
                ('raw_ai_response', models.JSONField(blank=True, default=dict)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                 related_name='exam_plans', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-updated_at'],
            },
        ),
        migrations.CreateModel(
            name='ExecutionTask',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4,
                 editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=255)),
                ('task_type', models.CharField(choices=[
                 ('learning', 'Learning'), ('exam', 'Exam')], default='learning', max_length=16)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('in_progress', 'In Progress'), (
                    'completed', 'Completed'), ('skipped', 'Skipped')], default='pending', max_length=20)),
                ('priority', models.CharField(choices=[
                 ('low', 'Low'), ('medium', 'Medium'), ('high', 'High')], default='medium', max_length=10)),
                ('difficulty', models.CharField(choices=[
                 ('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')], default='medium', max_length=10)),
                ('estimated_time', models.CharField(
                    default='25 min', max_length=32)),
                ('estimated_minutes', models.PositiveIntegerField(default=25)),
                ('reason', models.TextField(blank=True)),
                ('ai_generated', models.BooleanField(default=False)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('scheduled_for', models.DateField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                 related_name='execution_tasks', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
                'indexes': [models.Index(fields=['user', 'task_type', 'status'], name='dashboard_ex_user_id_cbde44_idx'), models.Index(fields=['user', 'scheduled_for'], name='dashboard_ex_user_id_061fd2_idx')],
            },
        ),
        migrations.CreateModel(
            name='FocusSession',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4,
                 editable=False, primary_key=True, serialize=False)),
                ('planned_minutes', models.PositiveIntegerField(default=25)),
                ('status', models.CharField(choices=[('active', 'Active'), ('completed', 'Completed'), (
                    'cancelled', 'Cancelled')], default='active', max_length=16)),
                ('started_at', models.DateTimeField(auto_now_add=True)),
                ('ended_at', models.DateTimeField(blank=True, null=True)),
                ('actual_minutes', models.PositiveIntegerField(default=0)),
                ('distraction_blocked', models.BooleanField(default=True)),
                ('task', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                 related_name='focus_sessions', to='dashboard.executiontask')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                 related_name='focus_sessions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-started_at'],
            },
        ),
        migrations.CreateModel(
            name='Streak',
            fields=[
                ('id', models.BigAutoField(auto_created=True,
                 primary_key=True, serialize=False, verbose_name='ID')),
                ('day', models.DateField()),
                ('active', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                 related_name='execution_streaks', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-day'],
                'unique_together': {('user', 'day')},
            },
        ),
        migrations.CreateModel(
            name='UserStats',
            fields=[
                ('id', models.BigAutoField(auto_created=True,
                 primary_key=True, serialize=False, verbose_name='ID')),
                ('xp_points', models.PositiveIntegerField(default=0)),
                ('current_streak', models.PositiveIntegerField(default=0)),
                ('longest_streak', models.PositiveIntegerField(default=0)),
                ('tasks_completed', models.PositiveIntegerField(default=0)),
                ('focus_minutes', models.PositiveIntegerField(default=0)),
                ('level', models.CharField(default='Beginner', max_length=32)),
                ('last_completed_date', models.DateField(blank=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE,
                 related_name='execution_stats', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='XPLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True,
                 primary_key=True, serialize=False, verbose_name='ID')),
                ('points', models.IntegerField(default=0)),
                ('reason', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('task', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                 related_name='xp_logs', to='dashboard.executiontask')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                 related_name='execution_xp_logs', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
