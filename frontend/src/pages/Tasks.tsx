import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTasks, useProject } from '../hooks/useGraphQL';
import { useSelectedOrganization } from '../store';
import { formatDate, getStatusColor, getPriorityColor, groupBy } from '../lib/utils';
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
          {(task.commentCount || 0) > 0 && (
            <span>💬 {task.commentCount || 0}</span>
          )}
        </div>
        {task.dueDate && (
          <span>📅 {formatDate(task.dueDate)}</span>
        )}
      </div>
    </Link>
  );
}

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  count: number;
  color: string;
}

function TaskColumn({ title, tasks, count, color }: TaskColumnProps) {
  return (
    <div className="modern-card" style={{ background: 'var(--bg-secondary)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium gradient-text">{title}</h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
          {count}
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
          No tasks
        </div>
      )}
    </div>
  );
}

export function Tasks() {
  const { projectId } = useParams<{ projectId: string }>();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');

  const selectedOrganization = useSelectedOrganization();

  const { project } = useProject(
    projectId || '',
    selectedOrganization?.slug || ''
  );

  const { tasks, loading, error } = useTasks(
    projectId || '',
    selectedOrganization?.slug || '',
    {
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      search: searchQuery || undefined,
    }
  );

  if (!selectedOrganization || !projectId) {
    return <div>Invalid project</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 glow" style={{ border: '2px solid transparent', borderTop: '2px solid var(--accent-primary)' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p style={{ color: '#f5576c' }}>Failed to load tasks</p>
      </div>
    );
  }

  const tasksByStatus = groupBy(tasks, 'status');

  const statusColumns = [
    { key: 'TODO', title: 'To Do', color: 'bg-gray-100 text-gray-800' },
    { key: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { key: 'DONE', title: 'Done', color: 'bg-green-100 text-green-800' },
    { key: 'BLOCKED', title: 'Blocked', color: 'bg-red-100 text-red-800' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text float">Tasks</h1>
          {project && (
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Link to={`/projects/${project.id}`} className="gradient-text hover:glow-hover transition-all duration-200">
                {project.name}
              </Link>
              {' '} • {tasks.length} tasks
            </p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex rounded-md">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-2 text-sm font-medium rounded-l-md transition-all duration-200 ${
                viewMode === 'board'
                  ? 'btn-primary'
                  : 'hover:glow-hover'
              }`}
              style={{
                background: viewMode === 'board' ? 'var(--gradient-primary)' : 'var(--bg-tertiary)',
                color: viewMode === 'board' ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium rounded-r-md transition-all duration-200 ${
                viewMode === 'list'
                  ? 'btn-primary'
                  : 'hover:glow-hover'
              }`}
              style={{
                background: viewMode === 'list' ? 'var(--gradient-primary)' : 'var(--bg-tertiary)',
                color: viewMode === 'list' ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="modern-card">
        <div className="space-y-4">
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search tasks by title, description, assignee..."
                className="w-full pl-10 pr-3 py-2 rounded-md transition-all duration-200 focus:glow"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-40">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Status</label>
              <select
                className="w-full rounded-md transition-all duration-200 focus:glow"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                  padding: '8px 12px'
                }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
              >
                <option value="">All Statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>

            <div className="sm:w-40">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Priority</label>
              <select
                className="w-full rounded-md transition-all duration-200 focus:glow"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                  padding: '8px 12px'
                }}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || statusFilter || priorityFilter) && (
            <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-primary)' }}>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
                {searchQuery && ` for "${searchQuery}"`}
                {statusFilter && ` with status "${statusFilter}"`}
                {priorityFilter && ` with priority "${priorityFilter}"`}
              </span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                  setPriorityFilter('');
                }}
                className="gradient-text hover:glow-hover transition-all duration-200 text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tasks Display */}
      {tasks.length > 0 ? (
        viewMode === 'board' ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {statusColumns.map((column) => (
              <TaskColumn
                key={column.key}
                title={column.title}
                tasks={tasksByStatus[column.key] || []}
                count={(tasksByStatus[column.key] || []).length}
                color={column.color}
              />
            ))}
          </div>
        ) : (
          <div className="modern-card">
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <h3 className="text-lg font-medium gradient-text">All Tasks</h3>
            </div>
            <div style={{ borderColor: 'var(--border-primary)' }}>
              {tasks.map((task, index) => (
                <div key={task.id} className={`p-6 hover:glow-hover transition-all duration-200 ${index > 0 ? 'border-t' : ''}`} style={{ borderColor: 'var(--border-primary)' }}>
                  <TaskCard task={task} />
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-12 modern-card">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium gradient-text mb-2">
            {searchQuery || statusFilter || priorityFilter ? 'No tasks found' : 'No tasks yet'}
          </h3>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            {searchQuery || statusFilter || priorityFilter
              ? 'Try adjusting your search or filters'
              : 'Tasks will appear here once they are created'
            }
          </p>
          {project && (
            <Link
              to={`/projects/${project.id}`}
              className="btn-primary inline-flex items-center glow-hover"
            >
              ← Back to Project
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
