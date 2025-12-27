"""
Custom email backend using Resend API (HTTP-based, bypasses SMTP blocks)
"""
import os
from django.core.mail.backends.base import BaseEmailBackend

try:
    import resend
    RESEND_AVAILABLE = True
except ImportError:
    RESEND_AVAILABLE = False


class ResendEmailBackend(BaseEmailBackend):
    """
    Email backend that uses Resend API to send emails.
    This bypasses SMTP restrictions on cloud providers like DigitalOcean.
    """
    
    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.api_key = os.getenv('RESEND_API_KEY')
        if RESEND_AVAILABLE and self.api_key:
            resend.api_key = self.api_key
    
    def send_messages(self, email_messages):
        if not RESEND_AVAILABLE:
            if not self.fail_silently:
                raise ImportError("resend package is not installed. Run: pip install resend")
            return 0
        
        if not self.api_key:
            if not self.fail_silently:
                raise ValueError("RESEND_API_KEY environment variable is not set")
            return 0
        
        num_sent = 0
        for message in email_messages:
            try:
                # Resend requires a verified domain, or use onboarding@resend.dev for testing
                from_email = message.from_email or os.getenv('DEFAULT_FROM_EMAIL', 'onboarding@resend.dev')
                
                params = {
                    "from": from_email,
                    "to": message.to,
                    "subject": message.subject,
                    "text": message.body,
                }
                
                # Add HTML content if available
                if hasattr(message, 'alternatives') and message.alternatives:
                    for content, mimetype in message.alternatives:
                        if mimetype == 'text/html':
                            params["html"] = content
                            break
                
                resend.Emails.send(params)
                num_sent += 1
            except Exception as e:
                if not self.fail_silently:
                    raise
                print(f"Resend email error: {e}")
        
        return num_sent
