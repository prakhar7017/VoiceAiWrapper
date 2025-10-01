from django.test import TestCase
from graphene.test import Client
from .schema import schema
from .models import Organization, Project, Task, TaskComment


class GraphQLTestCase(TestCase):
    def setUp(self):
        """Set up test data"""
        self.organization = Organization.objects.create(
            name="Test Organization",
            contact_email="test@example.com"
        )
        self.project = Project.objects.create(
            organization=self.organization,
            name="Test Project",
            description="A test project",
            status="ACTIVE"
        )
        self.task = Task.objects.create(
            project=self.project,
            title="Test Task",
            description="A test task",
            status="TODO",
            priority="MEDIUM",
            assignee_email="assignee@example.com"
        )
        self.client = Client(schema)

    def test_organization_query(self):
        """Test organization query"""
        query = '''
            query {
                organizations {
                    id
                    name
                    slug
                    contactEmail
                    projectCount
                }
            }
        '''
        result = self.client.execute(query)
        self.assertIsNone(result.get('errors'))
        self.assertEqual(len(result['data']['organizations']), 1)
        self.assertEqual(result['data']['organizations'][0]['name'], 'Test Organization')

    def test_projects_query(self):
        """Test projects query with organization isolation"""
        query = '''
            query($organizationSlug: String!) {
                projects(organizationSlug: $organizationSlug) {
                    id
                    name
                    status
                    taskCount
                    completionRate
                }
            }
        '''
        variables = {'organizationSlug': self.organization.slug}
        result = self.client.execute(query, variables=variables)
        self.assertIsNone(result.get('errors'))
        self.assertEqual(len(result['data']['projects']), 1)
        self.assertEqual(result['data']['projects'][0]['name'], 'Test Project')

    def test_create_project_mutation(self):
        """Test project creation mutation"""
        mutation = '''
            mutation($organizationSlug: String!, $name: String!, $description: String!) {
                createProject(organizationSlug: $organizationSlug, name: $name, description: $description) {
                    success
                    message
                    project {
                        id
                        name
                        description
                        status
                    }
                }
            }
        '''
        variables = {
            'organizationSlug': self.organization.slug,
            'name': 'New Test Project',
            'description': 'A new test project'
        }
        result = self.client.execute(mutation, variables=variables)
        self.assertIsNone(result.get('errors'))
        self.assertTrue(result['data']['createProject']['success'])
        self.assertEqual(result['data']['createProject']['project']['name'], 'New Test Project')

    def test_create_task_mutation(self):
        """Test task creation mutation"""
        mutation = '''
            mutation($projectId: ID!, $organizationSlug: String!, $title: String!) {
                createTask(projectId: $projectId, organizationSlug: $organizationSlug, title: $title) {
                    success
                    message
                    task {
                        id
                        title
                        status
                        priority
                    }
                }
            }
        '''
        variables = {
            'projectId': str(self.project.id),
            'organizationSlug': self.organization.slug,
            'title': 'New Test Task'
        }
        result = self.client.execute(mutation, variables=variables)
        self.assertIsNone(result.get('errors'))
        self.assertTrue(result['data']['createTask']['success'])
        self.assertEqual(result['data']['createTask']['task']['title'], 'New Test Task')

    def test_multi_tenancy_isolation(self):
        """Test that organizations are properly isolated"""
        # Create another organization
        other_org = Organization.objects.create(
            name="Other Organization",
            contact_email="other@example.com"
        )
        
        # Try to access projects from wrong organization
        query = '''
            query($organizationSlug: String!) {
                projects(organizationSlug: $organizationSlug) {
                    id
                    name
                }
            }
        '''
        variables = {'organizationSlug': other_org.slug}
        result = self.client.execute(query, variables=variables)
        self.assertIsNone(result.get('errors'))
        # Should return empty list since other_org has no projects
        self.assertEqual(len(result['data']['projects']), 0)


class ModelTestCase(TestCase):
    def setUp(self):
        self.organization = Organization.objects.create(
            name="Test Organization",
            contact_email="test@example.com"
        )
        self.project = Project.objects.create(
            organization=self.organization,
            name="Test Project",
            description="A test project"
        )

    def test_organization_slug_generation(self):
        """Test that organization slug is auto-generated"""
        self.assertEqual(self.organization.slug, 'test-organization')

    def test_project_statistics(self):
        """Test project statistics calculation"""
        # Create tasks with different statuses
        Task.objects.create(
            project=self.project,
            title="Task 1",
            status="DONE"
        )
        Task.objects.create(
            project=self.project,
            title="Task 2",
            status="TODO"
        )
        Task.objects.create(
            project=self.project,
            title="Task 3",
            status="DONE"
        )

        self.assertEqual(self.project.task_count, 3)
        self.assertEqual(self.project.completed_tasks_count, 2)
        self.assertEqual(self.project.completion_rate, 66.67)

    def test_task_organization_property(self):
        """Test that task can access its organization"""
        task = Task.objects.create(
            project=self.project,
            title="Test Task"
        )
        self.assertEqual(task.organization, self.organization)
