# GraphQL API Documentation

## Endpoint
- **GraphQL Endpoint**: `http://localhost:8000/graphql/`
- **GraphQL Playground**: `http://localhost:8000/graphql/` (with GraphiQL interface)

## Authentication
Currently, the API doesn't require authentication. All operations are performed using email addresses for identification.

## Multi-Tenancy
All operations require an `organizationSlug` parameter to ensure proper data isolation between organizations.

## Schema Overview

### Types

#### Organization
```graphql
type OrganizationType {
  id: ID!
  name: String!
  slug: String!
  contactEmail: String!
  createdAt: DateTime!
  updatedAt: DateTime!
  projectCount: Int
  totalTasks: Int
  completedTasks: Int
}
```

#### Project
```graphql
type ProjectType {
  id: ID!
  organization: OrganizationType!
  name: String!
  description: String!
  status: String!
  dueDate: Date
  createdAt: DateTime!
  updatedAt: DateTime!
  taskCount: Int
  completedTasksCount: Int
  completionRate: Float
}
```

#### Task
```graphql
type TaskType {
  id: ID!
  project: ProjectType!
  title: String!
  description: String!
  status: String!
  priority: String!
  assigneeEmail: String!
  dueDate: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
  commentCount: Int
}
```

#### TaskComment
```graphql
type TaskCommentType {
  id: ID!
  task: TaskType!
  content: String!
  authorEmail: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

## Queries

### Get All Organizations
```graphql
query {
  organizations {
    id
    name
    slug
    contactEmail
    projectCount
    totalTasks
    completedTasks
  }
}
```

### Get Organization by Slug
```graphql
query GetOrganization($slug: String!) {
  organization(slug: $slug) {
    id
    name
    slug
    contactEmail
    projectCount
  }
}
```

### Get Projects for Organization
```graphql
query GetProjects($organizationSlug: String!, $status: String) {
  projects(organizationSlug: $organizationSlug, status: $status) {
    id
    name
    description
    status
    dueDate
    taskCount
    completedTasksCount
    completionRate
  }
}
```

### Get Single Project
```graphql
query GetProject($id: ID!, $organizationSlug: String!) {
  project(id: $id, organizationSlug: $organizationSlug) {
    id
    name
    description
    status
    dueDate
    taskCount
    completionRate
  }
}
```

### Get Tasks for Project
```graphql
query GetTasks($projectId: ID!, $organizationSlug: String!, $status: String) {
  tasks(projectId: $projectId, organizationSlug: $organizationSlug, status: $status) {
    id
    title
    description
    status
    priority
    assigneeEmail
    dueDate
    commentCount
  }
}
```

### Get Single Task
```graphql
query GetTask($id: ID!, $organizationSlug: String!) {
  task(id: $id, organizationSlug: $organizationSlug) {
    id
    title
    description
    status
    priority
    assigneeEmail
    dueDate
    project {
      id
      name
    }
  }
}
```

### Get Comments for Task
```graphql
query GetTaskComments($taskId: ID!, $organizationSlug: String!) {
  taskComments(taskId: $taskId, organizationSlug: $organizationSlug) {
    id
    content
    authorEmail
    createdAt
  }
}
```

## Mutations

### Create Organization
```graphql
mutation CreateOrganization($name: String!, $contactEmail: String!) {
  createOrganization(name: $name, contactEmail: $contactEmail) {
    success
    message
    organization {
      id
      name
      slug
      contactEmail
    }
  }
}
```

### Create Project
```graphql
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
    }
  }
}
```

### Update Project
```graphql
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
    }
  }
}
```

### Create Task
```graphql
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
    }
  }
}
```

### Update Task
```graphql
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
    }
  }
}
```

### Add Comment to Task
```graphql
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
    }
  }
}
```

## Status Values

### Project Status
- `ACTIVE` - Project is currently active
- `COMPLETED` - Project has been completed
- `ON_HOLD` - Project is temporarily paused
- `CANCELLED` - Project has been cancelled

### Task Status
- `TODO` - Task is not started
- `IN_PROGRESS` - Task is currently being worked on
- `DONE` - Task has been completed
- `BLOCKED` - Task is blocked by dependencies

### Task Priority
- `LOW` - Low priority task
- `MEDIUM` - Medium priority task (default)
- `HIGH` - High priority task
- `URGENT` - Urgent task requiring immediate attention

## Error Handling

All mutations return a response with:
- `success`: Boolean indicating if the operation was successful
- `message`: Human-readable message describing the result
- `[object]`: The created/updated object (if successful)

Example error response:
```json
{
  "data": {
    "createProject": {
      "success": false,
      "message": "Organization not found",
      "project": null
    }
  }
}
```

## Sample Queries

### Get Dashboard Data for Organization
```graphql
query GetDashboard($organizationSlug: String!) {
  organization(slug: $organizationSlug) {
    name
    projectCount
    totalTasks
    completedTasks
  }
  projects(organizationSlug: $organizationSlug) {
    id
    name
    status
    taskCount
    completedTasksCount
    completionRate
    dueDate
  }
}
```

### Get Project Details with Tasks
```graphql
query GetProjectDetails($projectId: ID!, $organizationSlug: String!) {
  project(id: $projectId, organizationSlug: $organizationSlug) {
    id
    name
    description
    status
    dueDate
    completionRate
  }
  tasks(projectId: $projectId, organizationSlug: $organizationSlug) {
    id
    title
    status
    priority
    assigneeEmail
    dueDate
    commentCount
  }
}
```

### Get Task with Comments
```graphql
query GetTaskDetails($taskId: ID!, $organizationSlug: String!) {
  task(id: $taskId, organizationSlug: $organizationSlug) {
    id
    title
    description
    status
    priority
    assigneeEmail
    dueDate
    project {
      id
      name
    }
  }
  taskComments(taskId: $taskId, organizationSlug: $organizationSlug) {
    id
    content
    authorEmail
    createdAt
  }
}
```
