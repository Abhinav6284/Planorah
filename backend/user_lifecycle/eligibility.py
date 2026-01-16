"""
Eligibility evaluation logic for OUTPUT_ELIGIBLE gate.
"""

from django.utils import timezone
from tasks.models import Task, TaskAttempt


def evaluate_eligibility(user):
    """
    Evaluate whether user is eligible for OUTPUT_ELIGIBLE state.
    
    Checks:
    - Core tasks completed
    - Required score met
    - No pending validations
    - Consistency above threshold
    
    Returns:
        dict: {
            'eligible': bool,
            'score': float,
            'details': dict
        }
    """
    # Get user's tasks
    tasks = Task.objects.filter(user=user, roadmap__isnull=False)
    total_tasks = tasks.count()
    
    if total_tasks == 0:
        return {
            'eligible': False,
            'score': 0,
            'details': {
                'reason': 'No tasks found',
                'completed_tasks': 0,
                'total_tasks': 0
            }
        }
    
    # Check completed tasks
    completed_tasks = tasks.filter(status='completed').count()
    completion_rate = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
    
    # Check pending validations
    pending_attempts = TaskAttempt.objects.filter(
        user=user,
        validation_status='pending'
    ).count()
    
    # Get consistency score from profile
    consistency_score = 0.0
    if hasattr(user, 'profile'):
        consistency_score = user.profile.consistency_score
    
    # Eligibility criteria
    MIN_COMPLETION_RATE = 80  # Must complete 80% of tasks
    MIN_CONSISTENCY_SCORE = 60  # Consistency score must be >= 60
    
    # Evaluate
    eligible = (
        completion_rate >= MIN_COMPLETION_RATE and
        pending_attempts == 0 and
        consistency_score >= MIN_CONSISTENCY_SCORE
    )
    
    details = {
        'completion_rate': round(completion_rate, 2),
        'completed_tasks': completed_tasks,
        'total_tasks': total_tasks,
        'pending_validations': pending_attempts,
        'consistency_score': consistency_score,
        'min_completion_required': MIN_COMPLETION_RATE,
        'min_consistency_required': MIN_CONSISTENCY_SCORE,
    }
    
    if not eligible:
        reasons = []
        if completion_rate < MIN_COMPLETION_RATE:
            reasons.append(f'Completion rate {completion_rate:.0f}% < {MIN_COMPLETION_RATE}%')
        if pending_attempts > 0:
            reasons.append(f'{pending_attempts} pending validations')
        if consistency_score < MIN_CONSISTENCY_SCORE:
            reasons.append(f'Consistency score {consistency_score:.0f} < {MIN_CONSISTENCY_SCORE}')
        
        details['reasons'] = reasons
    
    return {
        'eligible': eligible,
        'score': completion_rate,
        'details': details
    }


def grant_output_eligibility(user):
    """
    Grant OUTPUT_ELIGIBLE status to user.
    Should only be called after evaluate_eligibility returns True.
    """
    from user_lifecycle.models import LifecycleEvent, EventType
    
    if not hasattr(user, 'profile'):
        return False
    
    profile = user.profile
    
    # Update state
    profile.lifecycle_state = 'OUTPUT_ELIGIBLE'
    profile.save()
    
    # Create event
    eligibility_result = evaluate_eligibility(user)
    LifecycleEvent.objects.create(
        user=user,
        event_type=EventType.OUTPUT_ELIGIBILITY_GRANTED,
        data={
            'completion_rate': eligibility_result['details']['completion_rate'],
            'completed_tasks': eligibility_result['details']['completed_tasks'],
            'total_tasks': eligibility_result['details']['total_tasks'],
            'consistency_score': eligibility_result['details']['consistency_score'],
        }
    )
    
    return True
