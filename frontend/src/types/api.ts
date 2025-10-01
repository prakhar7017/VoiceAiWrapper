// GraphQL Query and Mutation types for Apollo Client

// Query Variables
export interface GetOrganizationsVariables {}

export interface GetOrganizationVariables {
  slug: string;
}

export interface GetProjectsVariables {
  organizationSlug: string;
  status?: string;
  search?: string;
  orderBy?: string;
  limit?: number;
  offset?: number;
}

export interface GetProjectVariables {
  id: string;
  organizationSlug: string;
}

export interface GetTasksVariables {
  projectId: string;
  organizationSlug: string;
  status?: string;
  priority?: string;
  assigneeEmail?: string;
  search?: string;
  orderBy?: string;
  limit?: number;
  offset?: number;
}

export interface GetTaskVariables {
  id: string;
  organizationSlug: string;
}

export interface GetTaskCommentsVariables {
  taskId: string;
  organizationSlug: string;
}

// Mutation Variables
export interface CreateOrganizationVariables {
  name: string;
  contactEmail: string;
}

export interface CreateProjectVariables {
  organizationSlug: string;
  name: string;
  description?: string;
  status?: string;
  dueDate?: string;
}

export interface UpdateProjectVariables {
  id: string;
  organizationSlug: string;
  name?: string;
  description?: string;
  status?: string;
  dueDate?: string;
}

export interface CreateTaskVariables {
  projectId: string;
  organizationSlug: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assigneeEmail?: string;
  dueDate?: string;
}

export interface UpdateTaskVariables {
  id: string;
  organizationSlug: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assigneeEmail?: string;
  dueDate?: string;
}

export interface CreateTaskCommentVariables {
  taskId: string;
  organizationSlug: string;
  content: string;
  authorEmail: string;
}

// GraphQL Response types
export interface GraphQLError {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: string[];
  extensions?: Record<string, any>;
}

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: GraphQLError[];
  loading?: boolean;
  networkStatus?: number;
}

// Apollo Client cache types
export interface CacheConfig {
  typePolicies: Record<string, any>;
}

// HTTP Error types
export interface HTTPError extends Error {
  status?: number;
  statusText?: string;
  response?: Response;
}

// API Client configuration
export interface APIClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
}

// Pagination types
export interface PaginationInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
  totalCount?: number;
}

export interface Connection<T> {
  edges: Array<{
    node: T;
    cursor: string;
  }>;
  pageInfo: PaginationInfo;
}

// Real-time subscription types
export interface SubscriptionData<T = any> {
  data?: T;
  error?: GraphQLError;
}

export interface TaskUpdatedSubscription {
  taskUpdated: {
    id: string;
    status: string;
    updatedAt: string;
  };
}

export interface ProjectUpdatedSubscription {
  projectUpdated: {
    id: string;
    completionRate: number;
    updatedAt: string;
  };
}
