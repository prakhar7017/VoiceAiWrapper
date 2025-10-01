from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from core.models import Organization, Project, Task, TaskComment


class Command(BaseCommand):
    help = 'Create sample data for the project management system'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creating sample data...'))

        # Create Organizations
        org1, created = Organization.objects.get_or_create(
            name='TechCorp Solutions',
            defaults={
                'contact_email': 'admin@techcorp.com'
            }
        )
        if created:
            self.stdout.write(f'Created organization: {org1.name}')

        org2, created = Organization.objects.get_or_create(
            name='StartupXYZ',
            defaults={
                'contact_email': 'hello@startupxyz.com'
            }
        )
        if created:
            self.stdout.write(f'Created organization: {org2.name}')

        # Create Projects for TechCorp
        project1, created = Project.objects.get_or_create(
            organization=org1,
            name='E-commerce Platform',
            defaults={
                'description': 'Building a modern e-commerce platform with React and Django',
                'status': 'ACTIVE',
                'due_date': timezone.now().date() + timedelta(days=90)
            }
        )
        if created:
            self.stdout.write(f'Created project: {project1.name}')

        project2, created = Project.objects.get_or_create(
            organization=org1,
            name='Mobile App Development',
            defaults={
                'description': 'Cross-platform mobile app using React Native',
                'status': 'ACTIVE',
                'due_date': timezone.now().date() + timedelta(days=120)
            }
        )
        if created:
            self.stdout.write(f'Created project: {project2.name}')

        # Create Projects for StartupXYZ
        project3, created = Project.objects.get_or_create(
            organization=org2,
            name='MVP Development',
            defaults={
                'description': 'Minimum viable product for our SaaS platform',
                'status': 'ACTIVE',
                'due_date': timezone.now().date() + timedelta(days=60)
            }
        )
        if created:
            self.stdout.write(f'Created project: {project3.name}')

        # Create Tasks for E-commerce Platform
        tasks_data = [
            {
                'title': 'Setup Django Backend',
                'description': 'Initialize Django project with proper structure',
                'status': 'DONE',
                'priority': 'HIGH',
                'assignee_email': 'john@techcorp.com'
            },
            {
                'title': 'Design Database Schema',
                'description': 'Create models for products, orders, and users',
                'status': 'DONE',
                'priority': 'HIGH',
                'assignee_email': 'sarah@techcorp.com'
            },
            {
                'title': 'Implement User Authentication',
                'description': 'JWT-based authentication system',
                'status': 'IN_PROGRESS',
                'priority': 'HIGH',
                'assignee_email': 'mike@techcorp.com'
            },
            {
                'title': 'Create Product Catalog',
                'description': 'Product listing and search functionality',
                'status': 'TODO',
                'priority': 'MEDIUM',
                'assignee_email': 'anna@techcorp.com'
            },
            {
                'title': 'Payment Integration',
                'description': 'Integrate Stripe payment gateway',
                'status': 'TODO',
                'priority': 'HIGH',
                'assignee_email': 'david@techcorp.com'
            }
        ]

        for task_data in tasks_data:
            task, created = Task.objects.get_or_create(
                project=project1,
                title=task_data['title'],
                defaults=task_data
            )
            if created:
                self.stdout.write(f'Created task: {task.title}')

        # Create Tasks for Mobile App
        mobile_tasks = [
            {
                'title': 'Setup React Native Project',
                'description': 'Initialize React Native with navigation',
                'status': 'DONE',
                'priority': 'HIGH',
                'assignee_email': 'lisa@techcorp.com'
            },
            {
                'title': 'Design UI Components',
                'description': 'Create reusable UI components',
                'status': 'IN_PROGRESS',
                'priority': 'MEDIUM',
                'assignee_email': 'tom@techcorp.com'
            },
            {
                'title': 'API Integration',
                'description': 'Connect mobile app to backend APIs',
                'status': 'TODO',
                'priority': 'HIGH',
                'assignee_email': 'lisa@techcorp.com'
            }
        ]

        for task_data in mobile_tasks:
            task, created = Task.objects.get_or_create(
                project=project2,
                title=task_data['title'],
                defaults=task_data
            )
            if created:
                self.stdout.write(f'Created task: {task.title}')

        # Create Tasks for MVP
        mvp_tasks = [
            {
                'title': 'Market Research',
                'description': 'Analyze competitor products and features',
                'status': 'DONE',
                'priority': 'HIGH',
                'assignee_email': 'founder@startupxyz.com'
            },
            {
                'title': 'Core Feature Development',
                'description': 'Build the main functionality',
                'status': 'IN_PROGRESS',
                'priority': 'URGENT',
                'assignee_email': 'dev@startupxyz.com'
            },
            {
                'title': 'User Testing',
                'description': 'Conduct user testing sessions',
                'status': 'TODO',
                'priority': 'MEDIUM',
                'assignee_email': 'ux@startupxyz.com'
            }
        ]

        for task_data in mvp_tasks:
            task, created = Task.objects.get_or_create(
                project=project3,
                title=task_data['title'],
                defaults=task_data
            )
            if created:
                self.stdout.write(f'Created task: {task.title}')

        # Create some comments
        auth_task = Task.objects.filter(title='Implement User Authentication').first()
        if auth_task:
            comment, created = TaskComment.objects.get_or_create(
                task=auth_task,
                author_email='john@techcorp.com',
                defaults={
                    'content': 'Started working on JWT implementation. Need to review security best practices.'
                }
            )
            if created:
                self.stdout.write(f'Created comment for task: {auth_task.title}')

            comment2, created = TaskComment.objects.get_or_create(
                task=auth_task,
                author_email='sarah@techcorp.com',
                defaults={
                    'content': 'Make sure to implement refresh token rotation for better security.'
                }
            )
            if created:
                self.stdout.write(f'Created comment for task: {auth_task.title}')

        core_feature_task = Task.objects.filter(title='Core Feature Development').first()
        if core_feature_task:
            comment, created = TaskComment.objects.get_or_create(
                task=core_feature_task,
                author_email='founder@startupxyz.com',
                defaults={
                    'content': 'This is critical for our launch. Please prioritize this over everything else.'
                }
            )
            if created:
                self.stdout.write(f'Created comment for task: {core_feature_task.title}')

        self.stdout.write(
            self.style.SUCCESS('Sample data created successfully!')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Organizations: {Organization.objects.count()}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Projects: {Project.objects.count()}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Tasks: {Task.objects.count()}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Comments: {TaskComment.objects.count()}')
        )
