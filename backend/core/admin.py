from django.contrib import admin
from .models import Organization, Project, Task, TaskComment


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'contact_email', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'contact_email']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'organization', 'status', 'due_date', 'task_count', 'completion_rate']
    list_filter = ['status', 'organization', 'created_at']
    search_fields = ['name', 'description', 'organization__name']
    readonly_fields = ['created_at', 'updated_at', 'task_count', 'completed_tasks_count', 'completion_rate']
    date_hierarchy = 'created_at'


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'status', 'priority', 'assignee_email', 'due_date']
    list_filter = ['status', 'priority', 'project__organization', 'created_at']
    search_fields = ['title', 'description', 'assignee_email', 'project__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'author_email', 'created_at']
    list_filter = ['task__project__organization', 'created_at']
    search_fields = ['content', 'author_email', 'task__title']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
