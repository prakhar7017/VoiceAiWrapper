import { gql } from '@apollo/client';

// Organization Mutations
export const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($name: String!, $contactEmail: String!) {
    createOrganization(name: $name, contactEmail: $contactEmail) {
      success
      message
      organization {
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
  }
`;

// Project Mutations
export const CREATE_PROJECT = gql`
  mutation CreateProject(
    $organizationSlug: String!
    $name: String!
    $description: String
    $status: String
    $dueDate: Date
  ) {
    createProject(
      organizationSlug: $organizationSlug
      name: $name
      description: $description
      status: $status
      dueDate: $dueDate
    ) {
      success
      message
      project {
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
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject(
    $id: ID!
    $organizationSlug: String!
    $name: String
    $description: String
    $status: String
    $dueDate: Date
  ) {
    updateProject(
      id: $id
      organizationSlug: $organizationSlug
      name: $name
      description: $description
      status: $status
      dueDate: $dueDate
    ) {
      success
      message
      project {
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
  }
`;

// Task Mutations
export const CREATE_TASK = gql`
  mutation CreateTask(
    $projectId: ID!
    $organizationSlug: String!
    $title: String!
    $description: String
    $status: String
    $priority: String
    $assigneeEmail: String
    $dueDate: DateTime
  ) {
    createTask(
      projectId: $projectId
      organizationSlug: $organizationSlug
      title: $title
      description: $description
      status: $status
      priority: $priority
      assigneeEmail: $assigneeEmail
      dueDate: $dueDate
    ) {
      success
      message
      task {
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
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask(
    $id: ID!
    $organizationSlug: String!
    $title: String
    $description: String
    $status: String
    $priority: String
    $assigneeEmail: String
    $dueDate: DateTime
  ) {
    updateTask(
      id: $id
      organizationSlug: $organizationSlug
      title: $title
      description: $description
      status: $status
      priority: $priority
      assigneeEmail: $assigneeEmail
      dueDate: $dueDate
    ) {
      success
      message
      task {
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
  }
`;

// Task Comment Mutations
export const CREATE_TASK_COMMENT = gql`
  mutation CreateTaskComment(
    $taskId: ID!
    $organizationSlug: String!
    $content: String!
    $authorEmail: String!
  ) {
    createTaskComment(
      taskId: $taskId
      organizationSlug: $organizationSlug
      content: $content
      authorEmail: $authorEmail
    ) {
      success
      message
      comment {
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
  }
`;

// Batch Operations (for future use)
export const BATCH_UPDATE_TASKS = gql`
  mutation BatchUpdateTasks($updates: [TaskUpdateInput!]!) {
    batchUpdateTasks(updates: $updates) {
      success
      message
      updatedCount
      errors {
        taskId
        error
      }
    }
  }
`;

// Optimistic Update Fragments
export const TASK_FRAGMENT = gql`
  fragment TaskFragment on TaskType {
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
  }
`;

export const PROJECT_FRAGMENT = gql`
  fragment ProjectFragment on ProjectType {
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
`;

export const ORGANIZATION_FRAGMENT = gql`
  fragment OrganizationFragment on OrganizationType {
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
`;
