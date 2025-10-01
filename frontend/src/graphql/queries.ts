import { gql } from '@apollo/client';

// Organization Queries
export const GET_ORGANIZATIONS = gql`
  query GetOrganizations {
    organizations {
      id
      name
      slug
      contactEmail
      createdAt
      updatedAt
      projectCount
      totalTasks
      completedTasks
    }
  }
`;

export const GET_ORGANIZATION = gql`
  query GetOrganization($slug: String!) {
    organization(slug: $slug) {
      id
      name
      slug
      contactEmail
      createdAt
      updatedAt
      projectCount
      totalTasks
      completedTasks
    }
  }
`;

// Project Queries
export const GET_PROJECTS = gql`
  query GetProjects(
    $organizationSlug: String!
    $status: String
    $search: String
    $orderBy: String
    $limit: Int
    $offset: Int
  ) {
    projects(
      organizationSlug: $organizationSlug
      status: $status
      search: $search
      orderBy: $orderBy
      limit: $limit
      offset: $offset
    ) {
      id
      name
      description
      status
      dueDate
      createdAt
      updatedAt
      taskCount
      completedTasksCount
      completionRate
      organization {
        id
        name
        slug
      }
    }
  }
`;

export const GET_PROJECT = gql`
  query GetProject($id: ID!, $organizationSlug: String!) {
    project(id: $id, organizationSlug: $organizationSlug) {
      id
      name
      description
      status
      dueDate
      createdAt
      updatedAt
      taskCount
      completedTasksCount
      completionRate
      organization {
        id
        name
        slug
      }
    }
  }
`;

// Task Queries
export const GET_TASKS = gql`
  query GetTasks(
    $projectId: ID!
    $organizationSlug: String!
    $status: String
    $priority: String
    $assigneeEmail: String
    $search: String
    $orderBy: String
    $limit: Int
    $offset: Int
  ) {
    tasks(
      projectId: $projectId
      organizationSlug: $organizationSlug
      status: $status
      priority: $priority
      assigneeEmail: $assigneeEmail
      search: $search
      orderBy: $orderBy
      limit: $limit
      offset: $offset
    ) {
      id
      title
      description
      status
      priority
      assigneeEmail
      dueDate
      createdAt
      updatedAt
      commentCount
      project {
        id
        name
        organization {
          id
          name
          slug
        }
      }
    }
  }
`;

export const GET_TASK = gql`
  query GetTask($id: ID!, $organizationSlug: String!) {
    task(id: $id, organizationSlug: $organizationSlug) {
      id
      title
      description
      status
      priority
      assigneeEmail
      dueDate
      createdAt
      updatedAt
      commentCount
      project {
        id
        name
        organization {
          id
          name
          slug
        }
      }
    }
  }
`;

// Comment Queries
export const GET_TASK_COMMENTS = gql`
  query GetTaskComments($taskId: ID!, $organizationSlug: String!) {
    taskComments(taskId: $taskId, organizationSlug: $organizationSlug) {
      id
      content
      authorEmail
      createdAt
      updatedAt
      task {
        id
        title
      }
    }
  }
`;

// Dashboard Query
export const GET_DASHBOARD_DATA = gql`
  query GetDashboardData($organizationSlug: String!) {
    organization(slug: $organizationSlug) {
      id
      name
      slug
      contactEmail
      projectCount
      totalTasks
      completedTasks
    }
    projects(organizationSlug: $organizationSlug, limit: 5, orderBy: "-updated_at") {
      id
      name
      description
      status
      dueDate
      createdAt
      updatedAt
      taskCount
      completedTasksCount
      completionRate
    }
  }
`;

// Search Queries
export const SEARCH_ALL = gql`
  query SearchAll($organizationSlug: String!, $query: String!, $limit: Int) {
    projects(organizationSlug: $organizationSlug, search: $query, limit: $limit) {
      id
      name
      description
      status
      createdAt
    }
    tasks(
      projectId: ""
      organizationSlug: $organizationSlug
      search: $query
      limit: $limit
    ) {
      id
      title
      description
      status
      priority
      createdAt
      project {
        id
        name
      }
    }
  }
`;

// Statistics Query
export const GET_ORGANIZATION_STATS = gql`
  query GetOrganizationStats($organizationSlug: String!) {
    organization(slug: $organizationSlug) {
      id
      name
      projectCount
      totalTasks
      completedTasks
    }
    projects(organizationSlug: $organizationSlug) {
      id
      status
      taskCount
      completedTasksCount
      completionRate
      createdAt
      dueDate
    }
  }
`;
