"""
planora/views.py
REST API views for the Planora AI-powered study platform.
Business logic delegated to planora.services (thin views pattern).
"""
import logging
from datetime import date

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Subject, ExamPattern, Topic, GeneratedNotes, StudyGuide, StudyPlan
from .serializers import (
    SubjectSerializer,
    SubjectDetailSerializer,
    ExamPatternSerializer,
    TopicSerializer,
    GeneratedNotesSerializer,
    StudyGuideSerializer,
    StudyPlanSerializer,
)
from . import services

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Subjects
# ---------------------------------------------------------------------------

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def subject_list(request):
    """List all subjects or create a new one."""
    if request.method == 'GET':
        subjects = Subject.objects.filter(user=request.user)
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)

    serializer = SubjectSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def subject_detail(request, subject_id):
    """Retrieve, update, or delete a subject."""
    try:
        subject = Subject.objects.get(pk=subject_id, user=request.user)
    except Subject.DoesNotExist:
        return Response({'error': 'Subject not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = SubjectDetailSerializer(subject)
        return Response(serializer.data)

    if request.method == 'DELETE':
        subject.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PUT / PATCH
    partial = request.method == 'PATCH'
    serializer = SubjectSerializer(subject, data=request.data, partial=partial)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Syllabus Upload → Topic Generation
# ---------------------------------------------------------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def upload_syllabus(request, subject_id):
    """
    Accept syllabus as text body or an uploaded file (PDF/image).
    Saves extracted text to subject.syllabus_text.
    """
    try:
        subject = Subject.objects.get(pk=subject_id, user=request.user)
    except Subject.DoesNotExist:
        return Response({'error': 'Subject not found.'}, status=status.HTTP_404_NOT_FOUND)

    syllabus_text = request.data.get('syllabus_text', '')

    # Handle file upload — try PDF extraction first, fall back to plain text
    if not syllabus_text and 'file' in request.FILES:
        uploaded_file = request.FILES['file']
        file_name = uploaded_file.name.lower()
        file_bytes = uploaded_file.read()

        if file_name.endswith('.pdf'):
            try:
                import PyPDF2  # lazy import — optional PDF dependency
                import io
                reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
                syllabus_text = '\n'.join(
                    page.extract_text() or '' for page in reader.pages
                )
            except Exception as exc:
                logger.warning('PDF extraction failed: %s', exc)
                syllabus_text = file_bytes.decode('utf-8', errors='replace')
        else:
            # Treat as plain text
            syllabus_text = file_bytes.decode('utf-8', errors='replace')

    if not syllabus_text or not syllabus_text.strip():
        return Response({'error': 'No syllabus content provided.'}, status=status.HTTP_400_BAD_REQUEST)

    subject.syllabus_text = syllabus_text.strip()
    subject.save(update_fields=['syllabus_text', 'updated_at'])
    return Response({'message': 'Syllabus saved successfully.', 'chars': len(subject.syllabus_text)})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_topics(request, subject_id):
    """
    Use AI to generate a structured topic list from the saved syllabus text.
    Existing topics are replaced (or extended if append=true).
    """
    try:
        subject = Subject.objects.get(pk=subject_id, user=request.user)
    except Subject.DoesNotExist:
        return Response({'error': 'Subject not found.'}, status=status.HTTP_404_NOT_FOUND)

    if not subject.syllabus_text:
        return Response({'error': 'Upload a syllabus first.'}, status=status.HTTP_400_BAD_REQUEST)

    exam_pattern_data = None
    if hasattr(subject, 'exam_pattern'):
        exam_pattern_data = {'marks_distribution': subject.exam_pattern.marks_distribution}

    try:
        raw_topics = services.generate_topics_from_syllabus(subject.syllabus_text, exam_pattern_data)
    except EnvironmentError as exc:
        return Response({'error': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as exc:
        logger.exception('Topic generation failed: %s', exc)
        return Response({'error': 'AI topic generation failed. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    append = str(request.data.get('append', 'false')).lower() == 'true'
    if not append:
        subject.topics.all().delete()

    created_topics = []
    for idx, raw in enumerate(raw_topics):
        topic = Topic.objects.create(
            subject=subject,
            name=raw.get('name', f'Topic {idx + 1}'),
            description=raw.get('description', ''),
            importance=raw.get('importance', 'medium'),
            depth=raw.get('depth', 'medium'),
            order=idx,
            subtopics=raw.get('subtopics', []),
            expected_questions=raw.get('expected_questions', []),
        )
        created_topics.append(topic)

    serializer = TopicSerializer(created_topics, many=True)
    return Response({'topics': serializer.data}, status=status.HTTP_201_CREATED)


# ---------------------------------------------------------------------------
# Exam Pattern
# ---------------------------------------------------------------------------

@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def exam_pattern(request, subject_id):
    """Get or set/update the exam pattern for a subject."""
    try:
        subject = Subject.objects.get(pk=subject_id, user=request.user)
    except Subject.DoesNotExist:
        return Response({'error': 'Subject not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        try:
            pattern = subject.exam_pattern
            serializer = ExamPatternSerializer(pattern)
            return Response(serializer.data)
        except ExamPattern.DoesNotExist:
            return Response({'error': 'No exam pattern set.'}, status=status.HTTP_404_NOT_FOUND)

    # POST / PUT — upsert
    try:
        pattern = subject.exam_pattern
    except ExamPattern.DoesNotExist:
        pattern = None

    serializer = ExamPatternSerializer(pattern, data=request.data, partial=False)
    if serializer.is_valid():
        serializer.save(subject=subject)
        return Response(serializer.data, status=status.HTTP_200_OK if pattern else status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Topics
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def topic_list(request, subject_id):
    """List all topics for a subject."""
    try:
        subject = Subject.objects.get(pk=subject_id, user=request.user)
    except Subject.DoesNotExist:
        return Response({'error': 'Subject not found.'}, status=status.HTTP_404_NOT_FOUND)

    topics = subject.topics.all()
    serializer = TopicSerializer(topics, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def topic_detail(request, topic_id):
    """Retrieve or update a single topic."""
    try:
        topic = Topic.objects.get(pk=topic_id, subject__user=request.user)
    except Topic.DoesNotExist:
        return Response({'error': 'Topic not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = TopicSerializer(topic)
        return Response(serializer.data)

    partial = request.method == 'PATCH'
    serializer = TopicSerializer(topic, data=request.data, partial=partial)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def topic_progress(request, topic_id):
    """Update topic status and confidence score."""
    try:
        topic = Topic.objects.get(pk=topic_id, subject__user=request.user)
    except Topic.DoesNotExist:
        return Response({'error': 'Topic not found.'}, status=status.HTTP_404_NOT_FOUND)

    topic_status = request.data.get('status')
    confidence = request.data.get('confidence')

    if topic_status and topic_status in dict(Topic.STATUS_CHOICES):
        topic.status = topic_status
    if confidence is not None:
        try:
            topic.confidence = max(0, min(100, int(confidence)))
        except (ValueError, TypeError):
            return Response({'error': 'confidence must be an integer 0–100.'}, status=status.HTTP_400_BAD_REQUEST)

    topic.save(update_fields=['status', 'confidence', 'updated_at'])
    serializer = TopicSerializer(topic)
    return Response(serializer.data)


# ---------------------------------------------------------------------------
# Notes
# ---------------------------------------------------------------------------

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def topic_notes(request, topic_id):
    """Get or generate notes for a topic."""
    try:
        topic = Topic.objects.get(pk=topic_id, subject__user=request.user)
    except Topic.DoesNotExist:
        return Response({'error': 'Topic not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        try:
            notes = topic.notes
            serializer = GeneratedNotesSerializer(notes)
            return Response(serializer.data)
        except GeneratedNotes.DoesNotExist:
            return Response({'error': 'Notes not generated yet.'}, status=status.HTTP_404_NOT_FOUND)

    # POST — generate notes using AI
    try:
        content = services.generate_notes_for_topic(
            topic_name=topic.name,
            subject_name=topic.subject.name,
            importance=topic.importance,
            depth=topic.depth,
        )
    except EnvironmentError as exc:
        return Response({'error': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as exc:
        logger.exception('Notes generation failed: %s', exc)
        return Response({'error': 'AI notes generation failed. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    notes, _ = GeneratedNotes.objects.update_or_create(
        topic=topic,
        defaults={'content': content, 'raw_text': str(content)},
    )
    serializer = GeneratedNotesSerializer(notes)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# ---------------------------------------------------------------------------
# Study Guide
# ---------------------------------------------------------------------------

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def topic_study_guide(request, topic_id):
    """Get or generate study guide for a topic."""
    try:
        topic = Topic.objects.get(pk=topic_id, subject__user=request.user)
    except Topic.DoesNotExist:
        return Response({'error': 'Topic not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        try:
            guide = topic.study_guide
            serializer = StudyGuideSerializer(guide)
            return Response(serializer.data)
        except StudyGuide.DoesNotExist:
            return Response({'error': 'Study guide not generated yet.'}, status=status.HTTP_404_NOT_FOUND)

    # POST — generate study guide using AI
    try:
        content = services.generate_study_guide_for_topic(
            topic_name=topic.name,
            subject_name=topic.subject.name,
            importance=topic.importance,
        )
    except EnvironmentError as exc:
        return Response({'error': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as exc:
        logger.exception('Study guide generation failed: %s', exc)
        return Response({'error': 'AI study guide generation failed. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    guide, _ = StudyGuide.objects.update_or_create(
        topic=topic,
        defaults={'content': content, 'raw_text': str(content)},
    )
    serializer = StudyGuideSerializer(guide)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# ---------------------------------------------------------------------------
# Study Planner
# ---------------------------------------------------------------------------

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def study_plan(request, subject_id):
    """Get latest or generate a new study plan for a subject."""
    try:
        subject = Subject.objects.get(pk=subject_id, user=request.user)
    except Subject.DoesNotExist:
        return Response({'error': 'Subject not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        latest_plan = subject.study_plans.first()
        if not latest_plan:
            return Response({'error': 'No study plan generated yet.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = StudyPlanSerializer(latest_plan)
        return Response(serializer.data)

    # POST — generate a new study plan
    exam_date_str = request.data.get('exam_date') or (subject.exam_date.isoformat() if subject.exam_date else None)
    if not exam_date_str:
        return Response({'error': 'exam_date is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        exam_date_obj = date.fromisoformat(exam_date_str)
    except ValueError:
        return Response({'error': 'Invalid exam_date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

    daily_hours = float(request.data.get('daily_hours', 2.0))
    topics = list(subject.topics.values('name', 'status', 'importance'))

    if not topics:
        return Response({'error': 'Add topics before generating a study plan.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        plan_data = services.generate_study_plan(
            subject_name=subject.name,
            topics=topics,
            exam_date=exam_date_obj,
            daily_hours=daily_hours,
        )
    except EnvironmentError as exc:
        return Response({'error': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as exc:
        logger.exception('Study plan generation failed: %s', exc)
        return Response({'error': 'AI study plan generation failed. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    plan = StudyPlan.objects.create(
        subject=subject,
        exam_date=exam_date_obj,
        daily_hours=daily_hours,
        plan_data=plan_data,
    )
    # Update subject exam_date if not already set
    if not subject.exam_date:
        subject.exam_date = exam_date_obj
        subject.save(update_fields=['exam_date', 'updated_at'])

    serializer = StudyPlanSerializer(plan)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
