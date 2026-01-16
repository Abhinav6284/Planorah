# Generated migration for universal onboarding

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0010_add_lifecycle_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='purpose',
            field=models.CharField(
                max_length=50,
                blank=True,
                null=True,
                choices=[
                    ('skill_learning', 'Skill learning'),
                    ('project_building', 'Project building'),
                    ('research_work', 'Research work'),
                    ('teaching_mentoring', 'Teaching / mentoring others'),
                    ('personal_goal', 'Personal goal tracking'),
                ],
                help_text='What the user is using Planorah for'
            ),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='domain',
            field=models.CharField(
                max_length=50,
                blank=True,
                null=True,
                choices=[
                    ('technology', 'Technology'),
                    ('science_research', 'Science & Research'),
                    ('design_creative', 'Design & Creative'),
                    ('business_management', 'Business & Management'),
                    ('arts_humanities', 'Arts & Humanities'),
                    ('other', 'Other'),
                ],
                help_text='General domain/area of work'
            ),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='validation_mode',
            field=models.CharField(
                max_length=20,
                default='automatic',
                choices=[
                    ('automatic', 'Automatic (quizzes, repos, structured proofs)'),
                    ('manual', 'Manual (mentor / professor / reviewer)'),
                    ('mixed', 'Mixed (recommended)'),
                ],
                help_text='How work should be validated'
            ),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='weekly_hours',
            field=models.IntegerField(
                default=5,
                help_text='Committed hours per week'
            ),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='goal_statement',
            field=models.TextField(
                blank=True,
                null=True,
                help_text='One-line goal description (logged and enforced)'
            ),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='goal_type',
            field=models.CharField(
                max_length=50,
                blank=True,
                null=True,
                choices=[
                    ('learn_skill', 'Learn a skill'),
                    ('build_project', 'Build a project'),
                    ('research_study', 'Complete a research study'),
                    ('prepare_evaluation', 'Prepare for evaluation'),
                    ('track_work', 'Track structured work'),
                ],
                help_text='Type of goal being pursued'
            ),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='readiness_score',
            field=models.IntegerField(
                default=0,
                help_text='Execution readiness score (0-100)'
            ),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='onboarding_accepted_terms',
            field=models.BooleanField(
                default=False,
                help_text='User accepted work validation terms'
            ),
        ),
    ]
