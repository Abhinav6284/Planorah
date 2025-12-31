
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

    if not email or not otp_in:
        return Response({"error": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

    email = email.lower().strip()
    otp = str(otp_in).strip()

    # Find unused OTPs for this email (case-insensitive)
    otp_qs = OTPVerification.objects.filter(email__iexact=email)
    if not otp_qs.exists():
        return Response({"error": "Invalid OTP or email"}, status=status.HTTP_400_BAD_REQUEST)

    # Prefer the latest unused OTP record
    otp_record = otp_qs.filter(is_used=False).order_by('-created_at').first()

    if not otp_record:
        return Response({"error": "Invalid OTP or it has been used"}, status=status.HTTP_400_BAD_REQUEST)

    # Compare values
    if str(otp_record.otp).strip() != otp:
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

    # Check expiry
    if hasattr(otp_record, "is_expired") and otp_record.is_expired():
        otp_record.delete()
        return Response({"error": "OTP expired, please request a new one"}, status=status.HTTP_400_BAD_REQUEST)

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
        return Response({"error": "User does not exist (this should not happen during login flow)"}, status=status.HTTP_400_BAD_REQUEST)

    # Generate tokens
    try:
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
    except Exception as e:
        return Response({"error": "Failed to generate tokens"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
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
