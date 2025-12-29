from datetime import timedelta
import random
import logging
from django.conf import settings
from django.utils import timezone
from django.db import IntegrityError
from django.contrib.auth.models import BaseUserManager
from django.contrib.auth import authenticate, get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.exceptions import TokenError

# Brevo email service
from backend.email_service import send_otp_email, send_password_reset_email, send_welcome_email, send_account_deleted_email

from .models import CustomUser, OTPVerification, UserProfile
from .serializers import UserSerializer, UserProfileSerializer
from .statistics import get_user_statistics

# Configure logger for OAuth debugging
logger = logging.getLogger(__name__)

User = get_user_model()


# ---------------- REGISTER USER ----------------
@api_view(['POST'])
@permission_classes([AllowAny])
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

    # Normalize email
    email = email.lower().strip()
    username = username.strip()

    # Check for deleted user
    from .models import DeletedUser
    if DeletedUser.objects.filter(email=email).exists():
        return Response({
            "error": "Account previously deleted",
            "details": "This account was deleted. You can re-register if you wish to create a new account."
        }, status=status.HTTP_403_FORBIDDEN)

    # Check if email already exists
    if CustomUser.objects.filter(email__iexact=email).exists():
        return Response({
            'error': 'Email already registered'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Check if username already exists
    if CustomUser.objects.filter(username__iexact=username).exists():
        return Response({
            'error': 'Username already taken'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Create user (inactive until OTP verification)
        user = CustomUser.objects.create(
            email=email,
            username=username,
            is_active=False,
            is_verified=False,
        )
        user.set_password(password)
        user.save()

        # Generate OTP
        otp = str(random.randint(100000, 999999))

        # Delete any existing OTPs for this email
        OTPVerification.objects.filter(email__iexact=email).delete()

        # Create new OTP record
        OTPVerification.objects.create(
            email=email,
            otp=otp,
            is_used=False,
            created_at=timezone.now()
        )

        # Send OTP via email
        try:
            email_sent = send_otp_email(email, otp, username)
            if not email_sent:
                # User created but email failed - they can use resend
                return Response({
                    'message': 'Account created but failed to send OTP. Please use resend OTP.',
                    'email': email
                }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Failed to send registration OTP email: {e}")
            return Response({
                'message': 'Account created but failed to send OTP. Please use resend OTP.',
                'email': email
            }, status=status.HTTP_201_CREATED)

        return Response({
            'message': 'Registration initiated. Please verify your email with the OTP sent.',
            'email': email
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
def verify_otp(request):
    data = request.data
    email = data.get('email')
    otp = data.get('otp')

    if not email or not otp:
        return Response({
            'error': 'Email and OTP are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Check against OTPVerification model
        otp_record = OTPVerification.objects.filter(email=email, is_used=False).latest('created_at')
        
        if otp_record.is_expired():
            return Response({'error': 'OTP has expired'}, status=status.HTTP_400_BAD_REQUEST)
            
        if otp_record.otp != otp:
             return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

    except OTPVerification.DoesNotExist:
         return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

    # Find the user and activate
    try:
        user = CustomUser.objects.get(email__iexact=email, is_active=False)
    except CustomUser.DoesNotExist:
        return Response({"message": "User not found or already verified"}, status=status.HTTP_400_BAD_REQUEST)

    user.is_active = True
    user.is_verified = True
    user.save()
    
    # Send Welcome Email
    try:
        send_welcome_email(user.email, user.username)
    except Exception as e:
        print(f"Failed to send welcome email: {e}")

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
    
    return Response({
        "message": "Registration successful!",
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    }, status=status.HTTP_201_CREATED)


# ---------------- LOGIN USER ----------------
@api_view(["POST"])
@permission_classes([AllowAny])
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

    # Check for deleted user (only for email logins mainly, or attempt to resolve)
    from .models import DeletedUser
    check_email = identifier.strip().lower() # Assuming identifier is email for checking, or we check if it looks like email
    if "@" in check_email: 
        if DeletedUser.objects.filter(email=check_email).exists():
            return Response({
                "error": "Account previously deleted",
                "details": "This account was deleted. You can re-register if you wish to create a new account."
            }, status=status.HTTP_403_FORBIDDEN)

    # Find the user by email or username
    User = get_user_model()
    try:
        if "@" in identifier:
            user_obj = User.objects.get(email__iexact=identifier.strip())
        else:
            user_obj = User.objects.get(username__iexact=identifier.strip())
    except User.DoesNotExist:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_400_BAD_REQUEST,
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

    # Account state checks
    if not user.is_active:
        return Response(
            {"error": "Account not active. Please verify your OTP first."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if getattr(user, "is_verified", False) is False:
        return Response(
            {"error": "Account not verified. Please complete OTP verification."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    # Update Streak
    try:
        from .utils import update_streak
        update_streak(user, "login")
    except Exception as e:
        pass  # print(f"Error updating streak: {e}")

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
            "onboarding_complete": hasattr(user, 'profile') and user.profile.onboarding_complete
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def resend_otp(request):
    email = request.data.get("email")

    if not email:
        return Response({"message": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CustomUser.objects.get(email__iexact=email)
    except CustomUser.DoesNotExist:
        return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    # delete old OTPs for this email
    OTPVerification.objects.filter(email__iexact=email).delete()

    # generate new OTP
    otp = str(random.randint(100000, 999999))
    OTPVerification.objects.create(
        email=email, otp=otp, is_used=False, created_at=timezone.now())

    # Send OTP via Brevo
    try:
        email_sent = send_otp_email(email, otp, user.username)
        if not email_sent:
            return Response({"message": "Failed to send OTP email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        print(f"Resend OTP email failed: {e}")
        return Response({"message": "Failed to send OTP email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"message": "New OTP sent successfully"}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def request_password_reset(request):
    email = request.data.get("email")

    if not email:
        return Response({"message": "Email is required"}, status=400)

    try:
        user = CustomUser.objects.get(email__iexact=email)
    except CustomUser.DoesNotExist:
        return Response({"message": "No account found with that email."}, status=404)

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
        print(f"Password reset email failed: {e}")
        return Response({"message": "Failed to send password reset email"}, status=500)

    return Response({"message": "Password reset OTP sent to your email."}, status=200)


# 2️⃣ Verify reset OTP
@api_view(["POST"])
@permission_classes([AllowAny])
def verify_reset_otp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")

    if not email or not otp:
        return Response({"message": "Email and OTP are required."}, status=400)

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
def reset_password(request):
    email = request.data.get("email")
    new_password = request.data.get("new_password")

    if not email or not new_password:
        return Response({"message": "Email and new password required."}, status=400)

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


# ---------------- UPDATE USER PROFILE ----------------
@api_view(['POST', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    Update user profile details (field, role, level, skills, goal).
    """
    user = request.user
    # print(f"DEBUG: update_user_profile called for user: {user.username}")
    # print(f"DEBUG: request.data: {request.data}")
    
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
        # Ensure regex or format validation in frontend, or try/except here if strict
        user.date_of_birth = dob

    user.save()

    # Update UserProfile fields using serializer
    serializer = UserProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        profile.refresh_from_db()  # Refresh to get updated values
        
        # Check if onboarding is complete and set flag (only sets once)
        if not profile.onboarding_complete:
            is_onboarded = all([
                profile.field_of_study,
                profile.target_role,
                profile.experience_level
            ])
            if is_onboarded:
                profile.onboarding_complete = True
                profile.save()
        
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
    
    # print(f"DEBUG: Serializer errors: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
def google_oauth_login(request):
    """
    Handle Google OAuth login. Accepts a Google Access Token from the frontend,
    verifies it via Google's userinfo endpoint, and creates/logs in the user.
    """
    print(f"\n{'='*80}")
    print(f"[GOOGLE_OAUTH] Step 1: Function called")
    print(f"[GOOGLE_OAUTH] Request method: {request.method}")
    print(f"[GOOGLE_OAUTH] Request data keys: {list(request.data.keys())}")
    print(f"[GOOGLE_OAUTH] Request content type: {request.content_type}")
    
    try:
        import requests as http_requests
        print(f"[GOOGLE_OAUTH] Step 2: requests library imported successfully")
    except ImportError as e:
        print(f"[GOOGLE_OAUTH] FATAL: Failed to import requests: {e}")
        return Response({"error": "Server configuration error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    token = request.data.get('token')
    print(f"[GOOGLE_OAUTH] Step 3: Token extraction")
    print(f"[GOOGLE_OAUTH] Token present: {bool(token)}")
    print(f"[GOOGLE_OAUTH] Token length: {len(token) if token else 0}")
    print(f"[GOOGLE_OAUTH] Token preview: {str(token)[:30] if token else 'None'}...")
    
    if not token:
        print(f"[GOOGLE_OAUTH] ERROR: No token provided in request")
        return Response({"error": "Google token is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        print(f"[GOOGLE_OAUTH] Step 4: Calling Google UserInfo API")
        # Verify the Google Access Token via UserInfo Endpoint
        userinfo_response = http_requests.get(
            f'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {token}'},
            timeout=10
        )
        
        print(f"[GOOGLE_OAUTH] Step 5: Google API response received")
        print(f"[GOOGLE_OAUTH] Response status: {userinfo_response.status_code}")
        print(f"[GOOGLE_OAUTH] Response headers: {dict(userinfo_response.headers)}")
        print(f"[GOOGLE_OAUTH] Response body preview: {userinfo_response.text[:500]}")
        
        if userinfo_response.status_code != 200:
            print(f"[GOOGLE_OAUTH] ERROR: Google API returned non-200 status")
            return Response({
                "error": "Invalid Google token",
                "details": f"Google API returned status {userinfo_response.status_code}: {userinfo_response.text}"
            }, status=status.HTTP_400_BAD_REQUEST)
            
        print(f"[GOOGLE_OAUTH] Step 6: Parsing JSON response")
        idinfo = userinfo_response.json()
        print(f"[GOOGLE_OAUTH] UserInfo keys: {list(idinfo.keys())}")
        
        # Extract user info
        email = idinfo.get('email')
        email_verified = idinfo.get('email_verified')
        if isinstance(email_verified, str):
            email_verified = email_verified.lower() == 'true'
        name = idinfo.get('name', '')
        picture = idinfo.get('picture', '')
        
        print(f"[GOOGLE_OAUTH] Step 7: Extracted user info")
        print(f"[GOOGLE_OAUTH] Email: {email}")
        print(f"[GOOGLE_OAUTH] Email verified: {email_verified}")
        print(f"[GOOGLE_OAUTH] Name: {name}")
        print(f"[GOOGLE_OAUTH] Picture: {bool(picture)}")
        
        if not email:
            print(f"[GOOGLE_OAUTH] ERROR: No email in Google response")
            return Response({"error": "No email received from Google", "details": f"Response: {idinfo}"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Normalize email
        email = email.lower().strip()
        logger.error(f"[GOOGLE_OAUTH] Step 8: Email normalized to: {email}")
        
        # REMOVED DeletedUser check to allow re-registration
        
        # Check if user exists
        logger.error(f"[GOOGLE_OAUTH] Step 9: Checking if user exists")
        try:
            user = CustomUser.objects.get(email=email)
            created = False
            print(f"[GOOGLE_OAUTH] User found: {user.username} (ID: {user.id})")
            
            # If user exists but was inactive (e.g. from abandoned registration), activate them
            # because Google has verified this email.
            # because Google has verified this email.
            if not user.is_active or not user.is_verified:
                print(f"[GOOGLE_OAUTH] Activating existing inactive user and clearing legacy password")
                user.is_active = True
                user.is_verified = True
                user.set_unusable_password()  # Clear any old password from previous life
                user.save()
                
        except CustomUser.DoesNotExist:
            # Check if this is a signup or login attempt
            mode = request.data.get('mode', 'login')  # Default to login for backwards compatibility
            
            if mode == 'signup':
                print(f"[GOOGLE_OAUTH] User not found, creating new user (signup mode)")
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
                        is_active=True,
                        is_verified=True,
                    )
                    user.set_unusable_password()
                    
                    # Set name
                    if name:
                        name_parts = name.split(' ', 1)
                        user.first_name = name_parts[0] if name_parts else ''
                        user.last_name = name_parts[1] if len(name_parts) > 1 else ''
                    user.save()
                    
                    print(f"[GOOGLE_OAUTH] User created successfully (ID: {user.id})")
                except Exception as create_err:
                    print(f"[GOOGLE_OAUTH] ERROR creating user: {type(create_err).__name__}: {create_err}")
                    return Response({
                        "error": "Failed to create account",
                        "details": str(create_err)
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                # Login mode - user must already exist
                print(f"[GOOGLE_OAUTH] User not found - signup required (login mode)")
                return Response({
                    "error": "Account not found",
                    "signup_required": True,
                    "message": "No account exists with this email. Please sign up first.",
                    "email": email
                }, status=status.HTTP_404_NOT_FOUND)
        
        
        # --- 2FA ENFORCEMENT START ---
        print(f"[GOOGLE_OAUTH] Step 11: 2FA Enforcement - Generating OTP")
        try:
            # Generate OTP
            otp = str(random.randint(100000, 999999))
            
            # Delete old OTPs
            OTPVerification.objects.filter(email=email).delete()
            
            # Create new OTP
            OTPVerification.objects.create(email=email, otp=otp)
            
            # Send Email
            print(f"[GOOGLE_OAUTH] Sending OTP email to {email}")
            send_otp_email(email, otp, user.username)
            
            response_data = {
                "message": "Please verify OTP sent to your email",
                "two_factor_required": True,
                "email": email
            }
            print(f"[GOOGLE_OAUTH] 2FA required. Returning 200 OK")
            print(f"{'='*80}\n")
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as otp_err:
             print(f"[GOOGLE_OAUTH] ERROR in 2FA step: {otp_err}")
             return Response({"error": "Failed to send 2FA OTP"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # --- 2FA ENFORCEMENT END ---

        # (Original Token Generation Code is effectively replaced/bypassed)
        # To keep code clean, I am removing the old token generation block below.
        print(f"[GOOGLE_OAUTH] SUCCESS: Returning 200 OK")
        print(f"{'='*80}\n")
        return Response(response_data, status=status.HTTP_200_OK)
        
    except ValueError as e:
        print(f"[GOOGLE_OAUTH] ValueError: {e}")
        print(f"{'='*80}\n")
        return Response({"error": "Invalid Google token", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"[GOOGLE_OAUTH] EXCEPTION: {type(e).__name__}: {e}")
        import traceback
        print(f"[GOOGLE_OAUTH] Traceback:")
        traceback.print_exc()
        print(f"{'='*80}\n")
        return Response({"error": "Google authentication failed", "details": f"{type(e).__name__}: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------- GITHUB OAUTH LOGIN ----------------
@api_view(['POST'])
@permission_classes([AllowAny])
def github_oauth_login(request):
    """
    Handle GitHub OAuth login. Accepts an authorization code from the frontend,
    exchanges it for an access token, fetches user info, and creates/logs in the user.
    """
    import requests as http_requests
    
    code = request.data.get('code')
    # Get redirect_uri from request, fallback to settings for backwards compatibility
    redirect_uri = request.data.get('redirect_uri', settings.GITHUB_OAUTH_REDIRECT_URI)
    
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
        
        # Debug logging
        print(f"[GITHUB_OAUTH_DEBUG] Client ID: {settings.GITHUB_OAUTH_CLIENT_ID}")
        print(f"[GITHUB_OAUTH_DEBUG] Redirect URI used: {redirect_uri}")
        print(f"[GITHUB_OAUTH_DEBUG] Token response status: {token_response.status_code}")
        print(f"[GITHUB_OAUTH_DEBUG] Token data: {token_data}")
        
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
        name = github_user.get('name', '') or github_user.get('login', '')
        github_username = github_user.get('login', '')
        
        # REMOVED DeletedUser check to allow re-registration
        
        # Check if user exists
        try:
            user = CustomUser.objects.get(email=email)
            created = False
            
            # If user exists but was inactive (e.g. from abandoned registration), activate them
            # because GitHub has verified this email.
            # because GitHub has verified this email.
            if not user.is_active or not user.is_verified:
                user.is_active = True
                user.is_verified = True
                user.set_unusable_password()  # Clear any old password from previous life
                user.save()
                
        except CustomUser.DoesNotExist:
            # Check if this is a signup or login attempt
            mode = request.data.get('mode', 'login')  # Default to login for backwards compatibility
            
            if mode == 'signup':
                print(f"[GITHUB_OAUTH] User not found, creating new user (signup mode)")
                # Generate a unique username
                base_username = github_username.lower() if github_username else email.split('@')[0].lower()
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
                        is_active=True,
                        is_verified=True,
                    )
                    user.set_unusable_password()
                    
                    # Set name
                    name_parts = name.split(' ', 1) if name else ['', '']
                    user.first_name = name_parts[0] if name_parts else ''
                    user.last_name = name_parts[1] if len(name_parts) > 1 else ''
                    user.save()
                    
                    print(f"[GITHUB_OAUTH] User created successfully (ID: {user.id})")
                except Exception as create_err:
                    print(f"[GITHUB_OAUTH] ERROR creating user: {type(create_err).__name__}: {create_err}")
                    return Response({
                        "error": "Failed to create account",
                        "details": str(create_err)
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                # Login mode - user must already exist
                print(f"[GITHUB_OAUTH] User not found - signup required (login mode)")
                return Response({
                    "error": "Account not found",
                    "signup_required": True,
                    "message": "No account exists with this email. Please sign up first.",
                    "email": email
                }, status=status.HTTP_404_NOT_FOUND)
        
        
        # --- 2FA ENFORCEMENT START ---
        print(f"[GITHUB_OAUTH] 2FA Enforcement - Generating OTP")
        try:
            # Generate OTP
            otp = str(random.randint(100000, 999999))
            
            # Delete old OTPs
            OTPVerification.objects.filter(email=email).delete()
            
            # Create new OTP
            OTPVerification.objects.create(email=email, otp=otp)
            
            # Send Email
            print(f"[GITHUB_OAUTH] Sending OTP email to {email}")
            send_otp_email(email, otp, user.username)
            
            response_data = {
                "message": "Please verify OTP sent to your email",
                "two_factor_required": True,
                "email": email
            }
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as otp_err:
             print(f"[GITHUB_OAUTH] ERROR in 2FA step: {otp_err}")
             return Response({"error": "Failed to send 2FA OTP"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # --- 2FA ENFORCEMENT END ---

        # (Original Token Generation Code is effectively replaced/bypassed)
        
    except Exception as e:
        return Response({"error": "GitHub authentication failed", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
def verify_social_otp(request):
    """
    Verify OTP sent during social login (Google/GitHub).
    If valid, issue JWT tokens.
    """
    email = request.data.get("email")
    otp_in = request.data.get("otp")

    print(f"\n{'='*80}")
    print(f"[SOCIAL_OTP] Step 1: Verification request")
    print(f"[SOCIAL_OTP] Email: {email}")
    print(f"[SOCIAL_OTP] OTP input: {otp_in}")
    
    if not email or not otp_in:
        print(f"[SOCIAL_OTP] ERROR: Missing email or OTP")
        return Response({"message": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

    email = email.lower().strip()
    otp = str(otp_in).strip()

    # Find unused OTPs for this email (case-insensitive)
    otp_qs = OTPVerification.objects.filter(email__iexact=email)
    print(f"[SOCIAL_OTP] OTPs found: {otp_qs.count()}")
    
    if not otp_qs.exists():
        print(f"[SOCIAL_OTP] ERROR: No OTP record found for {email}")
        return Response({"message": "Invalid OTP or email"}, status=status.HTTP_400_BAD_REQUEST)

    # Prefer the latest unused OTP record
    otp_record = otp_qs.filter(is_used=False).order_by('-created_at').first()

    if not otp_record:
        print(f"[SOCIAL_OTP] ERROR: All OTPs used or none available")
        return Response({"message": "Invalid OTP or it has been used"}, status=status.HTTP_400_BAD_REQUEST)

    # Compare values
    print(f"[SOCIAL_OTP] Comparing DB '{str(otp_record.otp).strip()}' vs Input '{otp}'")
    if str(otp_record.otp).strip() != otp:
        print(f"[SOCIAL_OTP] ERROR: Mismatch")
        return Response({"message": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

    # Check expiry
    if hasattr(otp_record, "is_expired") and otp_record.is_expired():
        print(f"[SOCIAL_OTP] ERROR: OTP Expired")
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
        print(f"[SOCIAL_OTP] User found: {user.username}")
    except CustomUser.DoesNotExist:
        print(f"[SOCIAL_OTP] ERROR: User not found in DB")
        return Response({"message": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST)

    # Generate tokens
    try:
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
    except Exception as e:
        print(f"[SOCIAL_OTP] ERROR generating tokens: {e}")
        return Response({"message": "Failed to generate tokens"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Check onboarding status
    onboarding_complete = hasattr(user, 'profile') and user.profile.onboarding_complete

    return Response({
        "message": "Login verification successful",
        "access": access_token,
        "refresh": refresh_token,
        "onboarding_complete": onboarding_complete,
        "user": {
            "id": user.id,
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

