from django.contrib import admin
from .models import UserProject, ProjectFile


class ProjectFileInline(admin.TabularInline):
    model = ProjectFile
    extra = 0
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserProject)
class UserProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'status', 'file_count', 'created_at']
    list_filter = ['status', 'language', 'created_at']
    search_fields = ['title', 'user__username', 'description']
    readonly_fields = ['created_at', 'updated_at', 'file_count', 'total_size']
    inlines = [ProjectFileInline]
    
    def file_count(self, obj):
        return obj.file_count
    file_count.short_description = 'Files'


@admin.register(ProjectFile)
class ProjectFileAdmin(admin.ModelAdmin):
    list_display = ['path', 'project', 'language', 'created_at']
    list_filter = ['language', 'created_at']
    search_fields = ['path', 'project__title']
    readonly_fields = ['created_at', 'updated_at']
