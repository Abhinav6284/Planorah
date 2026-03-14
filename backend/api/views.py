import os
import uuid
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle

from backend.email_service import send_email_via_brevo


def throttle_scope(scope_name):
    def decorator(view_func):
        setattr(view_func, "throttle_scope", scope_name)
        return view_func
    return decorator


@api_view(['GET'])
def hello_world(request):
    return Response({"message": "Hello from DRF!"})


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([ScopedRateThrottle])
@throttle_scope('support')
def create_support_ticket(request):
    ticket_type = str(request.data.get("type") or "feedback").strip().lower()
    subject = str(request.data.get("subject") or "").strip()
    message = str(request.data.get("message") or "").strip()
    priority = str(request.data.get("priority") or "normal").strip().lower()
    email = str(request.data.get("email") or "").strip()

    valid_types = {"feedback", "bug", "feature", "complaint"}
    valid_priorities = {"low", "normal", "high", "critical"}

    if ticket_type not in valid_types:
        return Response(
            {"error": "Invalid type. Allowed: feedback, bug, feature, complaint."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if priority not in valid_priorities:
        priority = "normal"

    if not subject:
        return Response({"error": "Subject is required."}, status=status.HTTP_400_BAD_REQUEST)

    if not message:
        return Response({"error": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)

    if len(subject) > 200:
        return Response({"error": "Subject is too long."}, status=status.HTTP_400_BAD_REQUEST)

    if len(message) > 5000:
        return Response({"error": "Message is too long."}, status=status.HTTP_400_BAD_REQUEST)

    ticket_id = uuid.uuid4().hex[:12].upper()

    submitter_email = email
    if not submitter_email and getattr(request, "user", None) and request.user.is_authenticated:
        submitter_email = (getattr(request.user, "email", "") or "").strip()

    support_inbox_raw = (
        os.getenv("SUPPORT_INBOX_EMAILS")
        or getattr(settings, "SUPPORT_INBOX_EMAILS", "")
        or os.getenv("SUPPORT_INBOX_EMAIL")
        or getattr(settings, "SUPPORT_INBOX_EMAIL", "")
        or "support@planorah.me"
    )
    support_inboxes = [addr.strip() for addr in str(support_inbox_raw).split(",") if addr.strip()]
    if not support_inboxes:
        support_inboxes = ["support@planorah.me"]

    user_id = "anonymous"
    username = "anonymous"
    if getattr(request, "user", None) and request.user.is_authenticated:
        user_id = str(request.user.id)
        username = request.user.get_username() or "authenticated-user"

    ip_address = (
        (request.META.get("HTTP_X_FORWARDED_FOR") or "").split(",")[0].strip()
        or request.META.get("REMOTE_ADDR")
        or "unknown"
    )
    user_agent = request.META.get("HTTP_USER_AGENT", "unknown")
    submitted_at = timezone.now().strftime("%Y-%m-%d %H:%M:%S %Z")

    admin_subject = f"[Planorah Support][{ticket_type.upper()}][{priority.upper()}] {subject}"
    admin_text = (
        f"Ticket ID: {ticket_id}\n"
        f"Type: {ticket_type}\n"
        f"Priority: {priority}\n"
        f"Subject: {subject}\n"
        f"Message:\n{message}\n\n"
        f"Submitter Email: {submitter_email or 'not provided'}\n"
        f"User ID: {user_id}\n"
        f"Username: {username}\n"
        f"IP: {ip_address}\n"
        f"User-Agent: {user_agent}\n"
        f"Submitted At: {submitted_at}\n"
    )
    admin_html = (
        "<h2>New Support Ticket</h2>"
        f"<p><strong>Ticket ID:</strong> {ticket_id}</p>"
        f"<p><strong>Type:</strong> {ticket_type}</p>"
        f"<p><strong>Priority:</strong> {priority}</p>"
        f"<p><strong>Subject:</strong> {subject}</p>"
        f"<p><strong>Message:</strong><br>{message.replace(chr(10), '<br>')}</p>"
        "<hr>"
        f"<p><strong>Submitter Email:</strong> {submitter_email or 'not provided'}</p>"
        f"<p><strong>User ID:</strong> {user_id}</p>"
        f"<p><strong>Username:</strong> {username}</p>"
        f"<p><strong>IP:</strong> {ip_address}</p>"
        f"<p><strong>User-Agent:</strong> {user_agent}</p>"
        f"<p><strong>Submitted At:</strong> {submitted_at}</p>"
    )

    admin_sent = True
    for inbox in support_inboxes:
        if not send_email_via_brevo(
            to_email=inbox,
            subject=admin_subject,
            html_content=admin_html,
            text_content=admin_text,
        ):
            admin_sent = False

    if not admin_sent:
        return Response(
            {
                "error": "Support system is temporarily unavailable. Please try again shortly or email support@planorah.me.",
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    ack_sent = False
    if submitter_email:
        ack_subject = f"Planorah Support received your message ({ticket_id})"
        ack_text = (
            f"Hi,\n\n"
            f"We received your support message and shared it with our team.\n"
            f"Ticket ID: {ticket_id}\n"
            f"Subject: {subject}\n"
            f"Type: {ticket_type}\n"
            f"Priority: {priority}\n\n"
            "Our team usually replies within 24 hours.\n\n"
            "Thanks,\nPlanorah Support"
        )
        ack_html = (
            "<h2>We received your message</h2>"
            f"<p>Ticket ID: <strong>{ticket_id}</strong></p>"
            f"<p><strong>Subject:</strong> {subject}</p>"
            f"<p><strong>Type:</strong> {ticket_type}</p>"
            f"<p><strong>Priority:</strong> {priority}</p>"
            "<p>Our team usually replies within 24 hours.</p>"
            "<p>Thanks,<br>Planorah Support</p>"
        )
        ack_sent = send_email_via_brevo(
            to_email=submitter_email,
            subject=ack_subject,
            html_content=ack_html,
            text_content=ack_text,
        )

    return Response(
        {
            "message": "Support message submitted successfully.",
            "ticket_id": ticket_id,
            "acknowledgement_sent": ack_sent,
        },
        status=status.HTTP_201_CREATED,
    )
