from django.shortcuts import redirect
from django.conf import settings


class StaffOnlyMiddleware:
    """
    Protects all /saas-admin/* routes so only is_staff=True users can access them.
    Unauthenticated requests are redirected to Django admin login.
    Non-staff authenticated requests get a 403.
    """

    ADMIN_PREFIX = "/saas-admin/"
    LOGIN_URL = "/admin/login/?next="

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith(self.ADMIN_PREFIX):
            user = request.user
            if not user.is_authenticated:
                return redirect(f"{self.LOGIN_URL}{request.path}")
            if not user.is_staff:
                from django.http import HttpResponseForbidden
                return HttpResponseForbidden(
                    "<h1>403 Forbidden</h1><p>Staff access only.</p>"
                )
        return self.get_response(request)
