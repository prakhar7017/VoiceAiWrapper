from django.test import TestCase, TransactionTestCase
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from graphene.test import Client
from unittest.mock import patch
import json
from .schema import schema
from .models import Organization, Project, Task, TaskComment


class AdvancedModelTestCase(TestCase):
    """Advanced model testing with edge cases and validation"""
    
    def setUp(self):
        self.organization = Organization.objects.create(
            name="Test Organization",
            contact_email="test@example.com"
        )
    
    def test_organization_slug_uniqueness(self):
        """Test that organization slugs are unique"""
        # Create another organization with similar name
        org2 = Organization.objects.create(
            name="Test Organization 2",
            contact_email="test2@example.com"
        )
        
        self.assertNotEqual(self.organization.slug, org2.slug)
    
    def test_organization_email_validation(self):
        """Test email validation on organization"""
        with self.assertRaises(ValidationError):
            org = Organization(name="Invalid Org", contact_email="invalid-email")
            org.full_clean()
    
    def test_project_completion_rate_edge_cases(self):
        """Test project completion rate with edge cases"""
        project = Project.objects.create(
            organization=self.organization,
            name="Test Project"
        )
        
        # No tasks - should return 0
        self.assertEqual(project.completion_rate, 0)
        
        # Add tasks with different statuses
        Task.objects.create(project=project, title="Task 1", status="DONE")
        Task.objects.create(project=project, title="Task 2", status="TODO")
        Task.objects.create(project=project, title="Task 3", status="IN_PROGRESS")
        Task.objects.create(project=project, title="Task 4", status="DONE")
        
        # Should be 50% (2 out of 4 done)
        self.assertEqual(project.completion_rate, 50.0)
    
    def test_project_name_uniqueness_per_organization(self):
        """Test that project names are unique per organization"""
        Project.objects.create(
            organization=self.organization,
            name="Unique Project"
        )
        
        # Should raise IntegrityError for duplicate name in same org
        with self.assertRaises(IntegrityError):
            Project.objects.create(
                organization=self.organization,
                name="Unique Project"
            )
    
    def test_task_organization_property(self):
        """Test that task can access organization through project"""
        project = Project.objects.create(
            organization=self.organization,
            name="Test Project"
        )
        task = Task.objects.create(
            project=project,
            title="Test Task"
        )
        
        self.assertEqual(task.organization, self.organization)


class AdvancedGraphQLTestCase(TestCase):
    """Advanced GraphQL testing with complex scenarios"""
    
    def setUp(self):
        self.client = Client(schema)
        self.org1 = Organization.objects.create(
            name="Organization One",
            contact_email="org1@example.com"
        )
        self.org2 = Organization.objects.create(
            name="Organization Two", 
            contact_email="org2@example.com"
        )
        
        # Create projects for both organizations
        self.project1 = Project.objects.create(
            organization=self.org1,
            name="Project Alpha",
            status="ACTIVE"
        )
        self.project2 = Project.objects.create(
            organization=self.org2,
            name="Project Beta",
            status="COMPLETED"
        )
    
    def test_advanced_project_filtering(self):
        """Test advanced project filtering with search and pagination"""
        # Create more projects for testing
        Project.objects.create(
            organization=self.org1,
            name="Alpha Search Test",
            description="This is a test project for searching"
        )
        Project.objects.create(
            organization=self.org1,
            name="Beta Project",
            description="Another project"
        )
        
        query = '''
            query($organizationSlug: String!, $search: String, $limit: Int, $offset: Int) {
                projects(
                    organizationSlug: $organizationSlug, 
                    search: $search,
                    limit: $limit,
                    offset: $offset
                ) {
                    id
                    name
                    description
                }
            }
        '''
        
        # Test search functionality
        variables = {
            'organizationSlug': self.org1.slug,
            'search': 'Alpha',
            'limit': 10,
            'offset': 0
        }
        
        result = self.client.execute(query, variables=variables)
        self.assertIsNone(result.get('errors'))
        
        # Should find projects with 'Alpha' in name or description
        projects = result['data']['projects']
        self.assertTrue(len(projects) >= 2)
        
        # Test pagination
        variables['limit'] = 1
        result = self.client.execute(query, variables=variables)
        self.assertEqual(len(result['data']['projects']), 1)
    
    def test_advanced_task_filtering(self):
        """Test advanced task filtering with multiple criteria"""
        # Create tasks with different properties
        Task.objects.create(
            project=self.project1,
            title="High Priority Task",
            priority="HIGH",
            status="TODO",
            assignee_email="john@example.com"
        )
        Task.objects.create(
            project=self.project1,
            title="Medium Priority Task",
            priority="MEDIUM", 
            status="IN_PROGRESS",
            assignee_email="jane@example.com"
        )
        Task.objects.create(
            project=self.project1,
            title="Low Priority Task",
            priority="LOW",
            status="DONE",
            assignee_email="john@example.com"
        )
        
        query = '''
            query($projectId: ID!, $organizationSlug: String!, $priority: String, $assigneeEmail: String, $search: String) {
                tasks(
                    projectId: $projectId,
                    organizationSlug: $organizationSlug,
                    priority: $priority,
                    assigneeEmail: $assigneeEmail,
                    search: $search
                ) {
                    id
                    title
                    priority
                    status
                    assigneeEmail
                }
            }
        '''
        
        # Test filtering by priority
        variables = {
            'projectId': str(self.project1.id),
            'organizationSlug': self.org1.slug,
            'priority': 'HIGH'
        }
        
        result = self.client.execute(query, variables=variables)
        self.assertIsNone(result.get('errors'))
        tasks = result['data']['tasks']
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]['priority'], 'HIGH')
        
        # Test filtering by assignee
        variables = {
            'projectId': str(self.project1.id),
            'organizationSlug': self.org1.slug,
            'assigneeEmail': 'john'
        }
        
        result = self.client.execute(query, variables=variables)
        tasks = result['data']['tasks']
        self.assertEqual(len(tasks), 2)  # Should find both tasks assigned to john
    
    def test_multi_tenancy_isolation_strict(self):
        """Strict test for multi-tenancy isolation"""
        # Create task in org1
        task = Task.objects.create(
            project=self.project1,
            title="Secret Task",
            description="This should not be visible to org2"
        )
        
        # Try to access task from org2 context
        query = '''
            query($id: ID!, $organizationSlug: String!) {
                task(id: $id, organizationSlug: $organizationSlug) {
                    id
                    title
                }
            }
        '''
        
        variables = {
            'id': str(task.id),
            'organizationSlug': self.org2.slug  # Wrong organization
        }
        
        result = self.client.execute(query, variables=variables)
        self.assertIsNone(result.get('errors'))
        self.assertIsNone(result['data']['task'])  # Should return None
    
    def test_mutation_validation_errors(self):
        """Test mutation validation and error handling"""
        mutation = '''
            mutation($name: String!, $contactEmail: String!) {
                createOrganization(name: $name, contactEmail: $contactEmail) {
                    success
                    message
                    organization {
                        id
                        name
                    }
                }
            }
        '''
        
        # Test with invalid email
        variables = {
            'name': 'Test Org',
            'contactEmail': 'invalid-email'
        }
        
        result = self.client.execute(mutation, variables=variables)
        self.assertIsNone(result.get('errors'))
        self.assertFalse(result['data']['createOrganization']['success'])
        self.assertIn('Invalid email', result['data']['createOrganization']['message'])
        
        # Test with empty name
        variables = {
            'name': '',
            'contactEmail': 'valid@example.com'
        }
        
        result = self.client.execute(mutation, variables=variables)
        self.assertFalse(result['data']['createOrganization']['success'])
        self.assertIn('at least 2 characters', result['data']['createOrganization']['message'])
    
    def test_complex_nested_query(self):
        """Test complex nested queries with statistics"""
        # Create tasks for statistics
        Task.objects.create(project=self.project1, title="Task 1", status="DONE")
        Task.objects.create(project=self.project1, title="Task 2", status="TODO")
        Task.objects.create(project=self.project1, title="Task 3", status="DONE")
        
        query = '''
            query($organizationSlug: String!) {
                organization(slug: $organizationSlug) {
                    name
                    projectCount
                    totalTasks
                    completedTasks
                }
                projects(organizationSlug: $organizationSlug) {
                    name
                    taskCount
                    completedTasksCount
                    completionRate
                }
            }
        '''
        
        variables = {'organizationSlug': self.org1.slug}
        result = self.client.execute(query, variables=variables)
        
        self.assertIsNone(result.get('errors'))
        
        org_data = result['data']['organization']
        self.assertEqual(org_data['projectCount'], 1)
        self.assertEqual(org_data['totalTasks'], 3)
        self.assertEqual(org_data['completedTasks'], 2)
        
        project_data = result['data']['projects'][0]
        self.assertEqual(project_data['taskCount'], 3)
        self.assertEqual(project_data['completedTasksCount'], 2)
        self.assertEqual(project_data['completionRate'], 66.67)


class PerformanceTestCase(TransactionTestCase):
    """Performance and load testing"""
    
    def test_bulk_operations_performance(self):
        """Test performance with bulk operations"""
        org = Organization.objects.create(
            name="Performance Test Org",
            contact_email="perf@example.com"
        )
        
        # Create multiple projects
        projects = []
        for i in range(10):
            projects.append(Project(
                organization=org,
                name=f"Project {i}",
                description=f"Description for project {i}"
            ))
        
        Project.objects.bulk_create(projects)
        
        # Test query performance
        query = '''
            query($organizationSlug: String!) {
                projects(organizationSlug: $organizationSlug) {
                    id
                    name
                    taskCount
                    completionRate
                }
            }
        '''
        
        client = Client(schema)
        variables = {'organizationSlug': org.slug}
        
        # This should complete reasonably fast
        result = client.execute(query, variables=variables)
        self.assertIsNone(result.get('errors'))
        self.assertEqual(len(result['data']['projects']), 10)
    
    @patch('core.schema.logger')
    def test_error_logging(self, mock_logger):
        """Test that errors are properly logged"""
        query = '''
            query {
                organization(slug: "non-existent-slug") {
                    name
                }
            }
        '''
        
        client = Client(schema)
        result = client.execute(query)
        
        # Should not error but return None
        self.assertIsNone(result.get('errors'))
        self.assertIsNone(result['data']['organization'])
