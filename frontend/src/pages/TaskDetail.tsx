import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTask, useTaskComments, useCreateTaskComment, useUpdateTask } from '../hooks/useGraphQL';
import { useSelectedOrganization } from '../store';
import { formatDate, formatRelativeTime, getStatusColor, getPriorityColor, cn } from '../lib/utils';
import type { TaskStatus, TaskPriority, TaskComment, Task } from '../types';

interface CommentItemProps {
  comment: TaskComment;
}

function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="flex space-x-3">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-gray-600 text-sm font-medium">
            {comment.authorEmail.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">{comment.authorEmail}</span>
          <span className="text-xs text-gray-500">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</div>
      </div>
    </div>
  );
}

interface CommentFormProps {
  onSubmit: (data: { content: string; authorEmail: string }) => void;
  loading?: boolean;
}

function CommentForm({ onSubmit, loading }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && authorEmail.trim()) {
      onSubmit({ content: content.trim(), authorEmail: authorEmail.trim() });
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="authorEmail" className="block text-sm font-medium text-gray-700">
          Your Email
        </label>
        <input
          type="email"
          id="authorEmail"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={authorEmail}
          onChange={(e) => setAuthorEmail(e.target.value)}
          placeholder="your.email@example.com"
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Comment
        </label>
        <textarea
          id="content"
          rows={3}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !content.trim() || !authorEmail.trim()}
          className={cn(
            'px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700',
            (loading || !content.trim() || !authorEmail.trim()) && 'opacity-50 cursor-not-allowed'
          )}
        >
          {loading ? 'Adding...' : 'Add Comment'}
        </button>
      </div>
    </form>
  );
}

interface TaskEditFormProps {
  task: Task;
  onSubmit: (data: unknown) => void;
  onCancel: () => void;
  loading?: boolean;
}

function TaskEditForm({ task, onSubmit, onCancel, loading }: TaskEditFormProps) {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status as TaskStatus,
    priority: task.priority as TaskPriority,
    assigneeEmail: task.assigneeEmail || '',
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
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
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Task</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Task Title *
          </label>
          <input
            type="text"
            id="title"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              id="priority"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            <label htmlFor="assigneeEmail" className="block text-sm font-medium text-gray-700">
              Assignee Email
            </label>
            <input
              type="email"
              id="assigneeEmail"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.assigneeEmail}
              onChange={(e) => setFormData({ ...formData, assigneeEmail: e.target.value })}
            />
          </div>
          
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="datetime-local"
              id="dueDate"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={cn(
              'px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700',
              loading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function TaskDetail() {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const selectedOrganization = useSelectedOrganization();
  
  const { task, loading: taskLoading, error: taskError, refetch: refetchTask } = useTask(
    taskId || '',
    selectedOrganization?.slug || ''
  );
  
  const { comments, loading: commentsLoading, refetch: refetchComments } = useTaskComments(
    taskId || '',
    selectedOrganization?.slug || ''
  );
  
  const { createTaskComment, loading: creatingComment } = useCreateTaskComment();
  const { updateTask, loading: updatingTask } = useUpdateTask();

  const handleAddComment = async (data: { content: string; authorEmail: string }) => {
    if (!selectedOrganization || !taskId) return;
    
    const { content, authorEmail } = data;
    
    try {
      const result = await createTaskComment({
        taskId,
        organizationSlug: selectedOrganization.slug,
        content,
        authorEmail,
      });
      
      if (result?.success) {
        refetchComments();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateTask = async (data: any) => {
    if (!selectedOrganization || !taskId) return;
    
    try {
      const result = await updateTask({
        id: taskId,
        organizationSlug: selectedOrganization.slug,
        ...data,
      });
      
      if (result?.success) {
        setIsEditing(false);
        refetchTask();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  if (!selectedOrganization || !projectId || !taskId) {
    return <div>Invalid task</div>;
  }

  if (taskLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (taskError || !task) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load task</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link to="/projects" className="text-gray-400 hover:text-gray-500">
              Projects
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="text-gray-400 mx-2">/</span>
              <Link
                to={`/projects/${task.project.id}`}
                className="text-gray-400 hover:text-gray-500"
              >
                {task.project.name}
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="text-gray-400 mx-2">/</span>
              <span className="text-gray-900">{task.title}</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Task Details */}
      {isEditing ? (
        <TaskEditForm
          task={task}
          onSubmit={handleUpdateTask}
          onCancel={() => setIsEditing(false)}
          loading={updatingTask}
        />
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h1>
              {task.description && (
                <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
              )}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="ml-4 px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Edit
            </button>
          </div>
          
          {/* Task Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Priority</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </dd>
            </div>
            
            {task.assigneeEmail && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Assignee</dt>
                <dd className="mt-1 text-sm text-gray-900">{task.assigneeEmail}</dd>
              </div>
            )}
            
            {task.dueDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(task.dueDate)}</dd>
              </div>
            )}
          </div>
          
          {/* Task Info */}
          <div className="text-sm text-gray-500 border-t pt-4">
            <p>Created {formatDate(task.createdAt)}</p>
            {task.updatedAt !== task.createdAt && (
              <p>Last updated {formatRelativeTime(task.updatedAt)}</p>
            )}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Comments ({comments.length})
        </h2>
        
        {/* Add Comment Form */}
        <div className="mb-6">
          <CommentForm onSubmit={handleAddComment} loading={creatingComment} />
        </div>
        
        {/* Comments List */}
        {commentsLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No comments yet</p>
            <p className="text-sm">Be the first to add a comment!</p>
          </div>
        )}
      </div>
    </div>
  );
}
