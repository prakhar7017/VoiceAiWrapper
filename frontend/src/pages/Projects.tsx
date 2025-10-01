import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects, useCreateProject } from '../hooks/useGraphQL';
import { useSelectedOrganization } from '../store';
import { formatDate, getStatusColor, calculateProgress, cn } from '../lib/utils';
import type { Project, ProjectStatus } from '../types';

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const progress = calculateProgress(project.completedTasksCount || 0, project.taskCount || 0);
  
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block modern-card hover:glow-hover transition-all duration-300 float"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold gradient-text mb-1">{project.name}</h3>
          <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
        </div>
        <span className={`ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {project.status.replace('_', ' ')}
        </span>
      </div>
      
      <div className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            <span>Progress</span>
            <span className="gradient-text font-semibold">{progress}%</span>
          </div>
          <div className="w-full rounded-full h-2" style={{ background: 'var(--bg-tertiary)' }}>
            <div
              className="h-2 rounded-full transition-all glow"
              style={{ width: `${progress}%`, background: 'var(--gradient-primary)' }}
            />
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-2 rounded" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="font-semibold gradient-text">{project.taskCount || 0}</div>
            <div style={{ color: 'var(--text-muted)' }}>Total Tasks</div>
          </div>
          <div className="text-center p-2 rounded" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="font-semibold gradient-text">{project.completedTasksCount || 0}</div>
            <div style={{ color: 'var(--text-muted)' }}>Completed</div>
          </div>
        </div>
        
        {/* Due Date */}
        {project.dueDate && (
          <div className="flex items-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="mr-1">📅</span>
            Due: {formatDate(project.dueDate)}
          </div>
        )}
        
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Created {formatDate(project.createdAt)}
        </div>
      </div>
    </Link>
  );
}

interface CreateProjectFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

function CreateProjectForm({ onSubmit, onCancel, loading }: CreateProjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE' as ProjectStatus,
    dueDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      dueDate: formData.dueDate || undefined,
    });
  };

  return (
    <div className="modern-card glow-hover">
      <h3 className="text-lg font-medium gradient-text mb-4">Create New Project</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Project Name *
          </label>
          <input
            type="text"
            id="name"
            required
            className="mt-1 block w-full rounded-md transition-all duration-200 focus:glow"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              padding: '8px 12px'
            }}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
            >
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Due Date
            </label>
            <input
              type="date"
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
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function Projects() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const selectedOrganization = useSelectedOrganization();
  const { projects, loading, error, refetch } = useProjects(
    selectedOrganization?.slug || '',
    {
      status: statusFilter || undefined,
      search: searchQuery || undefined,
    }
  );
  const { createProject, loading: creating } = useCreateProject();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreateProject = async (data: any) => {
    if (!selectedOrganization) return;
    
    try {
      const result = await createProject({
        organizationSlug: selectedOrganization.slug,
        ...data,
      });
      
      if (result?.success) {
        setShowCreateForm(false);
        refetch();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  if (!selectedOrganization) {
    return <div>No organization selected</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text float">Projects</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Manage your projects and track progress
          </p>
        </div>
        
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary inline-flex items-center glow-hover"
          >
            <span className="mr-2">+</span>
            New Project
          </button>
        )}
      </div>

      {/* Enhanced Filters */}
      <div className="modern-card">
        <div className="space-y-4">
          {/* Search and Status Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search projects by name, description..."
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
            <div className="sm:w-48">
              <select
                className="w-full rounded-md transition-all duration-200 focus:glow"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                  padding: '8px 12px'
                }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | '')}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Search Results Info */}
          {(searchQuery || statusFilter) && (
            <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span>
                {projects.length} project{projects.length !== 1 ? 's' : ''} found
                {searchQuery && ` for "${searchQuery}"`}
                {statusFilter && ` with status "${statusFilter}"`}
              </span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                }}
                className="gradient-text hover:glow-hover transition-all duration-200"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <CreateProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setShowCreateForm(false)}
          loading={creating}
        />
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 glow" style={{ border: '2px solid transparent', borderTop: '2px solid var(--accent-primary)' }}></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="mb-4" style={{ color: '#f5576c' }}>Failed to load projects</p>
          <button
            onClick={() => refetch()}
            className="btn-primary glow-hover"
          >
            Retry
          </button>
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project:Project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 modern-card">
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-lg font-medium gradient-text mb-2">
            {searchQuery || statusFilter ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            {searchQuery || statusFilter 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first project'
            }
          </p>
          {!searchQuery && !statusFilter && !showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary inline-flex items-center pulse-glow"
            >
              <span className="mr-2">+</span>
              Create Your First Project
            </button>
          )}
        </div>
      )}
    </div>
  );
}
