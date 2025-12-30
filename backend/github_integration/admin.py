from django.contrib import admin
from .models import GitHubCredential, GitHubRepository, GitHubPublishLog


@admin.register(GitHubCredential)
class GitHubCredentialAdmin(admin.ModelAdmin):
    list_display = ['user', 'github_username', 'created_at', 'updated_at']
    search_fields = ['user__username', 'github_username']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['user']


@admin.register(GitHubRepository)
class GitHubRepositoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'repo_full_name', 'is_private', 'last_synced_at']
    list_filter = ['is_private']
    search_fields = ['user__username', 'repo_name', 'repo_full_name']
    raw_id_fields = ['user', 'project']


@admin.register(GitHubPublishLog)
class GitHubPublishLogAdmin(admin.ModelAdmin):
    list_display = ['repository', 'action', 'status', 'created_at']
    list_filter = ['status', 'action']
    readonly_fields = ['created_at']

