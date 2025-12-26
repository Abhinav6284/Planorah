from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta, datetime
from .models import Task, Note
from .serializers import TaskSerializer, TaskCreateSerializer, NoteSerializer


class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        return TaskSerializer
    
    def get_queryset(self):
        queryset = Task.objects.filter(user=self.request.user)
        
        # Filter by roadmap
        roadmap_id = self.request.query_params.get('roadmap', None)
        if roadmap_id:
            queryset = queryset.filter(roadmap_id=roadmap_id)
        
        # Filter by day
        day = self.request.query_params.get('day', None)
        if day:
            queryset = queryset.filter(day=int(day))
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get tasks for today."""
        today = timezone.now().date()
        tasks = Task.objects.filter(
            user=request.user,
            due_date=today
        )
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get task analytics and progress stats."""
        user_tasks = Task.objects.filter(user=request.user)
        
        total_tasks = user_tasks.count()
        completed_tasks = user_tasks.filter(status='completed').count()
        
        # Today's tasks
        today = timezone.now().date()
        today_tasks = user_tasks.filter(due_date=today)
        today_completed = today_tasks.filter(status='completed').count()
        
        # Weekly progress
        week_ago = today - timedelta(days=7)
        week_tasks = user_tasks.filter(due_date__gte=week_ago, due_date__lte=today)
        week_completed = week_tasks.filter(status='completed').count()
        
        # Streak calculation
        streak = calculate_streak(request.user)
        
        # Total study time
        total_minutes = sum(task.actual_minutes for task in user_tasks)
        
        # Revision needed
        revision_count = user_tasks.filter(status='needs_revision').count()
        
        return Response({
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'completion_rate': (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
            'today': {
                'total': today_tasks.count(),
                'completed': today_completed
            },
            'this_week': {
                'total': week_tasks.count(),
                'completed': week_completed
            },
            'streak': streak,
            'total_study_minutes': total_minutes,
            'revision_needed': revision_count
        })
    
    @action(detail=True, methods=['patch'])
    def complete(self, request, pk=None):
        """Mark task as complete and create revision tasks."""
        task = self.get_object()
        task.mark_complete()
        serializer = self.get_serializer(task)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def reschedule(self, request, pk=None):
        """Reschedule task to a different day."""
        task = self.get_object()
        new_day = request.data.get('day')
        new_date = request.data.get('due_date')
        
        if new_day:
            task.day = new_day
        if new_date:
            task.due_date = datetime.strptime(new_date, '%Y-%m-%d').date()
        
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data)


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Note.objects.filter(user=self.request.user)
        
        # Search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                title__icontains=search
            ) | queryset.filter(
                content__icontains=search
            )
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


def calculate_streak(user):
    """Calculate consecutive days of completed tasks."""
    today = timezone.now().date()
    streak = 0
    current_date = today
    
    while True:
        day_tasks = Task.objects.filter(
            user=user,
            due_date=current_date
        )
        
        if day_tasks.exists():
            completed = day_tasks.filter(status='completed').count()
            if completed > 0:
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break
        else:
            current_date -= timedelta(days=1)
            if (today - current_date).days > 7:  # Stop after 7 days of no tasks
                break
    
    return streak
