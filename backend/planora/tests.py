from django.test import TestCase
from django.urls import resolve, reverse, NoReverseMatch


class PlanoraUrlsTest(TestCase):
    """Verify all Planora URL patterns resolve correctly."""

    def _assert_resolves(self, url, expected_view_name):
        resolved = resolve(url)
        self.assertEqual(resolved.view_name, expected_view_name,
                         f"{url!r} resolved to {resolved.view_name!r}, expected {expected_view_name!r}")

    def test_subject_list_url_resolves(self):
        self._assert_resolves('/api/planora/subjects/', 'planora-subject-list')

    def test_subject_detail_url_resolves(self):
        self._assert_resolves('/api/planora/subjects/1/', 'planora-subject-detail')

    def test_upload_syllabus_url_resolves(self):
        self._assert_resolves('/api/planora/subjects/1/upload-syllabus/', 'planora-upload-syllabus')

    def test_generate_topics_url_resolves(self):
        self._assert_resolves('/api/planora/subjects/1/generate-topics/', 'planora-generate-topics')

    def test_exam_pattern_url_resolves(self):
        self._assert_resolves('/api/planora/subjects/1/exam-pattern/', 'planora-exam-pattern')

    def test_topic_list_url_resolves(self):
        self._assert_resolves('/api/planora/subjects/1/topics/', 'planora-topic-list')

    def test_topic_detail_url_resolves(self):
        self._assert_resolves('/api/planora/topics/1/', 'planora-topic-detail')

    def test_topic_progress_url_resolves(self):
        self._assert_resolves('/api/planora/topics/1/progress/', 'planora-topic-progress')

    def test_topic_notes_url_resolves(self):
        self._assert_resolves('/api/planora/topics/1/notes/', 'planora-topic-notes')

    def test_topic_study_guide_url_resolves(self):
        self._assert_resolves('/api/planora/topics/1/guide/', 'planora-topic-study-guide')

    def test_study_plan_url_resolves(self):
        self._assert_resolves('/api/planora/subjects/1/plan/', 'planora-study-plan')

    def test_subject_list_reverse(self):
        url = reverse('planora-subject-list')
        self.assertEqual(url, '/api/planora/subjects/')
        self._assert_resolves(url, 'planora-subject-list')

    def test_subject_detail_reverse(self):
        url = reverse('planora-subject-detail', kwargs={'subject_id': 42})
        self.assertEqual(url, '/api/planora/subjects/42/')
        self._assert_resolves(url, 'planora-subject-detail')
