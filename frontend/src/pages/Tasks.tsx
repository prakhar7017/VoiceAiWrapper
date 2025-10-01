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
      className="block bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 flex-1">{task.title}</h4>
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
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
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
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
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
        <div className="text-center py-8 text-gray-500 text-sm">
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load tasks</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          {project && (
            <p className="mt-1 text-sm text-gray-500">
              <Link to={`/projects/${project.id}`} className="text-blue-600 hover:text-blue-500">
                {project.name}
              </Link>
              {' '} • {tasks.length} tasks
            </p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'board'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
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
                className="w-full pl-10 pr-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">
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
                className="text-blue-600 hover:text-blue-500 text-sm"
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">All Tasks</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <div key={task.id} className="p-6 hover:bg-gray-50">
                  <TaskCard task={task} />
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || statusFilter || priorityFilter ? 'No tasks found' : 'No tasks yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter || priorityFilter
              ? 'Try adjusting your search or filters'
              : 'Tasks will appear here once they are created'}
          </p>
          {project && (
            <Link
              to={`/projects/${project.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              ← Back to Project
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
