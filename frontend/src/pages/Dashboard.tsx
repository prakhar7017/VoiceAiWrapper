import { Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useGraphQL';
import { useSelectedOrganization } from '../store';
import { formatDate, getStatusColor, calculateProgress } from '../lib/utils';
import type { Project } from '../types';

interface StatsCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: string;
  color?: string;
}

function StatsCard({ title, value, subtitle, icon, color = 'blue' }: StatsCardProps) {
  const gradients = {
    blue: 'var(--gradient-primary)',
    green: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    yellow: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    red: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  };

  return (
    <div className="modern-card hover:glow-hover float">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center glow-hover"
              style={{ background: gradients[color as keyof typeof gradients] }}
            >
              <span className="text-lg text-white">{icon}</span>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{title}</dt>
              <dd className="flex items-center text-xl font-bold gradient-text">
                {value}
                {subtitle && (
                  <span className="text-sm font-normal ml-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</span>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const progress = calculateProgress(project.completedTasksCount || 0, project.taskCount || 0);
  
  const handleClick = (e: React.MouseEvent) => {
    console.log('Project card clicked:', project.name);
    console.log('Event:', e);
  };
  
  return (
    <Link
      to={`/projects/${project.id}`}
      onClick={handleClick}
      className="project-card block modern-card hover:glow-hover transition-all duration-300 cursor-pointer float"
      style={{ cursor: 'pointer', textDecoration: 'none', pointerEvents: 'auto' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium gradient-text truncate">{project.name}</h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {project.status.replace('_', ' ')}
        </span>
      </div>
      
      <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
      
      <div className="space-y-3">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
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
        <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span>{project.taskCount || 0} tasks</span>
          <span>{project.completedTasksCount || 0} completed</span>
        </div>
        
        {project.dueDate && (
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Due: {formatDate(project.dueDate)}
          </div>
        )}
      </div>
    </Link>
  );
}

export function Dashboard() {
  const selectedOrganization = useSelectedOrganization();
  const { organization, projects, loading, error } = useDashboard(selectedOrganization?.slug || '');

  if (!selectedOrganization) {
    return <div>No organization selected</div>;
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
        <p style={{ color: '#f5576c' }}>Failed to load dashboard data</p>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Projects',
      value: organization?.projectCount || 0,
      icon: '📁',
      color: 'blue',
    },
    {
      title: 'Total Tasks',
      value: organization?.totalTasks || 0,
      icon: '📋',
      color: 'green',
    },
    {
      title: 'Completed Tasks',
      value: organization?.completedTasks || 0,
      icon: '✅',
      color: 'green',
    },
    {
      title: 'Completion Rate',
      value: organization?.totalTasks 
        ? Math.round(((organization?.completedTasks || 0) / organization.totalTasks) * 100)
        : 0,
      subtitle: '%',
      icon: '📊',
      color: 'yellow',
    },
  ];

  return (
    <div className="dashboard-container space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text float">Dashboard</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Welcome back! Here's what's happening with {selectedOrganization.name}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold gradient-text">Recent Projects</h2>
          <div>
          <Link
            to="/projects"
            onClick={() => console.log('View all projects clicked')}
            className="text-sm font-medium gradient-text hover:glow-hover transition-all duration-200 cursor-pointer"
            style={{ cursor: 'pointer', textDecoration: 'none', pointerEvents: 'auto' }}
          >
            View all projects →
          </Link>
          </div>
        </div>
        
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 6).map((project:Project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 modern-card">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-lg font-medium gradient-text mb-2">No projects yet</h3>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Get started by creating your first project</p>
            <Link
              to="/projects"
              className="btn-primary inline-flex items-center pulse-glow"
            >
              Create Project
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="modern-card">
        <h2 className="text-xl font-semibold gradient-text mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/projects"
            className="flex items-center p-4 rounded-lg transition-all duration-300 hover:glow-hover"
            style={{ border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)' }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-4" style={{ background: 'var(--gradient-primary)' }}>
              <span className="text-white text-lg">📁</span>
            </div>
            <div>
              <h3 className="text-sm font-medium gradient-text">Manage Projects</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>View and organize projects</p>
            </div>
          </Link>
          
          <button className="flex items-center p-4 rounded-lg transition-all duration-300 hover:glow-hover text-left"
            style={{ border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-4" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <span className="text-white text-lg">📋</span>
            </div>
            <div>
              <h3 className="text-sm font-medium gradient-text">View All Tasks</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>See tasks across projects</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 rounded-lg transition-all duration-300 hover:glow-hover text-left"
            style={{ border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-4" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
              <span className="text-white text-lg">📊</span>
            </div>
            <div>
              <h3 className="text-sm font-medium gradient-text">View Reports</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Analyze project performance</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
