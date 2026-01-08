from django.db import models
from django.conf import settings


class UserProject(models.Model):
    """
    Stores user-created projects from CodeSpace.
    Can be linked to a roadmap or standalone.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('saved', 'Saved'),
        ('pushed', 'Pushed to GitHub'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='code_projects'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Optional link to roadmap project
    roadmap = models.ForeignKey(
        'roadmap_ai.Roadmap',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_projects'
    )
    
    # GitHub integration
    github_repo_url = models.URLField(blank=True)
    github_repo_name = models.CharField(max_length=200, blank=True)
    
    # Metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    language = models.CharField(max_length=50, blank=True)  # Primary language
    tech_stack = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'User Project'
        verbose_name_plural = 'User Projects'
    
    def __str__(self):
        return f"{self.title} ({self.user.username})"
    
    @property
    def file_count(self):
        return self.files.count()
    
    @property
    def total_size(self):
        return sum(len(f.content) for f in self.files.all())


class ProjectFile(models.Model):
    """
    Individual file within a user project.
    Stores the file path, content, and language.
    """
    project = models.ForeignKey(
        UserProject,
        on_delete=models.CASCADE,
        related_name='files'
    )
    path = models.CharField(max_length=500)  # e.g., "src/components/App.jsx"
    content = models.TextField()
    language = models.CharField(max_length=50, blank=True)  # Detected from extension
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['path']
        unique_together = ['project', 'path']
    
    def __str__(self):
        return f"{self.path} ({self.project.title})"
    
    @property
    def filename(self):
        return self.path.split('/')[-1]
    
    @property
    def extension(self):
        parts = self.filename.split('.')
        return parts[-1] if len(parts) > 1 else ''
    
    def save(self, *args, **kwargs):
        # Auto-detect language from extension
        if not self.language:
            ext_to_lang = {
                'js': 'javascript',
                'jsx': 'javascript',
                'ts': 'typescript',
                'tsx': 'typescript',
                'py': 'python',
                'html': 'html',
                'css': 'css',
                'json': 'json',
                'md': 'markdown',
                'java': 'java',
                'cpp': 'cpp',
                'c': 'c',
                'go': 'go',
                'rs': 'rust',
                'rb': 'ruby',
            }
            self.language = ext_to_lang.get(self.extension, 'text')
        super().save(*args, **kwargs)
