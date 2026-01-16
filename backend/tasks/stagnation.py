"""
Anti-stagnation logic for task management.
Detects user inactivity and provides remediation options.
"""
from django.utils import timezone
from datetime import timedelta
from typing import Dict, Any, List
from .models import Task, TaskAttempt


class StagnationDetector:
    """
    Detects and analyzes task stagnation.
    Provides signals when goals are unrealistic.
    """

    # Thresholds
    INACTIVE_DAYS = 7  # No attempts in 7 days = inactive
    REPEATED_FAILURES = 3  # 3+ FAILs without PASS = struggling
    LOW_SCORE_THRESHOLD = 40  # Average score < 40% = fundamental issues

    def __init__(self, user, roadmap=None):
        self.user = user
        self.roadmap = roadmap
        self.issues = []
        self.recommendations = []

    def analyze(self) -> Dict[str, Any]:
        """
        Analyze user's task progress for stagnation.

        Returns:
            Dict with:
            - is_stagnant: bool
            - issues: list of detected problems
            - recommendations: list of suggested actions
            - severity: 'low', 'medium', 'high'
        """
        # Get user's tasks
        tasks = Task.objects.filter(user=self.user)
        if self.roadmap:
            tasks = tasks.filter(roadmap=self.roadmap)

        # Check various stagnation indicators
        self._check_inactivity(tasks)
        self._check_repeated_failures(tasks)
        self._check_low_scores(tasks)
        self._check_deadline_pressure(tasks)

        # Determine severity
        severity = self._calculate_severity()

        return {
            'is_stagnant': len(self.issues) > 0,
            'issues': self.issues,
            'recommendations': self.recommendations,
            'severity': severity,
            'detected_at': timezone.now().isoformat()
        }

    def _check_inactivity(self, tasks):
        """Check if user has been inactive."""
        cutoff = timezone.now() - timedelta(days=self.INACTIVE_DAYS)

        recent_attempts = TaskAttempt.objects.filter(
            user=self.user,
            task__in=tasks,
            submitted_at__gte=cutoff
        ).count()

        if recent_attempts == 0 and tasks.exists():
            incomplete_count = tasks.exclude(
                first_passed_at__isnull=False).count()

            if incomplete_count > 0:
                self.issues.append({
                    'type': 'inactivity',
                    'message': f'No task attempts in {self.INACTIVE_DAYS} days',
                    'data': {
                        'incomplete_tasks': incomplete_count,
                        'days_inactive': self.INACTIVE_DAYS
                    }
                })

                self.recommendations.append({
                    'action': 'resume_tasks',
                    'message': 'Resume working on incomplete tasks or adjust timeline',
                    'options': ['extend_deadline', 'reduce_scope', 'pause_roadmap']
                })

    def _check_repeated_failures(self, tasks):
        """Check for tasks with repeated failures."""
        struggling_tasks = []

        for task in tasks:
            if task.first_passed_at:
                continue  # Already passed - no issue

            attempts = TaskAttempt.objects.filter(
                user=self.user,
                task=task
            ).order_by('-submitted_at')[:self.REPEATED_FAILURES]

            if len(attempts) >= self.REPEATED_FAILURES:
                all_failed = all(a.validation_status ==
                                 'FAIL' for a in attempts)

                if all_failed:
                    avg_score = sum(
                        a.score for a in attempts if a.score) / len(attempts)
                    struggling_tasks.append({
                        'task_id': str(task.task_id),
                        'title': task.title,
                        'attempts': len(attempts),
                        'avg_score': round(avg_score, 2)
                    })

        if struggling_tasks:
            self.issues.append({
                'type': 'repeated_failures',
                'message': f'{len(struggling_tasks)} task(s) with repeated failures',
                'data': {
                    'struggling_tasks': struggling_tasks
                }
            })

            self.recommendations.append({
                'action': 'difficulty_downgrade',
                'message': 'Consider reducing task difficulty or providing additional resources',
                'options': [
                    'simplify_acceptance_criteria',
                    'provide_examples',
                    'offer_mentorship',
                    'replace_with_easier_task'
                ]
            })

    def _check_low_scores(self, tasks):
        """Check for consistently low validation scores."""
        all_attempts = TaskAttempt.objects.filter(
            user=self.user,
            task__in=tasks,
            score__isnull=False
        ).order_by('-submitted_at')[:10]  # Last 10 attempts

        if len(all_attempts) >= 3:
            scores = [a.score for a in all_attempts if a.score is not None]
            if not scores:
                return
            avg_score = sum(scores) / len(scores)

            if avg_score < self.LOW_SCORE_THRESHOLD:
                self.issues.append({
                    'type': 'low_scores',
                    'message': f'Average score: {avg_score:.1f}% (last {len(all_attempts)} attempts)',
                    'data': {
                        'average_score': round(avg_score, 2),
                        'attempts_analyzed': len(all_attempts),
                        'threshold': self.LOW_SCORE_THRESHOLD
                    }
                })

                self.recommendations.append({
                    'action': 'fundamental_help',
                    'message': 'Scores indicate fundamental gaps - consider foundational review',
                    'options': [
                        'prerequisite_training',
                        'one_on_one_mentorship',
                        'change_learning_path',
                        'extend_timeline'
                    ]
                })

    def _check_deadline_pressure(self, tasks):
        """Check if user is behind on deadlines."""
        overdue_tasks = tasks.filter(
            due_date__lt=timezone.now().date(),
            first_passed_at__isnull=True  # Not completed
        ).count()

        if overdue_tasks > 0:
            self.issues.append({
                'type': 'deadline_pressure',
                'message': f'{overdue_tasks} task(s) overdue',
                'data': {
                    'overdue_count': overdue_tasks
                }
            })

            self.recommendations.append({
                'action': 'timeline_adjustment',
                'message': 'Adjust deadlines or reduce scope to realistic levels',
                'options': [
                    'extend_all_deadlines',
                    'prioritize_core_tasks',
                    'remove_support_tasks',
                    'pause_and_replan'
                ]
            })

    def _calculate_severity(self) -> str:
        """Calculate stagnation severity based on issues."""
        if not self.issues:
            return 'none'

        issue_types = {issue['type'] for issue in self.issues}

        # High severity: multiple issue types
        if len(issue_types) >= 3:
            return 'high'

        # High severity: repeated failures + low scores
        if 'repeated_failures' in issue_types and 'low_scores' in issue_types:
            return 'high'

        # Medium severity: 2 issue types
        if len(issue_types) == 2:
            return 'medium'

        # Low severity: single issue
        return 'low'


def apply_difficulty_downgrade(task: Task, downgrade_level: str = 'moderate') -> Dict[str, Any]:
    """
    Apply difficulty downgrade to a task.

    Args:
        task: Task to downgrade
        downgrade_level: 'minor', 'moderate', or 'major'

    Returns:
        Dict with changes applied
    """
    changes = {}

    if downgrade_level == 'minor':
        # Reduce minimum pass score by 10%
        if task.minimum_pass_score > 50:
            old_score = task.minimum_pass_score
            task.minimum_pass_score = max(50, task.minimum_pass_score - 10)
            changes['minimum_pass_score'] = {
                'old': old_score,
                'new': task.minimum_pass_score
            }

    elif downgrade_level == 'moderate':
        # Reduce requirements + increase attempts
        if task.minimum_pass_score > 50:
            old_score = task.minimum_pass_score
            task.minimum_pass_score = 60
            changes['minimum_pass_score'] = {
                'old': old_score,
                'new': 60
            }

        # Increase max attempts
        if task.max_attempts and task.max_attempts < 10:
            old_attempts = task.max_attempts
            task.max_attempts = min(10, task.max_attempts + 3)
            changes['max_attempts'] = {
                'old': old_attempts,
                'new': task.max_attempts
            }

        # Simplify acceptance rules
        if 'min_commits' in task.acceptance_rules:
            old_commits = task.acceptance_rules['min_commits']
            task.acceptance_rules['min_commits'] = max(1, old_commits - 5)
            changes['acceptance_rules'] = {
                'min_commits': {
                    'old': old_commits,
                    'new': task.acceptance_rules['min_commits']
                }
            }

    elif downgrade_level == 'major':
        # Major simplification
        task.minimum_pass_score = 50
        task.max_attempts = None  # Unlimited

        # Remove optional requirements
        if 'required_files' in task.acceptance_rules:
            old_files = task.acceptance_rules['required_files']
            task.acceptance_rules['required_files'] = []
            changes['required_files'] = {
                'old': old_files,
                'new': []
            }

        if 'required_keywords' in task.acceptance_rules:
            old_keywords = task.acceptance_rules['required_keywords']
            task.acceptance_rules['required_keywords'] = []
            changes['required_keywords'] = {
                'old': old_keywords,
                'new': []
            }

        changes['major_downgrade'] = True

    task.save()

    return {
        'task_id': str(task.task_id),
        'downgrade_level': downgrade_level,
        'changes': changes,
        'message': f'Task difficulty reduced ({downgrade_level} level)'
    }


def suggest_scope_reduction(tasks: List[Task]) -> Dict[str, Any]:
    """
    Suggest which tasks can be removed or made optional.

    Args:
        tasks: List of tasks to analyze

    Returns:
        Dict with suggestions
    """
    suggestions = {
        'removable': [],
        'make_optional': [],
        'keep_required': []
    }

    for task in tasks:
        # Core tasks should generally be kept
        if task.is_core_task:
            suggestions['keep_required'].append({
                'task_id': str(task.task_id),
                'title': task.title,
                'reason': 'Core task - essential for learning objectives'
            })
        # Low-weight support tasks are removable
        elif task.weight <= 2 and not task.first_passed_at:
            suggestions['removable'].append({
                'task_id': str(task.task_id),
                'title': task.title,
                'reason': 'Low weight support task - not critical'
            })
        # Medium-weight tasks can be made optional
        elif task.weight <= 3:
            suggestions['make_optional'].append({
                'task_id': str(task.task_id),
                'title': task.title,
                'reason': 'Medium priority - can be optional or bonus'
            })

    return suggestions
