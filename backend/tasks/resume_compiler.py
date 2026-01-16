"""
Resume Compilation Engine
Generates resumes ONLY from PASS attempts.
Every line is traceable.
"""
from typing import Dict, Any, List, Optional
from django.utils import timezone
from django.db.models import Avg, Count

from .models import Task, TaskAttempt
from .resume_models import ResumeVersion, ResumeEntry, ResumeSectionTemplate


class ResumeCompiler:
    """
    Compiles resume from validated task completions.
    NOT a resume builder - a resume DERIVER.
    """

    def __init__(self, user, roadmap):
        self.user = user
        self.roadmap = roadmap

    def compile(self, template_id=None) -> ResumeVersion:
        """
        Generate new resume version from current PASS attempts.

        Returns:
            ResumeVersion instance
        """
        # Get eligibility status
        from .task_views import OutputEligibilityView
        eligibility = self._get_eligibility()

        # Get all PASS attempts for this roadmap
        completed_tasks = Task.objects.filter(
            user=self.user,
            roadmap=self.roadmap,
            first_passed_at__isnull=False  # Only tasks with PASS
        ).select_related('best_pass_attempt')

        if not completed_tasks.exists():
            raise ValueError("No completed tasks to generate resume from")

        # Mark previous version as not latest
        ResumeVersion.objects.filter(
            user=self.user,
            roadmap=self.roadmap,
            is_latest=True
        ).update(is_latest=False)

        # Get version number
        latest_version = ResumeVersion.objects.filter(
            user=self.user,
            roadmap=self.roadmap
        ).order_by('-version_number').first()

        version_number = 1 if not latest_version else latest_version.version_number + 1

        # Calculate statistics
        total_completed = completed_tasks.count()
        core_completed = completed_tasks.filter(is_core_task=True).count()
        avg_score = completed_tasks.aggregate(
            avg=Avg('best_pass_score')
        )['avg'] or 0

        # Get template
        template = self._get_template(template_id)

        # Compile content
        compiled_content = self._compile_content(completed_tasks, template)

        # Create resume version
        resume = ResumeVersion.objects.create(
            user=self.user,
            roadmap=self.roadmap,
            version_number=version_number,
            was_eligible=eligibility['is_eligible'],
            eligibility_snapshot=eligibility,
            compiled_content=compiled_content,
            total_tasks_completed=total_completed,
            core_tasks_completed=core_completed,
            average_score=avg_score,
            is_latest=True
        )

        # Create individual entries with traceability
        self._create_entries(resume, completed_tasks, template)

        return resume

    def _get_eligibility(self) -> Dict[str, Any]:
        """Get current eligibility status."""
        from .task_views import OutputEligibilityView
        from rest_framework.request import Request
        from django.http import HttpRequest

        # Create mock request (not ideal but works for internal call)
        view = OutputEligibilityView()
        # Simplified - in real implementation, call eligibility logic directly
        return {
            'is_eligible': True,  # Placeholder
            'core_status': {},
            'support_status': {}
        }

    def _get_template(self, template_id) -> ResumeSectionTemplate:
        """Get resume template."""
        if template_id:
            return ResumeSectionTemplate.objects.get(template_id=template_id)

        # Get default template
        default = ResumeSectionTemplate.objects.filter(is_default=True).first()
        if default:
            return default

        # Create basic default template
        return self._create_default_template()

    def _create_default_template(self) -> ResumeSectionTemplate:
        """Create default resume template."""
        template = ResumeSectionTemplate.objects.create(
            name="Standard Technical Resume",
            description="Default template for technical resumes",
            is_default=True,
            sections=[
                {
                    "name": "Technical Skills",
                    "entry_type": "skill",
                    "max_entries": 12,
                    "sort_by": "weight"
                },
                {
                    "name": "Projects",
                    "entry_type": "project",
                    "max_entries": 5,
                    "sort_by": "weight"
                },
                {
                    "name": "Achievements",
                    "entry_type": "achievement",
                    "max_entries": 8,
                    "sort_by": "score"
                }
            ]
        )
        return template

    def _compile_content(self, completed_tasks, template) -> Dict[str, Any]:
        """
        Compile resume content from tasks.

        Returns structured resume data.
        """
        content = {
            'header': {
                'name': self.user.get_full_name() or self.user.username,
                'roadmap': self.roadmap.title,
                'generated_at': timezone.now().isoformat()
            },
            'sections': []
        }

        # Process each template section
        for section_config in template.sections:
            section_data = self._compile_section(
                completed_tasks,
                section_config
            )
            if section_data['entries']:
                content['sections'].append(section_data)

        return content

    def _compile_section(self, completed_tasks, section_config) -> Dict[str, Any]:
        """Compile one resume section from tasks."""
        entry_type = section_config.get('entry_type')
        max_entries = section_config.get('max_entries', 10)
        sort_by = section_config.get('sort_by', 'weight')

        # Map tasks to resume entries based on task metadata
        entries = []

        for task in completed_tasks:
            # Determine if task should be in this section
            # This mapping would be configured per task
            task_entry_type = self._determine_entry_type(task)

            if task_entry_type == entry_type:
                entry = self._task_to_entry(task)
                entries.append(entry)

        # Sort by specified field
        if sort_by == 'weight':
            entries.sort(key=lambda x: x['weight'], reverse=True)
        elif sort_by == 'score':
            entries.sort(key=lambda x: x['score'], reverse=True)
        elif sort_by == 'date':
            entries.sort(key=lambda x: x['completed_at'], reverse=True)

        # Limit entries
        entries = entries[:max_entries]

        return {
            'name': section_config.get('name'),
            'entries': entries
        }

    def _determine_entry_type(self, task: Task) -> str:
        """
        Determine what type of resume entry this task produces.

        Logic:
        - GitHub repos → projects
        - Quizzes → skills/certifications
        - File uploads → projects/achievements
        """
        if task.proof_type == 'GITHUB_REPO':
            return 'project'
        elif task.proof_type == 'QUIZ':
            return 'skill'
        else:
            # Default to achievement
            return 'achievement'

    def _task_to_entry(self, task: Task) -> Dict[str, Any]:
        """
        Convert task to resume entry data.

        CRITICAL: Every entry traces back to task + attempt.
        """
        attempt = task.best_pass_attempt

        if not attempt:
            raise ValueError(f"Task {task.task_id} has no best_pass_attempt")

        # Extract proof URL
        proof_url = ""
        if task.proof_type == 'GITHUB_REPO':
            proof_url = attempt.proof_payload.get('repo_url', '')
        elif task.proof_type == 'URL':
            proof_url = attempt.proof_payload.get('url', '')

        return {
            'task_id': str(task.task_id),
            'attempt_id': str(attempt.attempt_id),
            'title': task.title,
            'description': task.description,
            'proof_url': proof_url,
            'weight': task.weight,
            'score': task.best_pass_score,
            'is_core': task.is_core_task,
            'completed_at': task.first_passed_at.isoformat() if task.first_passed_at else '',
            'tags': task.tags
        }

    def _create_entries(self, resume: ResumeVersion, completed_tasks, template):
        """
        Create ResumeEntry records with full traceability.
        """
        order = 0

        for section_config in template.sections:
            entry_type = section_config.get('entry_type')

            for task in completed_tasks:
                task_entry_type = self._determine_entry_type(task)

                if task_entry_type == entry_type:
                    # Create traceable entry
                    entry_data = self._task_to_entry(task)

                    ResumeEntry.objects.create(
                        resume_version=resume,
                        source_task=task,
                        source_attempt=task.best_pass_attempt,
                        entry_type=entry_type,
                        title=entry_data['title'],
                        description=entry_data['description'],
                        proof_url=entry_data['proof_url'],
                        weight=entry_data['weight'],
                        score=entry_data['score'],
                        order=order,
                        tags=entry_data['tags']
                    )

                    order += 1


def get_latest_resume(user, roadmap) -> Optional[ResumeVersion]:
    """Get user's latest resume for roadmap."""
    return ResumeVersion.objects.filter(
        user=user,
        roadmap=roadmap,
        is_latest=True
    ).first()


def get_resume_history(user, roadmap):
    """Get all resume versions for user/roadmap."""
    return ResumeVersion.objects.filter(
        user=user,
        roadmap=roadmap
    ).order_by('-version_number')


def verify_resume_entry_proof(entry: ResumeEntry) -> Dict[str, Any]:
    """
    Verify that resume entry's proof is still valid.

    Returns:
        {
            'valid': True/False,
            'task': task_title,
            'attempt': attempt_id,
            'score': score,
            'proof_status': 'active'/'deleted'/'invalid'
        }
    """
    task = entry.source_task
    attempt = entry.source_attempt

    # Check if task still completed
    if not task.first_passed_at:
        return {
            'valid': False,
            'reason': 'Task completion revoked',
            'task': task.title,
            'attempt': str(attempt.attempt_id)
        }

    # Check attempt status
    if attempt.validation_status != 'PASS':
        return {
            'valid': False,
            'reason': 'Attempt no longer PASS',
            'task': task.title,
            'attempt': str(attempt.attempt_id)
        }

    # All checks passed
    return {
        'valid': True,
        'task': task.title,
        'attempt': str(attempt.attempt_id),
        'score': attempt.score,
        'proof_status': 'active'
    }
