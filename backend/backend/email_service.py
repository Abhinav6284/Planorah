"""
Custom email service using Brevo API (formerly Sendinblue)
HTTP-based email sending that bypasses SMTP restrictions
"""
import os
from pathlib import Path
import requests

# Load environment variables from .env file
from dotenv import load_dotenv
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(env_path)

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def get_otp_email_template(otp_code, username=None):
    """
    Returns a professional HTML email template for OTP verification
    """
    name = username or "there"
    return f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 24px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #000000; letter-spacing: -0.5px;">Planorah</h1>
                            <p style="margin: 8px 0 0; font-size: 14px; color: #666666;">Your Career Planning Assistant</p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 32px 40px;">
                            <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #1a1a1a;">Verify Your Email</h2>
                            <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #4a4a4a;">
                                Hi {name},<br><br>
                                Thanks for signing up! Use the verification code below to complete your registration:
                            </p>
                            
                            <!-- OTP Code Box -->
                            <div style="background: linear-gradient(135deg, #000000 0%, #333333 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                                <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ffffff; font-family: 'Courier New', monospace;">{otp_code}</span>
                            </div>
                            
                            <p style="margin: 24px 0 0; font-size: 14px; color: #888888; text-align: center;">
                                ⏱️ This code expires in <strong style="color: #1a1a1a;">10 minutes</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px 32px; border-top: 1px solid #f0f0f0;">
                            <p style="margin: 0 0 8px; font-size: 13px; color: #999999; text-align: center;">
                                If you didn't request this code, you can safely ignore this email.
                            </p>
                            <p style="margin: 0; font-size: 13px; color: #999999; text-align: center;">
                                © 2024 Planorah. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
'''


def get_password_reset_template(otp_code, username=None):
    """
    Returns a professional HTML email template for password reset
    """
    name = username or "there"
    return f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 24px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #000000; letter-spacing: -0.5px;">Planorah</h1>
                            <p style="margin: 8px 0 0; font-size: 14px; color: #666666;">Your Career Planning Assistant</p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 32px 40px;">
                            <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #1a1a1a;">🔐 Password Reset Request</h2>
                            <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #4a4a4a;">
                                Hi {name},<br><br>
                                We received a request to reset your password. Use the code below to proceed:
                            </p>
                            
                            <!-- OTP Code Box -->
                            <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                                <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ffffff; font-family: 'Courier New', monospace;">{otp_code}</span>
                            </div>
                            
                            <p style="margin: 24px 0 0; font-size: 14px; color: #888888; text-align: center;">
                                ⏱️ This code expires in <strong style="color: #1a1a1a;">5 minutes</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px 32px; border-top: 1px solid #f0f0f0;">
                            <p style="margin: 0 0 8px; font-size: 13px; color: #999999; text-align: center;">
                                If you didn't request this, please ignore this email. Your password won't change.
                            </p>
                            <p style="margin: 0; font-size: 13px; color: #999999; text-align: center;">
                                © 2024 Planorah. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
'''


def send_email_via_brevo(to_email, subject, html_content, text_content=None):
    """
    Send email using Brevo API
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML content of the email
        text_content: Plain text fallback (optional)
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    api_key = os.getenv('BREVO_API_KEY')
    
    if not api_key:
        print("BREVO_API_KEY not set in environment variables")
        return False
    
    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json"
    }
    
    payload = {
        "sender": {
            "name": "Planorah",
            "email": "abhinav@planorah.me"
        },
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent": html_content
    }
    
    if text_content:
        payload["textContent"] = text_content
    
    try:
        response = requests.post(BREVO_API_URL, json=payload, headers=headers)
        
        if response.status_code in [200, 201, 202]:
            print(f"Email sent successfully to {to_email}")
            return True
        else:
            print(f"Failed to send email: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Error sending email via Brevo: {e}")
        return False


def send_otp_email(to_email, otp_code, username=None):
    """
    Send OTP verification email
    """
    subject = f"Your Planorah Verification Code: {otp_code}"
    html_content = get_otp_email_template(otp_code, username)
    text_content = f"Your Planorah verification code is: {otp_code}. It expires in 10 minutes."
    
    return send_email_via_brevo(to_email, subject, html_content, text_content)


def send_password_reset_email(to_email, otp_code, username=None):
    """
    Send password reset OTP email
    """
    subject = f"Reset Your Planorah Password - Code: {otp_code}"
    html_content = get_password_reset_template(otp_code, username)
    text_content = f"Your Planorah password reset code is: {otp_code}. It expires in 5 minutes."
    
    return send_email_via_brevo(to_email, subject, html_content, text_content)
