from django.core.management.base import BaseCommand
from tasks.resume_models import ResumeSectionTemplate


class Command(BaseCommand):
    help = 'Create default resume templates'

    def handle(self, *args, **options):
        templates_data = [
            {
                'name': 'Standard Technical Resume',
                'description': 'Balanced template with skills, projects, and achievements.',
                'is_default': True,
                'sections': [
                    {
                        "name": "Technical Skills",
                        "entry_type": "skill",
                        "max_entries": 12,
                        "sort_by": "weight"
                    },
                    {
                        "name": "Featured Projects",
                        "entry_type": "project",
                        "max_entries": 5,
                        "sort_by": "weight"
                    },
                    {
                        "name": "Key Achievements",
                        "entry_type": "achievement",
                        "max_entries": 8,
                        "sort_by": "score"
                    }
                ]
            },
            {
                'name': 'Project-Focused Portfolio',
                'description': 'Showcase your work with an emphasis on projects and repositories.',
                'is_default': False,
                'sections': [
                    {
                        "name": "Major Projects",
                        "entry_type": "project",
                        "max_entries": 10,
                        "sort_by": "weight"
                    },
                    {
                        "name": "Technical Proficiencies",
                        "entry_type": "skill",
                        "max_entries": 8,
                        "sort_by": "score"
                    },
                    {
                        "name": "Other Contributions",
                        "entry_type": "achievement",
                        "max_entries": 5,
                        "sort_by": "weight"
                    }
                ]
            },
            {
                'name': 'Skill-Heavy Summary',
                'description': 'Focus on technical skills and certifications for quick scanning.',
                'is_default': False,
                'sections': [
                    {
                        "name": "Core Competencies",
                        "entry_type": "skill",
                        "max_entries": 20,
                        "sort_by": "score"
                    },
                    {
                        "name": "Certifications & Validations",
                        "entry_type": "certification",
                        "max_entries": 10,
                        "sort_by": "weight"
                    },
                    {
                        "name": "Supporting Projects",
                        "entry_type": "project",
                        "max_entries": 3,
                        "sort_by": "weight"
                    }
                ]
            },
            {
                'name': 'Executive Overview',
                'description': 'High-level summary of achievements and leadership in technical tasks.',
                'is_default': False,
                'sections': [
                    {
                        "name": "Strategic Achievements",
                        "entry_type": "achievement",
                        "max_entries": 12,
                        "sort_by": "weight"
                    },
                    {
                        "name": "Key Projects",
                        "entry_type": "project",
                        "max_entries": 4,
                        "sort_by": "score"
                    },
                    {
                        "name": "Technical Knowledge",
                        "entry_type": "skill",
                        "max_entries": 6,
                        "sort_by": "weight"
                    }
                ]
            }
        ]

        for template_data in templates_data:
            template, created = ResumeSectionTemplate.objects.update_or_create(
                name=template_data['name'],
                defaults=template_data
            )
            status = 'Created' if created else 'Updated'
            self.stdout.write(
                self.style.SUCCESS(f'✅ {status} resume template: {template.name}')
            )

        self.stdout.write(
            self.style.SUCCESS('\n✅ Resume templates setup completed!')
        )
