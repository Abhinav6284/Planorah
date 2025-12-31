from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta, datetime
import os
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
    
    @action(detail=True, methods=['get'])
    def guidance(self, request, pk=None):
        """
        Get AI-generated step-by-step guidance for a task.
        Uses Gemini API to generate detailed, actionable instructions.
        """
        task = self.get_object()
        
        # Get milestone and roadmap context
        milestone_title = task.milestone.title if task.milestone else "General"
        roadmap_title = task.roadmap.goal if task.roadmap else "Learning"
        
        # Generate AI guidance
        guidance = generate_task_guidance(
            task_title=task.title,
            task_description=task.description,
            estimated_minutes=task.estimated_minutes,
            milestone=milestone_title,
            roadmap=roadmap_title,
            tags=task.tags
        )
        
        return Response(guidance)


def generate_task_guidance(task_title, task_description, estimated_minutes, milestone, roadmap, tags):
    """
    Generate AI-powered step-by-step guidance for a task.
    
    Returns detailed instructions including:
    - Objective
    - Step-by-step execution guide
    - Best practices
    - Common mistakes to avoid
    - Expected outcome
    """
    try:
        import google.generativeai as genai
        from google.generativeai.types import GenerationConfig
    except ImportError:
        # Return fallback guidance if Gemini is not available
        return get_fallback_guidance(task_title, task_description, estimated_minutes)
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return get_fallback_guidance(task_title, task_description, estimated_minutes)
    
    genai.configure(api_key=api_key)
    
    # Build prompt for task guidance
    prompt = f"""You are a friendly, encouraging mentor helping a student complete a learning task.

**Task Information:**
- Title: {task_title}
- Description: {task_description}
- Time Available: {estimated_minutes} minutes
- Part of Milestone: {milestone}
- Learning Goal: {roadmap}
- Tags: {', '.join(tags) if tags else 'general'}

**Your Response Must Include:**

1. **🎯 Objective** (2-3 sentences)
   Clear statement of what the student will achieve today.

2. **⏱️ Time Breakdown** 
   How to spend the {estimated_minutes} minutes effectively.

3. **📝 Step-by-Step Guide** (5-8 steps)
   Clear, actionable steps. Each step should be:
   - Specific and concrete
   - Include what to do, not just what to learn
   - Beginner-friendly language

4. **✅ Best Practices** (3-4 bullets)
   Pro tips that will help them do this well.

5. **⚠️ Common Mistakes** (2-3 bullets)
   What beginners often get wrong and how to avoid it.

6. **🏁 Expected Outcome**
   What success looks like after completing this task.

7. **💡 Quick Tips** (optional)
   Any shortcuts or tools that could help.

**Tone Guidelines:**
- Be encouraging and supportive
- Use simple language
- Be practical, not theoretical
- Focus on "doing" not just "understanding"

**Response Format:** Return as JSON with these exact keys:
{{
    "objective": "string",
    "time_breakdown": [
        {{"duration": "10 min", "activity": "description"}}
    ],
    "steps": [
        {{"step": 1, "title": "Step title", "description": "What to do"}}
    ],
    "best_practices": ["tip 1", "tip 2"],
    "common_mistakes": ["mistake 1", "mistake 2"],
    "expected_outcome": "string",
    "quick_tips": ["tip 1"]
}}
"""
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash-lite')
        
        generation_config = GenerationConfig(
            temperature=0.7,
            top_p=0.95,
            max_output_tokens=2048
        )
        
        response = model.generate_content(prompt, generation_config=generation_config)
        
        if not response or not hasattr(response, "text") or not response.text:
            return get_fallback_guidance(task_title, task_description, estimated_minutes)
        
        # Parse JSON response
        import json
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
        
        guidance_data = json.loads(response_text.strip())
        guidance_data['generated'] = True
        guidance_data['task_title'] = task_title
        
        return guidance_data
        
    except Exception as e:
        print(f"AI guidance generation error: {str(e)}")
        return get_fallback_guidance(task_title, task_description, estimated_minutes)


def get_fallback_guidance(task_title, task_description, estimated_minutes):
    """
    Generate fallback guidance when AI is not available.
    """
    return {
        'generated': False,
        'task_title': task_title,
        'objective': f"Complete the task: {task_title}",
        'time_breakdown': [
            {'duration': f'{estimated_minutes // 4} min', 'activity': 'Review and understand the task'},
            {'duration': f'{estimated_minutes // 2} min', 'activity': 'Work on the main activity'},
            {'duration': f'{estimated_minutes // 4} min', 'activity': 'Review and document your work'}
        ],
        'steps': [
            {'step': 1, 'title': 'Understand the Task', 'description': 'Read through the task description carefully.'},
            {'step': 2, 'title': 'Gather Resources', 'description': 'Find any materials or tools you need.'},
            {'step': 3, 'title': 'Start Working', 'description': task_description or 'Begin the main activity.'},
            {'step': 4, 'title': 'Review Your Work', 'description': 'Check what you have accomplished.'},
            {'step': 5, 'title': 'Document Progress', 'description': 'Note any learnings or questions.'}
        ],
        'best_practices': [
            'Focus on understanding over rushing',
            'Take short breaks if needed',
            'Ask questions when stuck'
        ],
        'common_mistakes': [
            'Skipping the planning phase',
            'Not taking notes'
        ],
        'expected_outcome': f'By the end of this {estimated_minutes}-minute session, you should have made meaningful progress on this task.',
        'quick_tips': ['Set a timer to stay focused', 'Keep reference materials handy']
    }


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
