from urllib.parse import urlparse

from rest_framework import serializers

from .models import Portfolio, PortfolioProject, PortfolioAnalytics
from .services import generate_public_url


ALLOWED_EVENT_TYPES = {'page_view', 'cta_click', 'project_click', 'resume_click'}


class URLValidationMixin:
    """Common URL normalization and host-level safety checks."""

    allowed_schemes = {"http", "https"}

    def normalize_url(self, value: str) -> str:
        if not value:
            return value
        url = value.strip()
        parsed = urlparse(url)
        if parsed.scheme not in self.allowed_schemes:
            raise serializers.ValidationError("Only http/https URLs are allowed.")
        if not parsed.netloc:
            raise serializers.ValidationError("Invalid URL.")
        return url


class PortfolioProjectSerializer(serializers.ModelSerializer):
    """Serializer for portfolio projects."""

    project_title = serializers.SerializerMethodField()
    project_description = serializers.SerializerMethodField()
    tech_stack = serializers.SerializerMethodField()
    github_url = serializers.SerializerMethodField()
    demo_url = serializers.SerializerMethodField()
    display_title = serializers.ReadOnlyField()
    display_description = serializers.ReadOnlyField()

    class Meta:
        model = PortfolioProject
        fields = [
            'id',
            'project_type',
            'project',
            'student_project',
            'project_title',
            'project_description',
            'tech_stack',
            'github_url',
            'demo_url',
            'order',
            'is_featured',
            'is_visible',
            'custom_title',
            'custom_description',
            'display_title',
            'display_description',
            'role',
            'duration_text',
            'impact_metrics',
            'project_url',
            'image_url',
        ]
        read_only_fields = ['id']

    def get_project_title(self, obj):
        return obj.get_project_title()

    def get_project_description(self, obj):
        return obj.get_project_description()

    def get_tech_stack(self, obj):
        return obj.get_tech_stack()

    def get_github_url(self, obj):
        return obj.get_github_url()

    def get_demo_url(self, obj):
        return obj.get_demo_url()


class PortfolioSerializer(serializers.ModelSerializer):
    """Serializer for Portfolio model."""

    portfolio_projects = PortfolioProjectSerializer(many=True, read_only=True)
    public_url = serializers.SerializerMethodField()
    is_publicly_viewable = serializers.ReadOnlyField()
    is_fully_accessible = serializers.ReadOnlyField()
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Portfolio
        fields = [
            'id',
            'slug',
            'custom_subdomain',
            'status',
            'title',
            'display_name',
            'location',
            'availability_status',
            'bio',
            'headline',
            'skills',
            'github_url',
            'linkedin_url',
            'twitter_url',
            'website_url',
            'resume_url',
            'primary_cta_label',
            'primary_cta_url',
            'seo_title',
            'seo_description',
            'og_image_url',
            'show_email',
            'theme',
            'settings_json',
            'is_published',
            'published_at',
            'public_url',
            'is_publicly_viewable',
            'is_fully_accessible',
            'username',
            'portfolio_projects',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'slug',
            'status',
            'created_at',
            'updated_at',
            'published_at',
        ]

    def get_public_url(self, obj):
        request = self.context.get('request')
        return generate_public_url(obj, request=request)


class PortfolioUpdateSerializer(serializers.ModelSerializer, URLValidationMixin):
    """Serializer for updating portfolio."""

    class Meta:
        model = Portfolio
        fields = [
            'title',
            'display_name',
            'location',
            'availability_status',
            'bio',
            'headline',
            'skills',
            'github_url',
            'linkedin_url',
            'twitter_url',
            'website_url',
            'resume_url',
            'primary_cta_label',
            'primary_cta_url',
            'seo_title',
            'seo_description',
            'og_image_url',
            'show_email',
            'theme',
            'settings_json',
        ]

    def validate_skills(self, value):
        if value in (None, ''):
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError("Skills must be a list of strings.")
        cleaned = []
        for item in value[:30]:
            if not isinstance(item, str):
                continue
            normalized = item.strip()
            if normalized:
                cleaned.append(normalized[:40])
        return cleaned

    def _validate_length(self, value, field_name, max_len):
        if value and len(value.strip()) > max_len:
            raise serializers.ValidationError(
                f"{field_name} cannot be longer than {max_len} characters."
            )
        return value.strip() if isinstance(value, str) else value

    def validate_title(self, value):
        return self._validate_length(value, "Title", 200)

    def validate_display_name(self, value):
        return self._validate_length(value, "Display name", 120)

    def validate_location(self, value):
        return self._validate_length(value, "Location", 120)

    def validate_headline(self, value):
        return self._validate_length(value, "Headline", 200)

    def validate_bio(self, value):
        return self._validate_length(value, "Bio", 2000)

    def validate_primary_cta_label(self, value):
        return self._validate_length(value, "CTA label", 40)

    def validate_seo_title(self, value):
        return self._validate_length(value, "SEO title", 120)

    def validate_seo_description(self, value):
        return self._validate_length(value, "SEO description", 180)

    def validate_github_url(self, value):
        value = self.normalize_url(value)
        if value and "github.com" not in urlparse(value).netloc.lower():
            raise serializers.ValidationError("GitHub URL must point to github.com.")
        return value

    def validate_linkedin_url(self, value):
        value = self.normalize_url(value)
        if value and "linkedin.com" not in urlparse(value).netloc.lower():
            raise serializers.ValidationError("LinkedIn URL must point to linkedin.com.")
        return value

    def validate_twitter_url(self, value):
        value = self.normalize_url(value)
        if value:
            host = urlparse(value).netloc.lower()
            if "twitter.com" not in host and "x.com" not in host:
                raise serializers.ValidationError("Twitter/X URL must point to x.com or twitter.com.")
        return value

    def validate_website_url(self, value):
        return self.normalize_url(value)

    def validate_resume_url(self, value):
        return self.normalize_url(value)

    def validate_primary_cta_url(self, value):
        return self.normalize_url(value)

    def validate_og_image_url(self, value):
        value = self.normalize_url(value)
        if value:
            path = urlparse(value).path.lower()
            valid_ext = ('.png', '.jpg', '.jpeg', '.webp')
            if path and not path.endswith(valid_ext):
                raise serializers.ValidationError("OG image URL should end with png/jpg/jpeg/webp.")
        return value

    def validate(self, attrs):
        final_label = attrs.get(
            'primary_cta_label',
            getattr(self.instance, 'primary_cta_label', ''),
        )
        final_url = attrs.get(
            'primary_cta_url',
            getattr(self.instance, 'primary_cta_url', ''),
        )
        label_in_payload = 'primary_cta_label' in attrs
        url_in_payload = 'primary_cta_url' in attrs

        if label_in_payload and final_label and not final_url and final_label not in {'Hire Me', 'Contact'}:
            raise serializers.ValidationError(
                {"primary_cta_url": "CTA URL is required when CTA label is set."}
            )

        if url_in_payload and final_url and not final_label:
            raise serializers.ValidationError(
                {"primary_cta_label": "CTA label is required when CTA URL is set."}
            )
        return attrs


class PublicPortfolioSerializer(serializers.ModelSerializer):
    """Serializer for public portfolio view."""

    projects = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.SerializerMethodField()
    public_url = serializers.SerializerMethodField()

    class Meta:
        model = Portfolio
        fields = [
            'slug',
            'username',
            'title',
            'display_name',
            'location',
            'availability_status',
            'bio',
            'headline',
            'skills',
            'github_url',
            'linkedin_url',
            'twitter_url',
            'website_url',
            'resume_url',
            'primary_cta_label',
            'primary_cta_url',
            'email',
            'theme',
            'projects',
            'status',
            'seo_title',
            'seo_description',
            'og_image_url',
            'public_url',
        ]

    def get_projects(self, obj):
        """Get visible projects with status-based filtering."""
        projects = obj.portfolio_projects.filter(is_visible=True)
        if obj.status == 'read_only':
            return [
                {
                    'id': p.id,
                    'project_type': p.project_type,
                    'title': p.display_title,
                }
                for p in projects
            ]

        if obj.status in ['active', 'grace']:
            return PortfolioProjectSerializer(projects, many=True).data

        return []

    def get_email(self, obj):
        """Return email only if show_email is True and portfolio is active."""
        if obj.show_email and obj.status in ['active', 'grace']:
            return obj.user.email
        return None

    def get_public_url(self, obj):
        request = self.context.get('request')
        return generate_public_url(obj, request=request)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.status == 'read_only':
            # Restrict sensitive/outbound fields in read-only mode.
            for key in [
                'resume_url',
                'primary_cta_url',
                'seo_description',
                'og_image_url',
            ]:
                data[key] = None
        return data


class PortfolioAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for portfolio analytics."""

    class Meta:
        model = PortfolioAnalytics
        fields = [
            'date',
            'page_views',
            'unique_visitors',
            'project_clicks',
            'github_clicks',
            'resume_downloads',
            'referrer_data',
        ]
        read_only_fields = fields


class PortfolioEventTrackSerializer(serializers.Serializer):
    slug = serializers.SlugField(required=True)
    event_type = serializers.ChoiceField(choices=sorted(ALLOWED_EVENT_TYPES))
    target_url = serializers.URLField(required=False, allow_blank=True)
    project_id = serializers.IntegerField(required=False)
    metadata = serializers.JSONField(required=False)

    def validate_metadata(self, value):
        return value if isinstance(value, dict) else {}
