import graphene
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
from django.db.models import Q, Count, Avg
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
import logging
from .models import Organization, Project, Task, TaskComment

logger = logging.getLogger(__name__)


# GraphQL Types
class OrganizationType(DjangoObjectType):
    class Meta:
        model = Organization
        fields = '__all__'

    project_count = graphene.Int()
    total_tasks = graphene.Int()
    completed_tasks = graphene.Int()

    def resolve_project_count(self, info):
        return self.projects.count()

    def resolve_total_tasks(self, info):
        return Task.objects.filter(project__organization=self).count()

    def resolve_completed_tasks(self, info):
        return Task.objects.filter(project__organization=self, status='DONE').count()


class ProjectType(DjangoObjectType):
    class Meta:
        model = Project
        fields = '__all__'

    task_count = graphene.Int()
    completed_tasks_count = graphene.Int()
    completion_rate = graphene.Float()

    def resolve_task_count(self, info):
        return self.task_count

    def resolve_completed_tasks_count(self, info):
        return self.completed_tasks_count

    def resolve_completion_rate(self, info):
        return self.completion_rate


class TaskType(DjangoObjectType):
    class Meta:
        model = Task
        fields = '__all__'

    comment_count = graphene.Int()

    def resolve_comment_count(self, info):
        return self.comments.count()


class TaskCommentType(DjangoObjectType):
    class Meta:
        model = TaskComment
        fields = '__all__'


# Query Class
class Query(graphene.ObjectType):
    # Organization queries
    organizations = graphene.List(OrganizationType)
    organization = graphene.Field(OrganizationType, slug=graphene.String(required=True))
    
    # Project queries with advanced filtering
    projects = graphene.List(
        ProjectType,
        organization_slug=graphene.String(required=True),
        status=graphene.String(),
        search=graphene.String(),
        order_by=graphene.String(),
        limit=graphene.Int(),
        offset=graphene.Int()
    )
    project = graphene.Field(
        ProjectType,
        id=graphene.ID(required=True),
        organization_slug=graphene.String(required=True)
    )
    
    # Task queries with advanced filtering
    tasks = graphene.List(
        TaskType,
        project_id=graphene.ID(required=True),
        organization_slug=graphene.String(required=True),
        status=graphene.String(),
        priority=graphene.String(),
        assignee_email=graphene.String(),
        search=graphene.String(),
        order_by=graphene.String(),
        limit=graphene.Int(),
        offset=graphene.Int()
    )
    task = graphene.Field(
        TaskType,
        id=graphene.ID(required=True),
        organization_slug=graphene.String(required=True)
    )
    
    # Comment queries
    task_comments = graphene.List(
        TaskCommentType,
        task_id=graphene.ID(required=True),
        organization_slug=graphene.String(required=True)
    )

    # Organization resolvers
    def resolve_organizations(self, info):
        return Organization.objects.all()

    def resolve_organization(self, info, slug):
        try:
            return Organization.objects.get(slug=slug)
        except Organization.DoesNotExist:
            return None

    # Project resolvers with advanced filtering
    def resolve_projects(self, info, organization_slug, status=None, search=None, 
                        order_by=None, limit=None, offset=None):
        try:
            logger.info(f"Fetching projects for organization: {organization_slug}")
            organization = Organization.objects.get(slug=organization_slug)
            projects = Project.objects.filter(organization=organization)
            
            # Apply filters
            if status:
                projects = projects.filter(status=status)
            
            # Apply search
            if search:
                projects = projects.filter(
                    Q(name__icontains=search) | 
                    Q(description__icontains=search)
                )
            
            # Apply ordering
            if order_by:
                if order_by.startswith('-'):
                    projects = projects.order_by(order_by)
                else:
                    projects = projects.order_by(order_by)
            else:
                projects = projects.order_by('-created_at')
            
            # Apply pagination
            if offset:
                projects = projects[offset:]
            if limit:
                projects = projects[:limit]
                
            return projects
        except Organization.DoesNotExist:
            logger.error(f"Organization not found: {organization_slug}")
            return []
        except Exception as e:
            logger.error(f"Error fetching projects: {str(e)}")
            return []

    def resolve_project(self, info, id, organization_slug):
        try:
            organization = Organization.objects.get(slug=organization_slug)
            return Project.objects.get(id=id, organization=organization)
        except (Organization.DoesNotExist, Project.DoesNotExist):
            return None

    # Task resolvers with advanced filtering
    def resolve_tasks(self, info, project_id, organization_slug, status=None, 
                     priority=None, assignee_email=None, search=None, 
                     order_by=None, limit=None, offset=None):
        try:
            logger.info(f"Fetching tasks for project: {project_id}")
            organization = Organization.objects.get(slug=organization_slug)
            project = Project.objects.get(id=project_id, organization=organization)
            tasks = Task.objects.filter(project=project)
            
            # Apply filters
            if status:
                tasks = tasks.filter(status=status)
            if priority:
                tasks = tasks.filter(priority=priority)
            if assignee_email:
                tasks = tasks.filter(assignee_email__icontains=assignee_email)
            
            # Apply search
            if search:
                tasks = tasks.filter(
                    Q(title__icontains=search) | 
                    Q(description__icontains=search) |
                    Q(assignee_email__icontains=search)
                )
            
            # Apply ordering
            if order_by:
                tasks = tasks.order_by(order_by)
            else:
                tasks = tasks.order_by('-created_at')
            
            # Apply pagination
            if offset:
                tasks = tasks[offset:]
            if limit:
                tasks = tasks[:limit]
                
            return tasks
        except (Organization.DoesNotExist, Project.DoesNotExist) as e:
            logger.error(f"Project or Organization not found: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Error fetching tasks: {str(e)}")
            return []

    def resolve_task(self, info, id, organization_slug):
        try:
            organization = Organization.objects.get(slug=organization_slug)
            return Task.objects.get(id=id, project__organization=organization)
        except (Organization.DoesNotExist, Task.DoesNotExist):
            return None

    # Comment resolvers
    def resolve_task_comments(self, info, task_id, organization_slug):
        try:
            organization = Organization.objects.get(slug=organization_slug)
            task = Task.objects.get(id=task_id, project__organization=organization)
            return TaskComment.objects.filter(task=task)
        except (Organization.DoesNotExist, Task.DoesNotExist):
            return []


# Mutation Classes
class CreateOrganization(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        contact_email = graphene.String(required=True)

    organization = graphene.Field(OrganizationType)
    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, name, contact_email):
        try:
            # Validation
            if not name or len(name.strip()) < 2:
                return CreateOrganization(
                    organization=None,
                    success=False,
                    message="Organization name must be at least 2 characters long"
                )
            
            # Validate email
            try:
                validate_email(contact_email)
            except ValidationError:
                return CreateOrganization(
                    organization=None,
                    success=False,
                    message="Invalid email address"
                )
            
            # Check if organization already exists
            if Organization.objects.filter(name=name.strip()).exists():
                return CreateOrganization(
                    organization=None,
                    success=False,
                    message="Organization with this name already exists"
                )
            
            organization = Organization.objects.create(
                name=name.strip(),
                contact_email=contact_email.strip().lower()
            )
            
            logger.info(f"Created organization: {organization.name}")
            return CreateOrganization(
                organization=organization,
                success=True,
                message="Organization created successfully"
            )
        except Exception as e:
            logger.error(f"Error creating organization: {str(e)}")
            return CreateOrganization(
                organization=None,
                success=False,
                message=f"Failed to create organization: {str(e)}"
            )


class CreateProject(graphene.Mutation):
    class Arguments:
        organization_slug = graphene.String(required=True)
        name = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        due_date = graphene.Date()

    project = graphene.Field(ProjectType)
    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, organization_slug, name, description="", status="ACTIVE", due_date=None):
        try:
            organization = Organization.objects.get(slug=organization_slug)
            project = Project.objects.create(
                organization=organization,
                name=name,
                description=description,
                status=status,
                due_date=due_date
            )
            return CreateProject(
                project=project,
                success=True,
                message="Project created successfully"
            )
        except Organization.DoesNotExist:
            return CreateProject(
                project=None,
                success=False,
                message="Organization not found"
            )
        except Exception as e:
            return CreateProject(
                project=None,
                success=False,
                message=str(e)
            )


class UpdateProject(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        organization_slug = graphene.String(required=True)
        name = graphene.String()
        description = graphene.String()
        status = graphene.String()
        due_date = graphene.Date()

    project = graphene.Field(ProjectType)
    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, id, organization_slug, **kwargs):
        try:
            organization = Organization.objects.get(slug=organization_slug)
            project = Project.objects.get(id=id, organization=organization)
            
            for field, value in kwargs.items():
                if value is not None:
                    setattr(project, field, value)
            
            project.save()
            return UpdateProject(
                project=project,
                success=True,
                message="Project updated successfully"
            )
        except (Organization.DoesNotExist, Project.DoesNotExist):
            return UpdateProject(
                project=None,
                success=False,
                message="Project or Organization not found"
            )
        except Exception as e:
            return UpdateProject(
                project=None,
                success=False,
                message=str(e)
            )


class CreateTask(graphene.Mutation):
    class Arguments:
        project_id = graphene.ID(required=True)
        organization_slug = graphene.String(required=True)
        title = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        priority = graphene.String()
        assignee_email = graphene.String()
        due_date = graphene.DateTime()

    task = graphene.Field(TaskType)
    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, project_id, organization_slug, title, **kwargs):
        try:
            organization = Organization.objects.get(slug=organization_slug)
            project = Project.objects.get(id=project_id, organization=organization)
            
            task = Task.objects.create(
                project=project,
                title=title,
                description=kwargs.get('description', ''),
                status=kwargs.get('status', 'TODO'),
                priority=kwargs.get('priority', 'MEDIUM'),
                assignee_email=kwargs.get('assignee_email', ''),
                due_date=kwargs.get('due_date')
            )
            return CreateTask(
                task=task,
                success=True,
                message="Task created successfully"
            )
        except (Organization.DoesNotExist, Project.DoesNotExist):
            return CreateTask(
                task=None,
                success=False,
                message="Project or Organization not found"
            )
        except Exception as e:
            return CreateTask(
                task=None,
                success=False,
                message=str(e)
            )


class UpdateTask(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        organization_slug = graphene.String(required=True)
        title = graphene.String()
        description = graphene.String()
        status = graphene.String()
        priority = graphene.String()
        assignee_email = graphene.String()
        due_date = graphene.DateTime()

    task = graphene.Field(TaskType)
    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, id, organization_slug, **kwargs):
        try:
            organization = Organization.objects.get(slug=organization_slug)
            task = Task.objects.get(id=id, project__organization=organization)
            
            for field, value in kwargs.items():
                if value is not None:
                    setattr(task, field, value)
            
            task.save()
            return UpdateTask(
                task=task,
                success=True,
                message="Task updated successfully"
            )
        except (Organization.DoesNotExist, Task.DoesNotExist):
            return UpdateTask(
                task=None,
                success=False,
                message="Task or Organization not found"
            )
        except Exception as e:
            return UpdateTask(
                task=None,
                success=False,
                message=str(e)
            )


class CreateTaskComment(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        organization_slug = graphene.String(required=True)
        content = graphene.String(required=True)
        author_email = graphene.String(required=True)

    comment = graphene.Field(TaskCommentType)
    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, task_id, organization_slug, content, author_email):
        try:
            organization = Organization.objects.get(slug=organization_slug)
            task = Task.objects.get(id=task_id, project__organization=organization)
            
            comment = TaskComment.objects.create(
                task=task,
                content=content,
                author_email=author_email
            )
            return CreateTaskComment(
                comment=comment,
                success=True,
                message="Comment added successfully"
            )
        except (Organization.DoesNotExist, Task.DoesNotExist):
            return CreateTaskComment(
                comment=None,
                success=False,
                message="Task or Organization not found"
            )
        except Exception as e:
            return CreateTaskComment(
                comment=None,
                success=False,
                message=str(e)
            )


class Mutation(graphene.ObjectType):
    create_organization = CreateOrganization.Field()
    create_project = CreateProject.Field()
    update_project = UpdateProject.Field()
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    create_task_comment = CreateTaskComment.Field()


# Schema
schema = graphene.Schema(query=Query, mutation=Mutation)
