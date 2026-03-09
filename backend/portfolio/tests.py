from rest_framework import status
from rest_framework.test import APITestCase

from roadmap_ai.models import StudentProject
from users.models import CustomUser

from .models import Portfolio, PortfolioProject, PortfolioAnalytics, PortfolioEvent


class PortfolioAPITests(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="testpass123",
        )
        self.client.force_authenticate(user=self.user)

    def _create_portfolio(self, **kwargs):
        defaults = {
            "user": self.user,
            "slug": "testuser-abcd1234",
            "status": "active",
            "is_published": True,
            "title": "My Portfolio",
            "display_name": "Test User",
            "headline": "Full Stack Developer",
            "bio": "I build things.",
            "github_url": "https://github.com/testuser",
            "primary_cta_label": "Hire Me",
            "primary_cta_url": "https://example.com/contact",
            "skills": ["Python", "Django"],
        }
        defaults.update(kwargs)
        return Portfolio.objects.create(**defaults)

    def _attach_student_project(self, portfolio):
        student_project = StudentProject.objects.create(
            user=self.user,
            title="Project 1",
            description="Project Description",
            tech_stack=["React", "Django"],
            source_type="manual",
            visibility="public",
        )
        return PortfolioProject.objects.create(
            portfolio=portfolio,
            project_type="student",
            student_project=student_project,
            is_visible=True,
        )

    def test_my_portfolio_uses_local_origin_for_public_url(self):
        response = self.client.get(
            "/api/portfolio/my_portfolio/",
            HTTP_ORIGIN="http://localhost:3000",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("public_url", response.data)
        self.assertTrue(response.data["public_url"].startswith("http://localhost:3000/p/"))

    def test_update_settings_rejects_invalid_github_url(self):
        self._create_portfolio()
        response = self.client.patch(
            "/api/portfolio/update_settings/",
            {"github_url": "https://gitlab.com/testuser"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("github_url", response.data)

    def test_publish_requires_completeness(self):
        portfolio = self._create_portfolio(
            title="",
            display_name="",
            headline="",
            bio="",
            github_url="",
            primary_cta_url="",
            skills=[],
        )

        response = self.client.post("/api/portfolio/publish/", {"is_published": True}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("completeness", response.data)
        self.assertFalse(response.data["completeness"]["is_publish_ready"])

        self._attach_student_project(portfolio)
        self.client.patch(
            "/api/portfolio/update_settings/",
            {
                "title": "My Portfolio",
                "display_name": "Test User",
                "headline": "Developer",
                "bio": "About me",
                "github_url": "https://github.com/testuser",
                "primary_cta_label": "Hire Me",
                "primary_cta_url": "https://example.com/contact",
                "skills": ["Python"],
            },
            format="json",
        )
        response = self.client.post("/api/portfolio/publish/", {"is_published": True}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["portfolio"]["is_published"])

    def test_public_endpoint_requires_published_flag(self):
        portfolio = self._create_portfolio(is_published=False)
        self.client.logout()
        response = self.client.get(f"/api/portfolio/public/{portfolio.slug}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_read_only_public_payload_is_restricted(self):
        portfolio = self._create_portfolio(
            status="read_only",
            resume_url="https://example.com/resume.pdf",
            primary_cta_url="https://example.com/contact",
        )
        self._attach_student_project(portfolio)

        self.client.logout()
        response = self.client.get(f"/api/portfolio/public/{portfolio.slug}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data["resume_url"])
        self.assertIsNone(response.data["primary_cta_url"])
        self.assertTrue(len(response.data["projects"]) > 0)
        self.assertEqual(sorted(response.data["projects"][0].keys()), ["id", "project_type", "title"])

    def test_track_event_records_click_and_aggregates(self):
        portfolio = self._create_portfolio(status="active")

        self.client.logout()
        response = self.client.post(
            "/api/portfolio/track_event/",
            {
                "slug": portfolio.slug,
                "event_type": "project_click",
                "project_id": 10,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(PortfolioEvent.objects.filter(portfolio=portfolio).count(), 1)

        analytics = PortfolioAnalytics.objects.filter(portfolio=portfolio).first()
        self.assertIsNotNone(analytics)
        self.assertEqual(analytics.project_clicks, 1)
