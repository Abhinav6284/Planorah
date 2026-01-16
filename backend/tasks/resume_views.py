"""
Resume API Views
Generate and retrieve compiled resumes.
"""
from rest_framework import views, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from roadmap_ai.models import Roadmap
from .resume_models import ResumeVersion, ResumeEntry, ResumeSectionTemplate
from .resume_compiler import ResumeCompiler, get_latest_resume, verify_resume_entry_proof
from rest_framework import serializers


class ResumeEntrySerializer(serializers.ModelSerializer):
    """Serializer for resume entries with traceability."""

    source_task_title = serializers.CharField(
        source='source_task.title', read_only=True)
    source_attempt_id = serializers.CharField(
        source='source_attempt.attempt_id', read_only=True)

    class Meta:
        model = ResumeEntry
        fields = [
            'entry_id', 'entry_type', 'title', 'description',
            'proof_url', 'weight', 'score', 'order', 'tags',
            'source_task_title', 'source_attempt_id'
        ]


class ResumeVersionSerializer(serializers.ModelSerializer):
    """Serializer for resume versions."""

    entries = ResumeEntrySerializer(many=True, read_only=True)

    class Meta:
        model = ResumeVersion
        fields = [
            'version_id', 'version_number', 'generated_at',
            'was_eligible', 'eligibility_snapshot',
            'compiled_content', 'total_tasks_completed',
            'core_tasks_completed', 'average_score',
            'is_latest', 'entries'
        ]


class ResumeGenerateView(views.APIView):
    """
    Generate new resume version from PASS attempts.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        POST /resume/generate/

        Body: {
            "roadmap_id": "uuid",
            "template_id": "uuid" (optional)
        }

        Returns new resume version.
        """
        roadmap_id = request.data.get('roadmap_id')
        template_id = request.data.get('template_id')

        if not roadmap_id:
            return Response(
                {'error': 'roadmap_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        roadmap = get_object_or_404(Roadmap, id=roadmap_id, user=request.user)

        # Compile resume
        compiler = ResumeCompiler(request.user, roadmap)

        try:
            resume = compiler.compile(template_id=template_id)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ResumeVersionSerializer(resume)

        return Response({
            'message': 'Resume generated successfully',
            'resume': serializer.data,
            'version': resume.version_number
        }, status=status.HTTP_201_CREATED)


class ResumeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only access to resume versions.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ResumeVersionSerializer

    def get_queryset(self):
        """Get user's resume versions."""
        return ResumeVersion.objects.filter(
            user=self.request.user
        ).prefetch_related('entries')

    @action(detail=False, methods=['get'])
    def latest(self, request):
        """
        GET /resume/latest/?roadmap_id=uuid

        Get latest resume for roadmap.
        """
        roadmap_id = request.query_params.get('roadmap_id')

        if not roadmap_id:
            return Response(
                {'error': 'roadmap_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        roadmap = get_object_or_404(Roadmap, id=roadmap_id, user=request.user)

        resume = get_latest_resume(request.user, roadmap)

        if not resume:
            return Response(
                {'error': 'No resume generated yet'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ResumeVersionSerializer(resume)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def verify(self, request, pk=None):
        """
        GET /resume/{version_id}/verify/

        Verify all entries still have valid proof.
        """
        resume = self.get_object()

        if resume.user != request.user:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Verify each entry
        verification_results = []
        invalid_count = 0

        for entry in resume.entries.all():
            result = verify_resume_entry_proof(entry)

            verification_results.append({
                'entry_id': str(entry.entry_id),
                'title': entry.title,
                'verification': result
            })

            if not result.get('valid', False):
                invalid_count += 1

        return Response({
            'resume_version': resume.version_number,
            'total_entries': len(verification_results),
            'valid_entries': len(verification_results) - invalid_count,
            'invalid_entries': invalid_count,
            'all_valid': invalid_count == 0,
            'entries': verification_results
        })

    @action(detail=True, methods=['get'])
    def export(self, request, pk=None):
        """
        GET /resume/{version_id}/export/?format=json|markdown

        Export resume in various formats.
        """
        resume = self.get_object()

        if resume.user != request.user:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        export_format = request.query_params.get('format', 'json')

        if export_format == 'json':
            return Response(resume.compiled_content)

        elif export_format == 'markdown':
            markdown = self._export_markdown(resume)
            return Response(
                {'markdown': markdown},
                content_type='text/plain'
            )

        else:
            return Response(
                {'error': f'Unsupported format: {export_format}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    def _export_markdown(self, resume: ResumeVersion) -> str:
        """Export resume as markdown."""
        md = []

        # Header
        content = resume.compiled_content
        header = content.get('header', {})

        md.append(f"# {header.get('name', 'Resume')}")
        md.append(f"**{header.get('roadmap', '')}**\n")
        md.append(f"*Generated: {header.get('generated_at', '')}*\n")
        md.append(f"**Version:** {resume.version_number}\n")
        md.append(
            f"**Tasks Completed:** {resume.total_tasks_completed} ({resume.core_tasks_completed} core)\n")
        md.append(f"**Average Score:** {resume.average_score:.1f}%\n")
        md.append("---\n")

        # Sections
        for section in content.get('sections', []):
            md.append(f"## {section['name']}\n")

            for entry in section['entries']:
                md.append(f"### {entry['title']}")
                md.append(f"{entry['description']}\n")

                if entry.get('proof_url'):
                    md.append(f"**Proof:** {entry['proof_url']}")

                md.append(
                    f"**Score:** {entry['score']:.1f}% | **Weight:** {entry['weight']}/5")

                if entry.get('tags'):
                    tags = ', '.join(entry['tags'])
                    md.append(f"*Tags: {tags}*")

                md.append("\n")

        return '\n'.join(md)
