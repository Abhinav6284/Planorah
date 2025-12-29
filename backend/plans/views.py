from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Plan
from .serializers import PlanSerializer, PlanComparisonSerializer


class PlanViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Plan model.
    Plans are read-only - created via management command.
    """
    queryset = Plan.objects.filter(is_active=True)
    serializer_class = PlanSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'])
    def compare(self, request):
        """Get plans formatted for comparison view."""
        plans = self.get_queryset()
        serializer = PlanComparisonSerializer(plans, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def initialize(self, request):
        """Initialize default plans (admin only)."""
        if not request.user.is_staff:
            return Response(
                {"error": "Admin access required"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        Plan.create_default_plans()
        return Response({"message": "Plans initialized successfully"})
