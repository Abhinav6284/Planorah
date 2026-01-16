"""
API views for user_lifecycle app.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import RealityIntake, LifecycleEvent, EventType
from .serializers import RealityIntakeSerializer, LifecycleEventSerializer
from .eligibility import evaluate_eligibility, grant_output_eligibility


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def reality_intake_view(request):
    """
    GET: Retrieve user's reality intake
    POST: Submit/update reality intake
    """
    user = request.user
    
    if request.method == 'GET':
        try:
            intake = RealityIntake.objects.get(user=user)
            serializer = RealityIntakeSerializer(intake)
            return Response(serializer.data)
        except RealityIntake.DoesNotExist:
            return Response({'detail': 'No intake found'}, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method == 'POST':
        # Check if intake is already locked
        try:
            intake = RealityIntake.objects.get(user=user)
            if intake.intake_locked:
                return Response(
                    {'error': 'Reality intake is locked. Cannot modify.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except RealityIntake.DoesNotExist:
            intake = None
        
        serializer = RealityIntakeSerializer(data=request.data, instance=intake)
        
        if serializer.is_valid():
            intake = serializer.save(user=user)
            
            # Compute reality gap score
            intake.compute_reality_gap_score()
            intake.save()
            
            # Create event
            LifecycleEvent.objects.create(
                user=user,
                event_type=EventType.INTAKE_SUBMITTED,
                data={
                    'target_role': intake.target_role,
                    'target_timeline_months': intake.target_timeline_months,
                    'reality_gap_score': intake.reality_gap_score,
                }
            )
            
            return Response(
                RealityIntakeSerializer(intake).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def lock_goal_view(request):
    """
    Lock the user's goal - POINT OF NO RETURN.
    User must have submitted reality intake first.
    """
    user = request.user
    
    try:
        intake = RealityIntake.objects.get(user=user)
    except RealityIntake.DoesNotExist:
        return Response(
            {'error': 'You must submit reality intake before locking your goal.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if intake.intake_locked:
        return Response(
            {'error': 'Goal is already locked.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Lock the goal
    intake.lock_goal()
    
    # Update user profile state
    if hasattr(user, 'profile'):
        profile = user.profile
        profile.lifecycle_state = 'GOAL_SELECTED'
        profile.goal_locked_at = timezone.now()
        profile.save()
    
    return Response({
        'message': 'Goal locked successfully. Roadmap generation will begin.',
        'intake': RealityIntakeSerializer(intake).data,
        'lifecycle_state': user.profile.lifecycle_state if hasattr(user, 'profile') else 'ONBOARDING'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def eligibility_status_view(request):
    """
    Check user's eligibility for OUTPUT_ELIGIBLE state.
    Returns current status and what's needed.
    """
    user = request.user
    
    # Get current lifecycle state
    lifecycle_state = 'ONBOARDING'
    if hasattr(user, 'profile'):
        lifecycle_state = user.profile.lifecycle_state
    
    # Evaluate eligibility
    eligibility = evaluate_eligibility(user)
    
    return Response({
        'current_state': lifecycle_state,
        'eligible': eligibility['eligible'],
        'completion_score': eligibility['score'],
        'details': eligibility['details'],
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def grant_eligibility_view(request):
    """
    Manually grant OUTPUT_ELIGIBLE status if eligible.
    Typically called automatically, but can be triggered manually.
    """
    user = request.user
    
    eligibility = evaluate_eligibility(user)
    
    if not eligibility['eligible']:
        return Response({
            'error': 'User is not eligible for OUTPUT_ELIGIBLE status.',
            'details': eligibility['details']
        }, status=status.HTTP_400_BAD_REQUEST)
    
    success = grant_output_eligibility(user)
    
    if success:
        return Response({
            'message': 'OUTPUT_ELIGIBLE status granted',
            'lifecycle_state': user.profile.lifecycle_state
        })
    else:
        return Response({
            'error': 'Failed to grant eligibility'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lifecycle_events_view(request):
    """
    Get user's lifecycle events history.
    """
    user = request.user
    events = LifecycleEvent.objects.filter(user=user).order_by('-timestamp')[:50]
    
    serializer = LifecycleEventSerializer(events, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_goal_view(request):
    """
    Reset user's goal and return to ONBOARDING state.
    Archives current roadmap and logs reset event.
    """
    user = request.user
    
    if not hasattr(user, 'profile'):
        return Response({'error': 'No profile found'}, status=status.HTTP_400_BAD_REQUEST)
    
    profile = user.profile
    
    if profile.lifecycle_state == 'ONBOARDING':
        return Response({'error': 'No goal to reset'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Log reset event
    LifecycleEvent.objects.create(
        user=user,
        event_type=EventType.GOAL_RESET,
        data={
            'previous_state': profile.lifecycle_state,
            'goal_locked_at': profile.goal_locked_at.isoformat() if profile.goal_locked_at else None,
        }
    )
    
    # Reset state
    profile.lifecycle_state = 'ONBOARDING'
    profile.goal_locked_at = None
    profile.consistency_score = 0.0
    profile.save()
    
    # Unlock reality intake if exists
    try:
        intake = RealityIntake.objects.get(user=user)
        intake.intake_locked = False
        intake.locked_at = None
        intake.save()
    except RealityIntake.DoesNotExist:
        pass
    
    # Note: Roadmap archiving logic would go here if implemented
    # For now, we just change the state
    
    return Response({
        'message': 'Goal reset successfully. You can start over.',
        'lifecycle_state': profile.lifecycle_state
    })
