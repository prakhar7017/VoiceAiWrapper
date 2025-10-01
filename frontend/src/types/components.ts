import { type ReactNode } from 'react';
import {
  type Organization,
  type Project,
  type Task,
  type TaskComment,
  type ProjectStatus,
  type TaskStatus,
  type TaskPriority,
  type Notification,
  type BreadcrumbItem,
  type DashboardStats,
} from './index';

// Layout component props
export interface LayoutProps {
  children: ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  organizations: Organization[];
  selectedOrganization: Organization | null;
  onOrganizationSelect: (org: Organization) => void;
}

export interface HeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

// Organization component props
export interface OrganizationSelectorProps {
  organizations: Organization[];
  selected: Organization | null;
  onSelect: (org: Organization) => void;
  loading?: boolean;
}

export interface OrganizationCardProps {
  organization: Organization;
  onClick?: (org: Organization) => void;
  selected?: boolean;
}

export interface CreateOrganizationFormProps {
  onSubmit: (data: { name: string; contactEmail: string }) => void;
  loading?: boolean;
  error?: string;
}

// Project component props
export interface ProjectListProps {
  projects: Project[];
  loading?: boolean;
  error?: string;
  onProjectClick?: (project: Project) => void;
  onCreateProject?: () => void;
  filters?: {
    status?: ProjectStatus;
    search?: string;
  };
  onFiltersChange?: (filters: Record<string, unknown>) => void;
}

export interface ProjectCardProps {
  project: Project;
  onClick?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  showActions?: boolean;
}

export interface ProjectFormProps {
  project?: Project;
  organizationSlug: string;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

export interface ProjectStatsProps {
  project: Project;
  className?: string;
}

// Task component props
export interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  error?: string;
  onTaskClick?: (task: Task) => void;
  onCreateTask?: () => void;
  onTaskUpdate?: (task: Task, updates: Partial<Task>) => void;
  filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee?: string;
    search?: string;
  };
  onFiltersChange?: (filters: Record<string, unknown>) => void;
  groupBy?: 'status' | 'priority' | 'assignee' | 'none';
}

export interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onStatusChange?: (task: Task, status: TaskStatus) => void;
  showProject?: boolean;
  draggable?: boolean;
  onDragStart?: (task: Task) => void;
  onDragEnd?: () => void;
}

export interface TaskFormProps {
  task?: Task;
  projectId: string;
  organizationSlug: string;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

export interface TaskBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick?: (task: Task) => void;
  loading?: boolean;
}

export interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick?: (task: Task) => void;
}

// Comment component props
export interface CommentListProps {
  comments: TaskComment[];
  loading?: boolean;
  error?: string;
  onAddComment?: (content: string) => void;
  onEditComment?: (comment: TaskComment, content: string) => void;
  onDeleteComment?: (comment: TaskComment) => void;
}

export interface CommentItemProps {
  comment: TaskComment;
  onEdit?: (comment: TaskComment, content: string) => void;
  onDelete?: (comment: TaskComment) => void;
  currentUserEmail?: string;
}

export interface CommentFormProps {
  onSubmit: (content: string) => void;
  loading?: boolean;
  placeholder?: string;
  buttonText?: string;
}

// Dashboard component props
export interface DashboardProps {
  organization: Organization;
  stats: DashboardStats;
  recentProjects: Project[];
  recentTasks: Task[];
  loading?: boolean;
}

export interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
}

// Form component props
export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'date' | 'datetime-local';
  placeholder?: string;
  required?: boolean;
  error?: string;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  className?: string;
}

export interface FormProps {
  onSubmit: (data: Record<string, unknown>) => void;
  loading?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

// Filter component props
export interface FilterBarProps {
  filters: Record<string, unknown>;
  onFiltersChange: (filters: Record<string, unknown>) => void;
  onClearFilters: () => void;
  fields: FilterFieldConfig[];
}

export interface FilterFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

// Search component props
export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: (value: string) => void;
  loading?: boolean;
  className?: string;
}

// Pagination component props
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalItems?: number;
  showPageSize?: boolean;
  onPageSizeChange?: (size: number) => void;
}

// Modal component props
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

// Notification component props
export interface NotificationProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  autoHide?: boolean;
  duration?: number;
}

export interface NotificationListProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// Loading component props
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export interface LoadingSkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

// Error component props
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: Record<string, unknown>) => void;
}

export interface ErrorMessageProps {
  error: string | Error;
  onRetry?: () => void;
  className?: string;
}

// Table component props
export interface TableColumn<T = unknown> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = unknown> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: PaginationProps;
  onRowClick?: (record: T, index: number) => void;
  rowKey?: keyof T | ((record: T) => string);
  className?: string;
}
