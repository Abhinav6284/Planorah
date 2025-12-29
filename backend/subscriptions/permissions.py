from rest_framework import permissions
from subscriptions.models import Subscription


class HasActiveSubscription(permissions.BasePermission):
    """
    Permission check for active subscription.
    """
    message = "You need an active subscription to access this feature."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        subscription = Subscription.get_active_subscription(request.user)
        return subscription is not None and subscription.is_active


class HasActiveOrGraceSubscription(permissions.BasePermission):
    """
    Permission check for active or grace period subscription.
    """
    message = "Your subscription has expired. Please renew to continue."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        subscription = Subscription.get_active_subscription(request.user)
        return subscription is not None and (subscription.is_active or subscription.is_in_grace)


class CanCreateRoadmap(permissions.BasePermission):
    """
    Permission check for roadmap creation limit.
    """
    message = "You have reached your roadmap limit. Please upgrade your plan."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Only check on create actions
        if view.action not in ['create']:
            return True
        
        subscription = Subscription.get_active_subscription(request.user)
        if subscription is None:
            return False
        
        return subscription.can_create_roadmap()


class CanCreateProject(permissions.BasePermission):
    """
    Permission check for project creation limit.
    """
    message = "You have reached your project limit. Please upgrade your plan."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Only check on create actions
        if view.action not in ['create']:
            return True
        
        subscription = Subscription.get_active_subscription(request.user)
        if subscription is None:
            return False
        
        return subscription.can_create_project()


class CanCreateResume(permissions.BasePermission):
    """
    Permission check for resume creation limit.
    """
    message = "You have reached your resume limit. Please upgrade your plan."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Only check on create actions
        if view.action not in ['create']:
            return True
        
        subscription = Subscription.get_active_subscription(request.user)
        if subscription is None:
            return False
        
        return subscription.can_create_resume()


class CanRunATSScan(permissions.BasePermission):
    """
    Permission check for ATS scan limit.
    """
    message = "You have reached your ATS scan limit. Please upgrade your plan or wait until tomorrow."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Only check on create actions
        if view.action not in ['create', 'scan']:
            return True
        
        subscription = Subscription.get_active_subscription(request.user)
        if subscription is None:
            return False
        
        return subscription.can_run_ats_scan()


class CanAccessPortfolioAnalytics(permissions.BasePermission):
    """
    Permission check for portfolio analytics access.
    """
    message = "Portfolio analytics is not available with your current plan."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        subscription = Subscription.get_active_subscription(request.user)
        if subscription is None:
            return False
        
        return subscription.plan.portfolio_analytics


class CanUseCustomSubdomain(permissions.BasePermission):
    """
    Permission check for custom subdomain.
    """
    message = "Custom subdomain is not available with your current plan."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        subscription = Subscription.get_active_subscription(request.user)
        if subscription is None:
            return False
        
        return subscription.plan.custom_subdomain


class IsGraceOrReadOnly(permissions.BasePermission):
    """
    Allow read-only access during grace period.
    """
    message = "Your subscription has expired. Please renew to make changes."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        subscription = Subscription.get_active_subscription(request.user)
        if subscription is None:
            return False
        
        if subscription.is_active:
            return True
        
        # Grace period - read only
        if subscription.is_in_grace:
            return request.method in permissions.SAFE_METHODS
        
        return False
