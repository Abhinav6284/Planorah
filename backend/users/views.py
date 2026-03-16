from datetime import timedelta
import random
import logging
from django.conf import settings
from django.utils import timezone
from django.db import IntegrityError
from django.contrib.auth.models import BaseUserManager
from django.contrib.auth import authenticate, get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.throttling import ScopedRateThrottle

# Brevo email service
from backend.email_service import send_otp_email, send_password_reset_email, send_welcome_email, send_account_deleted_email

# AI onboarding call
from ai_calls.service import trigger_onboarding_call

from .models import CustomUser, OTPVerification, UserProfile
from .serializers import UserSerializer, UserProfileSerializer
from .statistics import get_user_statistics

# Configure module logger
logger = logging.getLogger(__name__)

User = get_user_model()


def throttle_scope(scope_name):
    """
    Attach DRF throttle scope to function-based views.
    DRF does not provide a built-in throttle_scope decorator for FBVs.
    """
    def decorator(view_func):
        setattr(view_func, "throttle_scope", scope_name)
        return view_func
    return decorator


def _resolve_user_status(user: CustomUser) -> str:
    known_statuses = {choice for choice, _ in CustomUser.STATUS_CHOICES}
    raw_status = (getattr(user, "status", "") or "").strip().lower()
    if raw_status in known_statuses:
        return raw_status

    if user.is_verified and user.is_active:
        return CustomUser.STATUS_ACTIVE
    if not user.is_verified:
        return CustomUser.STATUS_PENDING
    return CustomUser.STATUS_SUSPENDED


def _set_user_pending(user: CustomUser) -> None:
    user.status = CustomUser.STATUS_PENDING
    user.is_active = False
    user.is_verified = False


def _set_user_active(user: CustomUser) -> None:
    user.status = CustomUser.STATUS_ACTIVE
    user.is_active = True
    user.is_verified = True


def _send_fresh_otp(user: CustomUser) -> bool:
    otp = str(random.randint(100000, 999999))
    OTPVerification.objects.filter(email__iexact=user.email).delete()
    OTPVerification.objects.create(
        email=user.email,
        otp=otp,
        is_used=False,
        created_at=timezone.now(),
    )

    try:
        return bool(send_otp_email(user.email, otp, user.username))
    except Exception as exc:
        logger.warning("OTP email send failed for %s: %s", user.email, exc)
        return False


# ---------------- REGISTER USER ----------------
@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([ScopedRateThrottle])
@throttle_scope('register')
def register_user(request):
    """
    Handle user registration with email and password.
    Creates an inactive user and sends OTP for verification.
    """
    data = request.data
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    # Validate required fields
    if not email or not username or not password:
        return Response({
            'error': 'Email, username, and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Normalize input
    email = email.lower().strip()
    username = username.strip()
    identifier = email

    # Clean up DeletedUser record if exists (allow re-registration)
    from .models import DeletedUser
    DeletedUser.objects.filter(email__iexact=email).delete()

    existing_user = CustomUser.objects.filter(email__iexact=identifier).first()
    if existing_user:
        existing_status = _resolve_user_status(existing_user)

        if existing_status == CustomUser.STATUS_PENDING or not existing_user.is_verified:
            username_taken = CustomUser.objects.filter(
                username__iexact=username
            ).exclude(id=existing_user.id).exists()
            if username_taken:
                return Response({
                    'error': 'Username already taken'
                }, status=status.HTTP_400_BAD_REQUEST)

            existing_user.username = username
            existing_user.set_password(password)
            _set_user_pending(existing_user)
            existing_user.save(
                update_fields=['username', 'password', 'status', 'is_active', 'is_verified', 'updated_at']
            )

            otp_sent = _send_fresh_otp(existing_user)
            message = (
                'Account exists but is pending verification. A new OTP has been sent.'
                if otp_sent else
                'Account exists but failed to send OTP. Please use resend OTP.'
            )
            return Response({
                'message': message,
                'email': existing_user.email,
                'verify_required': True,
                'existing_pending_account': True,
            }, status=status.HTTP_200_OK)

        if existing_status == CustomUser.STATUS_SUSPENDED:
            return Response({
                'error': 'This account is suspended. Please contact support.'
            }, status=status.HTTP_403_FORBIDDEN)

        if existing_status == CustomUser.STATUS_DELETED:
            return Response({
                'error': 'This account is deleted. Contact support to restore access.'
            }, status=status.HTTP_403_FORBIDDEN)

        return Response({
            'error': 'Email already registered'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Check if username already exists for new account creation
    if CustomUser.objects.filter(username__iexact=username).exists():
        return Response({
            'error': 'Username already taken'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Create user in pending state until OTP verification
        user = CustomUser.objects.create(
            email=identifier,
            username=username,
            status=CustomUser.STATUS_PENDING,
            is_active=False,
            is_verified=False,
        )
        user.set_password(password)
        user.save(update_fields=['password', 'updated_at'])

        otp_sent = _send_fresh_otp(user)
        if not otp_sent:
            return Response({
                'message': 'Account created but failed to send OTP. Please use resend OTP.',
                'email': user.email,
                'verify_required': True,
            }, status=status.HTTP_201_CREATED)

        return Response({
            'message': 'Registration initiated. Please verify your email with the OTP sent.',
            'email': user.email,
            'verify_required': True,
        }, status=status.HTTP_201_CREATED)

    except IntegrityError as e:
        logger.error(f"IntegrityError during registration: {e}")
        return Response({
            'error': 'Registration failed. Email or username may already be in use.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error during registration: {e}")
        return Response({
            'error': 'Registration failed',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------- VERIFY OTP ----------------
@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([ScopedRateThrottle])
@throttle_scope('otp')
def verify_otp(request):
    data = request.data
    email = data.get('email')
    otp = data.get('otp')

    if not email or not otp:
        return Response({
            'error': 'Email and OTP are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    email = email.strip().lower()

    try:
        # Check against OTPVerification model
        otp_record = OTPVerification.objects.filter(
            email__iexact=email, is_used=False).latest('created_at')

        if otp_record.is_expired():
            return Response({'error': 'OTP has expired'}, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.otp != otp:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

    except OTPVerification.DoesNotExist:
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

    # Find the user and activate
    try:
        user = CustomUser.objects.get(email__iexact=email)
    except CustomUser.DoesNotExist:
        return Response({"message": "User not found"}, status=status.HTTP_400_BAD_REQUEST)

    if _resolve_user_status(user) == CustomUser.STATUS_ACTIVE and user.is_verified:
        refresh = RefreshToken.for_user(user)
        onboarding_complete = False
        if hasattr(user, 'profile'):
            onboarding_complete = user.profile.onboarding_complete  # type: ignore

        return Response(
            {
                "message": "Account already verified.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "onboarding_complete": onboarding_complete,
            },
            status=status.HTTP_200_OK,
        )

    _set_user_active(user)
    user.save(update_fields=['status', 'is_active', 'is_verified', 'updated_at'])

    # Send Welcome Email
    try:
        send_welcome_email(user.email, user.username)
    except Exception as e:
        logger.warning("Failed to send welcome email: %s", e)

    # Mark used or delete record
    try:
        # If your model has is_used field, mark it; otherwise delete.
        if hasattr(otp_record, "is_used"):
            otp_record.is_used = True
            otp_record.save()
        else:
            otp_record.delete()
    except Exception:
        otp_record.delete()

    # Generate tokens for auto-login
    refresh = RefreshToken.for_user(user)

    # Check onboarding status
    onboarding_complete = False
    if hasattr(user, 'profile'):
        onboarding_complete = user.profile.onboarding_complete  # type: ignore

    return Response({
        "message": "Registration successful!",
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "onboarding_complete": onboarding_complete
    }, status=status.HTTP_200_OK)


# ---------------- LOGIN USER ----------------
@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([ScopedRateThrottle])
@throttle_scope('login')
def login_user(request):
    """
    Handles user login using either email or username.
    Returns JWT access and refresh tokens if authentication succeeds.
    """
    identifier = request.data.get("identifier")
    password = request.data.get("password")

    # Validate input
    if not identifier or not password:
        return Response(
            {"error": "Identifier and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    identifier = identifier.strip()

    # Find the user by email or username
    try:
        if "@" in identifier:
            user_obj = User.objects.get(email__iexact=identifier)
        else:
            user_obj = User.objects.get(username__iexact=identifier)
    except User.DoesNotExist:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user_status = _resolve_user_status(user_obj)

    if user_status in {CustomUser.STATUS_SUSPENDED, CustomUser.STATUS_DELETED}:
        return Response(
            {"error": "This account is currently unavailable. Please contact support."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Django's authenticate() rejects inactive users early, so validate pending
    # users manually first and trigger OTP re-verification.
    if user_status == CustomUser.STATUS_PENDING or not user_obj.is_verified:
        if not user_obj.has_usable_password() or not user_obj.check_password(password):
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        _set_user_pending(user_obj)
        user_obj.save(update_fields=['status', 'is_active', 'is_verified', 'updated_at'])
        otp_sent = _send_fresh_otp(user_obj)
        message = (
            "Please verify your email before login. A new OTP has been sent."
            if otp_sent else
            "Please verify your email before login. Failed to send OTP email, please use resend OTP."
        )
        return Response(
            {
                "error": message,
                "verify_required": True,
                "email": user_obj.email,
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # Authenticate using username (Django default)
    user = authenticate(request, username=user_obj.email, password=password)
    if not isinstance(user, CustomUser):
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

    if user is None:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if _resolve_user_status(user) != CustomUser.STATUS_ACTIVE or not user.is_active or getattr(user, "is_verified", False) is False:
        return Response(
            {"error": "Please verify your email before login.", "verify_required": True, "email": user.email},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    from .activity import record_activity
    record_activity(user, "login")

    return Response(
        {
            "refresh": refresh_token,
            "access": access_token,
            "message": "Login successful",
            "user": {
                "id": getattr(user, "id", None),  # ✅ safe for type checker
                "username": user.username,
                "email": user.email,
            },
            # type: ignore
            "onboarding_complete": getattr(user.profile if hasattr(user, 'profile') else None, 'onboarding_complete', False)
        },
        status=status.HTTP_200_OK,
    )


# ---------------- DAILY LOGIN PING ----------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([ScopedRateThrottle])
@throttle_scope('daily_login')
def daily_login_ping(request):
    """
    Idempotent daily activity ping to keep streaks in sync
    without relying on re-login.
    """
    user = request.user
    from .activity import record_activity
    record_activity(user, "daily_login")

    profile = getattr(user, 'profile', None)
    return Response(
        {
            "message": "Daily streak updated",
            "streak": profile.streak_count if profile else 0,
            "last_activity_date": profile.last_study_date.isoformat() if profile and profile.last_study_date else None,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([ScopedRateThrottle])
@throttle_scope('otp_resend')
def resend_otp(request):
    email = request.data.get("email")

    if not email:
        return Response({"message": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

    email = email.strip().lower()

    try:
        user = CustomUser.objects.get(email__iexact=email)
    except CustomUser.DoesNotExist:
        return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    user_status = _resolve_user_status(user)
    if user_status in {CustomUser.STATUS_SUSPENDED, CustomUser.STATUS_DELETED}:
        return Response({"message": "This account is unavailable. Contact support."}, status=status.HTTP_403_FORBIDDEN)

    if user_status == CustomUser.STATUS_ACTIVE and user.is_verified:
        return Response({"message": "Account is already verified. Please login."}, status=status.HTTP_400_BAD_REQUEST)

    _set_user_pending(user)
    user.save(update_fields=['status', 'is_active', 'is_verified', 'updated_at'])

    email_sent = _send_fresh_otp(user)
    if not email_sent:
        return Response({"message": "Failed to send OTP email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"message": "New OTP sent successfully"}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([ScopedRateThrottle])
@throttle_scope('otp')
def request_password_reset(request):
    email = request.data.get("email")

    if not email:
        return Response({"message": "Email is required"}, status=400)

    email = email.strip().lower()

    try:
        user = CustomUser.objects.get(email__iexact=email)
    except CustomUser.DoesNotExist:
        return Response({"message": "No account found with that email."}, status=404)

    if _resolve_user_status(user) != CustomUser.STATUS_ACTIVE or not user.is_verified:
        return Response({"message": "Please verify your email before resetting password."}, status=400)

    # Delete old OTPs
    OTPVerification.objects.filter(email__iexact=email).delete()

    otp = str(random.randint(100000, 999999))
    OTPVerification.objects.create(
        email=email, otp=otp, is_used=False, created_at=timezone.now())

    # Send password reset OTP via Brevo
    try:
        email_sent = send_password_reset_email(email, otp, user.username)
        if not email_sent:
            return Response({"message": "Failed to send password reset email"}, status=500)
    except Exception as e:
        logger.warning("Password reset email failed: %s", e)
        return Response({"message": "Failed to send password reset email"}, status=500)

    return Response({"message": "Password reset OTP sent to your email."}, status=200)


# 2️⃣ Verify reset OTP
@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([ScopedRateThrottle])
@throttle_scope('otp')
def verify_reset_otp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")

    if not email or not otp:
        return Response({"message": "Email and OTP are required."}, status=400)

    email = email.strip().lower()

    try:
        record = OTPVerification.objects.get(
            email__iexact=email, otp=otp, is_used=False)
    except OTPVerification.DoesNotExist:
        return Response({"message": "Invalid or expired OTP."}, status=400)

    if hasattr(record, "is_expired") and record.is_expired():
        record.delete()
        return Response({"message": "OTP expired. Please request a new one."}, status=400)

    record.is_used = True
    record.save()

    return Response({"message": "OTP verified successfully."}, status=200)


# 3️⃣ Reset password
@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([ScopedRateThrottle])
@throttle_scope('otp')
def reset_password(request):
    email = request.data.get("email")
    new_password = request.data.get("new_password")

    if not email or not new_password:
        return Response({"message": "Email and new password required."}, status=400)

    email = email.strip().lower()

    try:
        user = CustomUser.objects.get(email__iexact=email)
    except CustomUser.DoesNotExist:
        return Response({"message": "User not found."}, status=404)

    user.set_password(new_password)
    user.save()

    return Response({"message": "Password reset successfully."}, status=200)


# ---------------- GET CURRENT USER (for frontend) ----------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    user = request.user
    serializer = UserSerializer(user, context={'request': request})
    return Response(serializer.data)


@api_view(['POST', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    Update user profile details (field, role, level, skills, goal).
    """
    try:
        user = request.user

        # Get or create profile
        profile, created = UserProfile.objects.get_or_create(user=user)

        # Update User model fields (name)
        full_name = request.data.get('name')
        if full_name:
            parts = full_name.split(' ', 1)
            user.first_name = parts[0]
            user.last_name = parts[1] if len(parts) > 1 else ''

        # Update phone and DOB on User model
        phone = request.data.get('phone_number')
        if phone:
            user.phone_number = phone

        dob = request.data.get('date_of_birth')
        if dob:
            try:
                user.date_of_birth = dob
            except (ValueError, TypeError):
                # If date is invalid, skip setting it
                pass

        user.save()

        # Update UserProfile fields using serializer
        serializer = UserProfileSerializer(
            profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            profile.refresh_from_db()  # Refresh to get updated values

            # Check if onboarding is complete and set flag (only sets once)
            if not profile.onboarding_complete:
                # Universal onboarding complete if purpose, domain, and goal_statement are set
                universal_onboarded = all([
                    profile.purpose,
                    profile.domain,
                    profile.goal_statement
                ])

                # Education-stage onboarding complete (new onboarding flow)
                stage_requires_specific_data = profile.education_stage not in (
                    None, "", "professional"
                )
                onboarding_data_present = isinstance(
                    profile.onboarding_data, dict
                ) and len(profile.onboarding_data) > 0
                has_required_stage_data = (
                    onboarding_data_present if stage_requires_specific_data else True
                )
                education_onboarded = all([
                    profile.education_stage,
                    profile.gender,
                    profile.weekly_hours and profile.weekly_hours > 0,
                    profile.validation_mode,
                    has_required_stage_data,
                    profile.onboarding_accepted_terms,
                ])

                # Legacy onboarding complete if old fields are set
                legacy_onboarded = all([
                    profile.field_of_study,
                    profile.target_role,
                    profile.experience_level
                ])

                if universal_onboarded or legacy_onboarded or education_onboarded:
                    profile.onboarding_complete = True
                    # Lock goal if submitting goal_statement for the first time
                    if profile.goal_statement and not profile.goal_locked_at:
                        profile.goal_locked_at = timezone.now()
                    profile.save()

                    # 🤖 Trigger AI onboarding call in background thread
                    try:
                        trigger_onboarding_call(user, profile)
                    except Exception as call_err:
                        logger.warning(
                            f"AI onboarding call could not be triggered: {call_err}")

            # Include updated user info in response if needed, or rely on frontend refetch
            return Response({
                "message": "Profile updated successfully",
                "profile": serializer.data,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name
                },
                "onboarding_complete": profile.onboarding_complete
            }, status=status.HTTP_200_OK)

        # Log errors and return them
        logger.error(f"UserProfileSerializer errors: {serializer.errors}")
        return Response({
            "error": "Failed to update profile",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error in update_user_profile: {str(e)}", exc_info=True)
        return Response({
            "error": "Failed to update profile",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    """
    Logout endpoint: accepts {"refresh": "<refresh_token>"} in body.
    If provided it will blacklist the refresh token (requires
    rest_framework_simplejwt.token_blacklist app configured).
    """
    refresh_token = request.data.get('refresh')

    # If client does not send refresh token, still clear server-side session if any
    if not refresh_token:
        return Response({"detail": "Refresh token not provided. Client should clear tokens."}, status=status.HTTP_200_OK)

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()  # requires simplejwt token blacklist app installed & migrated
        return Response({"detail": "Logout successful. Token blacklisted."}, status=status.HTTP_200_OK)
    except TokenError as e:
        return Response({"error": "Invalid or expired token.", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": "Failed to logout", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------- DELETE ACCOUNT ----------------


# ---------------- GOOGLE OAUTH LOGIN ----------------
@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([ScopedRateThrottle])
@throttle_scope('oauth')
def google_oauth_login(request):
    """
    Handle Google OAuth login. Accepts a Google Access Token from the frontend,
    verifies it via Google's userinfo endpoint, and creates/logs in the user.
    """
    try:
        import requests as http_requests
    except ImportError as exc:
        logger.exception("requests import failed in google_oauth_login")
        return Response({"error": "Server configuration error", "details": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    token = request.data.get('token')
    if not token:
        return Response({"error": "Google token is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Verify the Google Access Token via UserInfo Endpoint
        userinfo_response = http_requests.get(
            f'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {token}'},
            timeout=10
        )

        if userinfo_response.status_code != 200:
            return Response({
                "error": "Invalid Google token",
                "details": f"Google API returned status {userinfo_response.status_code}: {userinfo_response.text}"
            }, status=status.HTTP_400_BAD_REQUEST)

        idinfo = userinfo_response.json()

        # Extract user info
        email = idinfo.get('email')

        if not email:
            return Response({"error": "No email received from Google", "details": f"Response: {idinfo}"}, status=status.HTTP_400_BAD_REQUEST)

        # Normalize email
        email = email.lower().strip()

        # REMOVED DeletedUser check to allow re-registration

        # Check if user exists
        try:
            user = CustomUser.objects.get(email=email)

            # If user exists but was inactive (e.g. from abandoned registration), activate them
            # because Google has verified this email.
            # because Google has verified this email.
            if not user.is_active or not user.is_verified:
                _set_user_active(user)
                user.set_unusable_password()  # Clear any old password from previous life
                user.save(update_fields=['status', 'is_active', 'is_verified', 'password', 'updated_at'])

        except CustomUser.DoesNotExist:
            # Check if this is a signup or login attempt
            # Default to login for backwards compatibility
            mode = request.data.get('mode', 'login')

            if mode == 'signup':
                # Generate a unique username from email
                base_username = email.split('@')[0].lower()
                username = base_username
                counter = 1
                while CustomUser.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1

                try:
                    # Create user without password (OAuth user)
                    user = CustomUser.objects.create(
                        email=email,
                        username=username,
                        status=CustomUser.STATUS_ACTIVE,
                        is_active=True,
                        is_verified=True,
                    )
                    user.set_unusable_password()

                    # Don't set name from Google - let user fill it during onboarding
                    user.save(update_fields=['password', 'updated_at'])
                except Exception as create_err:
                    logger.exception("Failed to create Google OAuth user for %s", email)
                    return Response({
                        "error": "Failed to create account",
                        "details": str(create_err)
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                # Login mode - user must already exist
                return Response({
                    "error": "Account not found",
                    "signup_required": True,
                    "message": "No account exists with this email. Please sign up first.",
                    "email": email
                }, status=status.HTTP_404_NOT_FOUND)

        # --- 2FA ENFORCEMENT START ---
        try:
            # Generate OTP
            otp = str(random.randint(100000, 999999))

            # Delete old OTPs
            OTPVerification.objects.filter(email=email).delete()

            # Create new OTP
            OTPVerification.objects.create(email=email, otp=otp)

            # Send Email
            send_otp_email(email, otp, user.username)

            response_data = {
                "message": "Please verify OTP sent to your email",
                "two_factor_required": True,
                "email": email
            }
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception:
            logger.exception("Failed to send Google OAuth OTP for %s", email)
            return Response({"error": "Failed to send 2FA OTP"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # --- 2FA ENFORCEMENT END ---

    except ValueError as exc:
        return Response({"error": "Invalid Google token", "details": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        logger.exception("[GOOGLE_OAUTH] EXCEPTION: %s: %s", type(exc).__name__, exc)
        return Response({"error": "Google authentication failed", "details": f"{type(exc).__name__}: {str(exc)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------- GITHUB OAUTH LOGIN ----------------
@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([ScopedRateThrottle])
@throttle_scope('oauth')
def github_oauth_login(request):
    """
    Handle GitHub OAuth login. Accepts an authorization code from the frontend,
    exchanges it for an access token, fetches user info, and creates/logs in the user.
    """
    import requests as http_requests

    code = request.data.get('code')
    # Get redirect_uri from request, fallback to settings for backwards compatibility
    redirect_uri = request.data.get(
        'redirect_uri', settings.GITHUB_OAUTH_REDIRECT_URI)

    if not code:
        return Response({"error": "GitHub authorization code is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Exchange the code for an access token
        token_response = http_requests.post(
            'https://github.com/login/oauth/access_token',
            data={
                'client_id': settings.GITHUB_OAUTH_CLIENT_ID,
                'client_secret': settings.GITHUB_OAUTH_CLIENT_SECRET,
                'code': code,
                'redirect_uri': redirect_uri,
            },
            headers={'Accept': 'application/json'}
        )

        token_data = token_response.json()

        if 'error' in token_data:
            return Response({
                "error": "Failed to get GitHub access token",
                "details": token_data.get('error_description', token_data.get('error'))
            }, status=status.HTTP_400_BAD_REQUEST)

        access_token = token_data.get('access_token')

        if not access_token:
            return Response({"error": "No access token received from GitHub"}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch user info from GitHub
        user_response = http_requests.get(
            'https://api.github.com/user',
            headers={
                'Authorization': f'Bearer {access_token}',
                'Accept': 'application/json'
            }
        )

        github_user = user_response.json()

        # Fetch user emails (primary email might not be in user object)
        emails_response = http_requests.get(
            'https://api.github.com/user/emails',
            headers={
                'Authorization': f'Bearer {access_token}',
                'Accept': 'application/json'
            }
        )

        emails = emails_response.json()

        # Find primary verified email
        email = None
        for e in emails:
            if e.get('primary') and e.get('verified'):
                email = e.get('email')
                break

        if not email:
            # Fallback to first verified email
            for e in emails:
                if e.get('verified'):
                    email = e.get('email')
                    break

        if not email:
            return Response({"error": "No verified email found in GitHub account"}, status=status.HTTP_400_BAD_REQUEST)

        # Normalize email
        email = email.lower().strip()
        github_username = github_user.get('login', '')

        # REMOVED DeletedUser check to allow re-registration

        # Check if user exists
        try:
            user = CustomUser.objects.get(email=email)

            # If user exists but was inactive (e.g. from abandoned registration), activate them
            # because GitHub has verified this email.
            # because GitHub has verified this email.
            if not user.is_active or not user.is_verified:
                _set_user_active(user)
                user.set_unusable_password()  # Clear any old password from previous life
                user.save(update_fields=['status', 'is_active', 'is_verified', 'password', 'updated_at'])

        except CustomUser.DoesNotExist:
            # Check if this is a signup or login attempt
            # Default to login for backwards compatibility
            mode = request.data.get('mode', 'login')

            if mode == 'signup':
                # Generate a unique username
                base_username = github_username.lower(
                ) if github_username else email.split('@')[0].lower()
                username = base_username
                counter = 1
                while CustomUser.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1

                try:
                    # Create user without password (OAuth user)
                    user = CustomUser.objects.create(
                        email=email,
                        username=username,
                        status=CustomUser.STATUS_ACTIVE,
                        is_active=True,
                        is_verified=True,
                    )
                    user.set_unusable_password()

                    # Don't set name from GitHub - let user fill it during onboarding
                    user.save(update_fields=['password', 'updated_at'])
                except Exception as create_err:
                    logger.exception("Failed to create GitHub OAuth user for %s", email)
                    return Response({
                        "error": "Failed to create account",
                        "details": str(create_err)
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                # Login mode - user must already exist
                return Response({
                    "error": "Account not found",
                    "signup_required": True,
                    "message": "No account exists with this email. Please sign up first.",
                    "email": email
                }, status=status.HTTP_404_NOT_FOUND)

        # --- 2FA ENFORCEMENT START ---
        try:
            # Generate OTP
            otp = str(random.randint(100000, 999999))

            # Delete old OTPs
            OTPVerification.objects.filter(email=email).delete()

            # Create new OTP
            OTPVerification.objects.create(email=email, otp=otp)

            # Send Email
            send_otp_email(email, otp, user.username)

            response_data = {
                "message": "Please verify OTP sent to your email",
                "two_factor_required": True,
                "email": email
            }
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception:
            logger.exception("Failed to send GitHub OAuth OTP for %s", email)
            return Response({"error": "Failed to send 2FA OTP"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # --- 2FA ENFORCEMENT END ---

        # (Original Token Generation Code is effectively replaced/bypassed)

    except Exception as exc:
        logger.exception("GitHub OAuth login failed")
        return Response({"error": "GitHub authentication failed", "details": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------- DELETE ACCOUNT ----------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """
    Delete user account with different confirmation methods based on account type.
    - Regular users (with password): must provide password
    - OAuth users (no password): must type 'DELETE'
    """
    user = request.user

    if user.has_usable_password():
        # Regular user - require password OR 'DELETE' confirmation (fallback)
        password = request.data.get('password')
        confirmation = request.data.get('confirmation')

        if password:
            if not user.check_password(password):
                return Response({
                    "error": "Invalid password",
                    "details": "The password you entered is incorrect"
                }, status=status.HTTP_400_BAD_REQUEST)
        elif confirmation == 'DELETE':
            # Allow fallback to OAuth-style deletion if user explicitly chooses it
            # This handles cases where "Hybrid" users forgot their password but are authenticated
            pass
        else:
            return Response({
                "error": "Password required",
                "details": "Please enter your password to confirm account deletion"
            }, status=status.HTTP_400_BAD_REQUEST)
    else:
        # OAuth user - require typing "DELETE"
        confirmation = request.data.get('confirmation', '')
        if confirmation != 'DELETE':
            return Response({
                "error": "Confirmation required",
                "details": "Please type DELETE to confirm account deletion"
            }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Capture details before deletion
        user_email = user.email
        user_username = user.username

        # Delete will trigger signal to add email to DeletedUser table
        user.delete()

        # Send Deletion Confirmation Email
        try:
            send_account_deleted_email(user_email, user_username)
        except Exception as e:
            logger.error(f"Failed to send deletion email: {e}")

        return Response({
            "message": "Account deleted successfully",
            "email": user_email
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error deleting account: {e}")
        return Response({
            "error": "Account deletion failed",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------- VERIFY SOCIAL OTP ----------------
@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([ScopedRateThrottle])
@throttle_scope('oauth')
def verify_social_otp(request):
    """
    Verify OTP sent during social login (Google/GitHub).
    If valid, issue JWT tokens.
    """
    email = request.data.get("email")
    otp_in = request.data.get("otp")

    if not email or not otp_in:
        return Response({"message": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

    email = email.lower().strip()
    otp = str(otp_in).strip()

    # Find unused OTPs for this email (case-insensitive)
    otp_qs = OTPVerification.objects.filter(email__iexact=email)

    if not otp_qs.exists():
        return Response({"message": "Invalid OTP or email"}, status=status.HTTP_400_BAD_REQUEST)

    # Prefer the latest unused OTP record
    otp_record = otp_qs.filter(is_used=False).order_by('-created_at').first()

    if not otp_record:
        return Response({"message": "Invalid OTP or it has been used"}, status=status.HTTP_400_BAD_REQUEST)

    # Compare values
    if str(otp_record.otp).strip() != otp:
        return Response({"message": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

    # Check expiry
    if hasattr(otp_record, "is_expired") and otp_record.is_expired():
        otp_record.delete()
        return Response({"message": "OTP expired, please request a new one"}, status=status.HTTP_400_BAD_REQUEST)

    # Mark OTP as used
    if hasattr(otp_record, "is_used"):
        otp_record.is_used = True
        otp_record.save()
    else:
        otp_record.delete()

    # Retrieve User
    try:
        user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
        return Response({"message": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST)

    if _resolve_user_status(user) != CustomUser.STATUS_ACTIVE or not user.is_active or not user.is_verified:
        _set_user_active(user)
        user.save(update_fields=['status', 'is_active', 'is_verified', 'updated_at'])

    # Generate tokens
    try:
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
    except Exception:
        logger.exception("Failed to generate social OTP tokens for %s", email)
        return Response({"message": "Failed to generate tokens"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Check onboarding status
    onboarding_complete = False
    if hasattr(user, 'profile'):
        onboarding_complete = user.profile.onboarding_complete  # type: ignore

    return Response({
        "message": "Login verification successful",
        "access": access_token,
        "refresh": refresh_token,
        "onboarding_complete": onboarding_complete,
        "user": {
            "id": getattr(user, "id", None),  # type: ignore
            "username": user.username,
            "email": user.email,
        }
    }, status=status.HTTP_200_OK)


# ---------------- CHECK AUTH TYPE ----------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_auth_type(request):
    """
    Check if user is OAuth-only or has a password.
    Returns: {
        "has_password": true/false,
        "is_oauth": true/false
    }
    """
    user = request.user
    has_password = user.has_usable_password()

    return Response({
        "has_password": has_password,
        "is_oauth": not has_password
    }, status=status.HTTP_200_OK)

