"""
Task validation framework.
Provides auto-validators and validation logic for task attempts.
"""

from django.utils import timezone
from .models import TaskAttempt
from user_lifecycle.models import LifecycleEvent, EventType
import requests


class BaseValidator:
    """Base class for all task validators"""
    
    def validate(self, task_attempt):
        """
        Validate a task attempt and return score + feedback.
        
        Returns:
            dict: {
                'score': float (0-100),
                'feedback': str,
                'status': 'pass' or 'fail'
            }
        """
        raise NotImplementedError("Subclasses must implement validate()")


class GitHubValidator(BaseValidator):
    """
    Validates GitHub repository submissions.
    Checks:
    - Repository exists and is accessible
    - Minimum number of commits
    - Required files present (if specified in validator_data)
    """
    
    def validate(self, task_attempt):
        proof = task_attempt.proof_data
        github_url = proof.get('github_url', '')
        
        if not github_url:
            return {
                'score': 0,
                'feedback': 'No GitHub URL provided',
                'status': 'fail'
            }
        
        # Parse GitHub URL to extract owner/repo
        # Example: https://github.com/username/repo
        try:
            parts = github_url.rstrip('/').split('/')
            if len(parts) < 2:
                return {
                    'score': 0,
                    'feedback': 'Invalid GitHub URL format',
                    'status': 'fail'
                }
            
            repo_name = parts[-1]
            owner = parts[-2]
            
            # Check if repo exists (GitHub API)
            api_url = f"https://api.github.com/repos/{owner}/{repo_name}"
            response = requests.get(api_url, timeout=10)
            
            if response.status_code == 404:
                return {
                    'score': 0,
                    'feedback': 'Repository not found or is private',
                    'status': 'fail'
                }
            
            if response.status_code != 200:
                return {
                    'score': 50,
                    'feedback': f'Unable to verify repository (Status: {response.status_code}). Manual review required.',
                    'status': 'fail'
                }
            
            repo_data = response.json()
            
            # Get validator_data from task
            validator_config = task_attempt.task.validator_data
            min_commits = validator_config.get('min_commits', 1)
            required_files = validator_config.get('required_files', [])
            
            # Check commits
            commits_url = f"https://api.github.com/repos/{owner}/{repo_name}/commits"
            commits_response = requests.get(commits_url, timeout=10)
            
            if commits_response.status_code == 200:
                commits = commits_response.json()
                commit_count = len(commits)
                
                if commit_count < min_commits:
                    return {
                        'score': 40,
                        'feedback': f'Repository has only {commit_count} commits. Minimum required: {min_commits}',
                        'status': 'fail'
                    }
            
            # Check required files
            if required_files:
                missing_files = []
                for file_path in required_files:
                    file_url = f"https://api.github.com/repos/{owner}/{repo_name}/contents/{file_path}"
                    file_response = requests.get(file_url, timeout=10)
                    
                    if file_response.status_code == 404:
                        missing_files.append(file_path)
                
                if missing_files:
                    return {
                        'score': 60,
                        'feedback': f'Missing required files: {", ".join(missing_files)}',
                        'status': 'fail'
                    }
            
            # All checks passed
            return {
                'score': 100,
                'feedback': f'✅ Repository validated successfully. Commits: {commit_count}',
                'status': 'pass'
            }
            
        except Exception as e:
            return {
                'score': 0,
                'feedback': f'Validation error: {str(e)}',
                'status': 'fail'
            }


class QuizValidator(BaseValidator):
    """
    Validates quiz submissions.
    (Placeholder for future implementation)
    """
    
    def validate(self, task_attempt):
        # TODO: Implement quiz validation
        return {
            'score': 0,
            'feedback': 'Quiz validation not yet implemented',
            'status': 'fail'
        }


class ManualValidator(BaseValidator):
    """
    Marks task for manual review by mentor.
    """
    
    def validate(self, task_attempt):
        # Manual validation - just mark as pending
        return {
            'score': None,  # No score yet
            'feedback': '⏳ Waiting for manual review by mentor',
            'status': 'pending'
        }


class NoValidator(BaseValidator):
    """
    For tasks that don't require validation (auto-pass).
    """
    
    def validate(self, task_attempt):
        return {
            'score': 100,
            'feedback': '✅ Task completed (no validation required)',
            'status': 'pass'
        }


def get_validator(proof_type):
    """Factory function to get the appropriate validator"""
    validators = {
        'github': GitHubValidator(),
        'quiz': QuizValidator(),
        'manual': ManualValidator(),
        'none': NoValidator(),
    }
    return validators.get(proof_type, ManualValidator())


def submit_task_attempt(task, user, proof_data):
    """
    Submit a task attempt for validation.
    
    Args:
        task: Task instance
        user: User instance
        proof_data: dict containing proof (GitHub URL, quiz answers, etc.)
    
    Returns:
        TaskAttempt instance
    """
    # Get attempt number
    existing_attempts = TaskAttempt.objects.filter(task=task, user=user).count()
    attempt_number = existing_attempts + 1
    
    # Create attempt
    attempt = TaskAttempt.objects.create(
        task=task,
        user=user,
        attempt_number=attempt_number,
        proof_data=proof_data,
        validation_status='pending'
    )
    
    # Run validator
    validator = get_validator(task.proof_type)
    result = validator.validate(attempt)
    
    # Update attempt with results
    attempt.score = result.get('score')
    attempt.validator_feedback = result.get('feedback', '')
    attempt.validation_status = result.get('status', 'pending')
    attempt.validated_at = timezone.now() if result.get('status') != 'pending' else None
    attempt.save()
    
    # Update task status if passed
    if result.get('status') == 'pass' and attempt.score >= task.minimum_pass_score:
        task.status = 'completed'
        task.completed_at = timezone.now()
        task.save()
        
        # Create event
        LifecycleEvent.objects.create(
            user=user,
            event_type=EventType.TASK_VALIDATED,
            data={
                'task_id': task.id,
                'task_title': task.title,
                'attempt_number': attempt_number,
                'score': attempt.score,
            }
        )
    elif result.get('status') == 'fail':
        task.status = 'needs_revision'
        task.save()
    else:
        task.status = 'pending_validation'
        task.save()
    
    # Create attempt event
    LifecycleEvent.objects.create(
        user=user,
        event_type=EventType.TASK_ATTEMPT,
        data={
            'task_id': task.id,
            'task_title': task.title,
            'attempt_number': attempt_number,
            'proof_type': task.proof_type,
        }
    )
    
    return attempt
