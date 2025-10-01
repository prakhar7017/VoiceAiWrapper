// Core entity types based on backend GraphQL schema
export interface Organization {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
  projectCount?: number;
  totalTasks?: number;
  completedTasks?: number;
}

export interface Project {
  id: string;
  organization: Organization;
  name: string;
  description: string;
  status: ProjectStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  completedTasksCount?: number;
  completionRate?: number;
}

export interface Task {
  id: string;
  project: Project;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeEmail: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
}

export interface TaskComment {
  id: string;
  task: Task;
  content: string;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
}

// Enum types
export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Form input types
export interface CreateOrganizationInput {
  name: string;
  contactEmail: string;
}

export interface CreateProjectInput {
  organizationSlug: string;
  name: string;
  description?: string;
  status?: ProjectStatus;
  dueDate?: string;
}

export interface UpdateProjectInput {
  id: string;
  organizationSlug: string;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  dueDate?: string;
}

export interface CreateTaskInput {
  projectId: string;
  organizationSlug: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeEmail?: string;
  dueDate?: string;
}

export interface UpdateTaskInput {
  id: string;
  organizationSlug: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeEmail?: string;
  dueDate?: string;
}

export interface CreateTaskCommentInput {
  taskId: string;
  organizationSlug: string;
  content: string;
  authorEmail: string;
}

// Query filter types
export interface ProjectFilters {
  organizationSlug: string;
  status?: ProjectStatus;
  search?: string;
  orderBy?: string;
  limit?: number;
  offset?: number;
}

export interface TaskFilters {
  projectId: string;
  organizationSlug: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeEmail?: string;
  search?: string;
  orderBy?: string;
  limit?: number;
  offset?: number;
}

// API Response types
export interface MutationResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface CreateOrganizationResponse extends MutationResponse {
  organization?: Organization;
}

export interface CreateProjectResponse extends MutationResponse {
  project?: Project;
}

export interface UpdateProjectResponse extends MutationResponse {
  project?: Project;
}

export interface CreateTaskResponse extends MutationResponse {
  task?: Task;
}

export interface UpdateTaskResponse extends MutationResponse {
  task?: Task;
}

export interface CreateTaskCommentResponse extends MutationResponse {
  comment?: TaskComment;
}

// UI State types
export interface UIState {
  loading: boolean;
  error: string | null;
  selectedOrganization: Organization | null;
  selectedProject: Project | null;
  selectedTask: Task | null;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T = unknown> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Navigation types
export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

// Dashboard statistics types
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Theme and UI preferences
export interface UIPreferences {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  compactMode: boolean;
}

// Search and filter state
export interface SearchState {
  query: string;
  filters: Record<string, unknown>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

// Export all types for easy importing
// Note: api.ts and components.ts are imported separately when needed
