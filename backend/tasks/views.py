from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta, datetime
import os
from .models import Task, Note
from .serializers import NoteSerializer


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
