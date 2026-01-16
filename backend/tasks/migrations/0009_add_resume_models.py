# Generated migration for Resume models

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0008_add_remediation_models'),
        ('roadmap_ai', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ResumeSectionTemplate',
            fields=[
                ('template_id', models.UUIDField(default=uuid.uuid4,
                 editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('sections', models.JSONField(
                    default=list, help_text='\n        [\n            {\n                "name": "Technical Skills",\n                "entry_type": "skill",\n                "max_entries": 10,\n                "sort_by": "score"\n            }\n        ]\n        ')),
                ('is_default', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='ResumeVersion',
            fields=[
                ('version_id', models.UUIDField(default=uuid.uuid4,
                 editable=False, primary_key=True, serialize=False)),
                ('version_number', models.IntegerField(
                    help_text='Incrementing version number')),
                ('generated_at', models.DateTimeField(auto_now_add=True)),
                ('was_eligible', models.BooleanField(
                    help_text='Was user eligible when this was generated')),
                ('eligibility_snapshot', models.JSONField(
                    default=dict, help_text='Core/support status at generation')),
                ('compiled_content', models.JSONField(default=dict,
                 help_text='Full resume content with traceability')),
                ('total_tasks_completed', models.IntegerField(default=0)),
                ('core_tasks_completed', models.IntegerField(default=0)),
                ('average_score', models.FloatField(null=True)),
                ('is_latest', models.BooleanField(db_index=True, default=True,
                 help_text='Current version for this user/roadmap')),
                ('roadmap', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                 related_name='resume_versions', to='roadmap_ai.roadmap')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                 related_name='resume_versions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-generated_at'],
            },
        ),
        migrations.CreateModel(
            name='ResumeEntry',
            fields=[
                ('entry_id', models.UUIDField(default=uuid.uuid4,
                 editable=False, primary_key=True, serialize=False)),
                ('entry_type', models.CharField(choices=[('skill', 'Technical Skill'), ('project', 'Project'), (
                    'achievement', 'Achievement'), ('certification', 'Certification')], max_length=30)),
                ('title', models.CharField(max_length=500)),
                ('description', models.TextField()),
                ('proof_url', models.URLField(
                    blank=True, help_text='Direct link to proof')),
                ('weight', models.IntegerField(
                    help_text='From source task weight (1-5)')),
                ('score', models.FloatField(
                    help_text='Validation score from source attempt')),
                ('order', models.IntegerField(default=0)),
                ('tags', models.JSONField(default=list)),
                ('resume_version', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                 related_name='entries', to='tasks.resumeversion')),
                ('source_attempt', models.ForeignKey(help_text='The PASS attempt this entry is derived from',
                 on_delete=django.db.models.deletion.CASCADE, related_name='resume_entries', to='tasks.taskattempt')),
                ('source_task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                 related_name='resume_entries', to='tasks.task')),
            ],
            options={
                'ordering': ['resume_version', 'order'],
            },
        ),
        migrations.AddIndex(
            model_name='resumeversion',
            index=models.Index(
                fields=['user', 'is_latest'], name='tasks_resum_user_id_0a1b2c_idx'),
        ),
        migrations.AddIndex(
            model_name='resumeversion',
            index=models.Index(
                fields=['roadmap', 'generated_at'], name='tasks_resum_roadmap_3d4e5f_idx'),
        ),
        migrations.AddConstraint(
            model_name='resumeversion',
            constraint=models.UniqueConstraint(
                fields=('user', 'roadmap', 'version_number'), name='unique_resume_version'),
        ),
        migrations.AddIndex(
            model_name='resumeentry',
            index=models.Index(
                fields=['resume_version', 'order'], name='tasks_resum_resume__6g7h8i_idx'),
        ),
        migrations.AddIndex(
            model_name='resumeentry',
            index=models.Index(fields=['source_task'],
                               name='tasks_resum_source__9j0k1l_idx'),
        ),
    ]
