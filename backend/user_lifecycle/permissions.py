"""
Permission classes for phase-based access control.
"""

from rest_framework.permissions import BasePermission


class RequiresGoalSelected(BasePermission):
    """
    Permission that requires user to be in GOAL_SELECTED state or later.
    Blocks access to roadmap features unless user has locked their goal.
    """
    
    message = "You must complete reality intake and lock your goal before accessing this feature."
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Check if user has profile
        if not hasattr(request.user, 'profile'):
            return False
        
        profile = request.user.profile
        lifecycle_state = profile.lifecycle_state
        
        # Allow if user is in GOAL_SELECTED or any later state
        allowed_states = [
            'GOAL_SELECTED',
            'EXECUTING',
            'EXECUTION_INCOMPLETE',
            'OUTPUT_ELIGIBLE',
            'JOB_READY'
        ]
        
        return lifecycle_state in allowed_states


class RequiresExecuting(BasePermission):
    """
    Permission that requires user to be in EXECUTING state.
    Blocks access to task features unless roadmap is active.
    """
    
    message = "You must have an active roadmap to access tasks."
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if not hasattr(request.user, 'profile'):
            return False
        
        profile = request.user.profile
        lifecycle_state = profile.lifecycle_state
        
        # Allow if executing or later (but not incomplete)
        allowed_states = [
            'EXECUTING',
            'OUTPUT_ELIGIBLE',
            'JOB_READY'
        ]
        
        return lifecycle_state in allowed_states


class RequiresOutputEligible(BasePermission):
    """
    Permission that requires user to be OUTPUT_ELIGIBLE or JOB_READY.
    Blocks access to resume, portfolio, and job features until eligibility is granted.
    """
    
    message = "You must complete your roadmap requirements before accessing career output features."
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if not hasattr(request.user, 'profile'):
            return False
        
        profile = request.user.profile
        lifecycle_state = profile.lifecycle_state
        
        # Only allow OUTPUT_ELIGIBLE or JOB_READY
        allowed_states = ['OUTPUT_ELIGIBLE', 'JOB_READY']
        
        return lifecycle_state in allowed_states


class CanResetGoal(BasePermission):
    """
    Permission that allows goal reset only if user has locked a goal.
    """
    
    message = "No active goal to reset."
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if not hasattr(request.user, 'profile'):
            return False
        
        profile = request.user.profile
        
        # Can reset if goal is locked (not in ONBOARDING)
        return profile.lifecycle_state != 'ONBOARDING'
