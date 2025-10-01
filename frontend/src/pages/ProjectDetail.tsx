import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject, useTasks, useCreateTask } from '../hooks/useGraphQL';
import { useSelectedOrganization } from '../store';
import { formatDate, getStatusColor, getPriorityColor, calculateProgress, cn } from '../lib/utils';
import type { Task, TaskStatus, TaskPriority } from '../types';

interface TaskCardProps {
  task: Task;
}

function TaskCard({ task }: TaskCardProps) {
  return (
    <Link
      to={`/projects/${task.project.id}/tasks/${task.id}`}
      className="block modern-card hover:glow-hover transition-all duration-300 float"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-medium gradient-text flex-1">{task.title}</h4>
        <div className="flex space-x-2 ml-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      {task.description && (
        <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{task.description}</p>
      )}
      
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center space-x-4">
          {task.assigneeEmail && (
            <span>👤 {task.assigneeEmail}</span>
          )}
          {task.commentCount && task.commentCount > 0 && (
            <span>💬 {task.commentCount}</span>
          )}
        </div>
        {task.dueDate && (
          <span>📅 {formatDate(task.dueDate)}</span>
        )}
      </div>
    </Link>
  );
}

interface CreateTaskFormProps {  projectId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

function CreateTaskForm({onSubmit, onCancel, loading }: CreateTaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO' as TaskStatus,
    priority: 'MEDIUM' as TaskPriority,
    assigneeEmail: '',
    dueDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      dueDate: formData.dueDate || undefined,
      assigneeEmail: formData.assigneeEmail || undefined,
    });
  };

  return (
    <div className="modern-card">
      <h3 className="text-lg font-medium gradient-text mb-4">Create New Task</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Task Title *
          </label>
          <input
            type="text"
            id="title"
            required
            className="mt-1 block w-full rounded-md transition-all duration-200 focus:glow"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              padding: '8px 12px'
            }}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="mt-1 block w-full rounded-md transition-all duration-200 focus:glow"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              padding: '8px 12px'
            }}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Status
            </label>
            <select
              id="status"
              className="mt-1 block w-full rounded-md transition-all duration-200 focus:glow"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
                padding: '8px 12px'
              }}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="priority" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Priority
            </label>
            <select
              id="priority"
              className="mt-1 block w-full rounded-md transition-all duration-200 focus:glow"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
                padding: '8px 12px'
              }}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="assigneeEmail" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Assignee Email
            </label>
            <input
              type="email"
              id="assigneeEmail"
              className="mt-1 block w-full rounded-md transition-all duration-200 focus:glow"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
                padding: '8px 12px'
              }}
              value={formData.assigneeEmail}
              onChange={(e) => setFormData({ ...formData, assigneeEmail: e.target.value })}
            />
          </div>
          
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Due Date
            </label>
            <input
              type="datetime-local"
              id="dueDate"
              className="mt-1 block w-full rounded-md transition-all duration-200 focus:glow"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
                padding: '8px 12px'
              }}
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:glow-hover"
            style={{
              color: 'var(--text-secondary)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={cn(
              'btn-primary',
              loading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const selectedOrganization = useSelectedOrganization();
  
  const { project, loading: projectLoading, error: projectError } = useProject(
    projectId || '',
    selectedOrganization?.slug || ''
  );
  
  const { tasks, loading: tasksLoading, refetch: refetchTasks } = useTasks(
    projectId || '',
    selectedOrganization?.slug || ''
  );
  
  const { createTask, loading: creating } = useCreateTask();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreateTask = async (data: any) => {
    if (!selectedOrganization || !projectId) return;
    
    try {
      const result = await createTask({
        projectId,
        organizationSlug: selectedOrganization.slug,
        ...data,
      });
      
      if (result?.success) {
        setShowCreateTask(false);
        refetchTasks();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  if (!selectedOrganization || !projectId) {
    return <div>Invalid project</div>;
  }

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load project</p>
      </div>
    );
  }

  const progress = calculateProgress(project.completedTasksCount || 0, project.taskCount || 0);
  const tasksByStatus = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="modern-card float">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold gradient-text mb-2">{project.name}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
          </div>
          <span className={`ml-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
            {project.status.replace('_', ' ')}
          </span>
        </div>
        
        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="text-2xl font-bold gradient-text">{project.taskCount || 0}</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Tasks</div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="text-2xl font-bold" style={{ color: '#3b82f6' }}>{tasksByStatus.IN_PROGRESS || 0}</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>In Progress</div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="text-2xl font-bold" style={{ color: '#10b981' }}>{project.completedTasksCount || 0}</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Completed</div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{progress}%</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Progress</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            <span>Overall Progress</span>
            <span className="gradient-text font-semibold">{progress}%</span>
          </div>
          <div className="w-full rounded-full h-3" style={{ background: 'var(--bg-tertiary)' }}>
            <div
              className="h-3 rounded-full transition-all glow"
              style={{ width: `${progress}%`, background: 'var(--gradient-primary)' }}
            />
          </div>
        </div>
        
        {/* Project Info */}
        <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center space-x-6">
            <span>Created {formatDate(project.createdAt)}</span>
            {project.dueDate && (
              <span>Due {formatDate(project.dueDate)}</span>
            )}
          </div>
          <Link
            to="/projects"
            className="gradient-text hover:glow-hover transition-all duration-200"
          >
            ← Back to Projects
          </Link>
        </div>
      </div>

      {/* Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold gradient-text">Tasks</h2>
          {!showCreateTask && (
            <button
              onClick={() => setShowCreateTask(true)}
              className="btn-primary inline-flex items-center glow-hover"
            >
              <span className="mr-2">+</span>
              New Task
            </button>
          )}
        </div>

        {/* Create Task Form */}
        {showCreateTask && (
          <div className="mb-6">
            <CreateTaskForm
              projectId={projectId}
              onSubmit={handleCreateTask}
              onCancel={() => setShowCreateTask(false)}
              loading={creating}
            />
          </div>
        )}

        {/* Tasks List */}
        {tasksLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : tasks.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 modern-card">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-grey-900 mb-2">No tasks yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first task</p>
            {!showCreateTask && (
              <button
                onClick={() => setShowCreateTask(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <span className="mr-2">+</span>
                Create First Task
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
