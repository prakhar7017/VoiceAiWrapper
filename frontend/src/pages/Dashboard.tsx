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
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
              <span className="text-lg">{icon}</span>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-center text-lg font-medium text-gray-900">
                {value}
                {subtitle && (
                  <span className="text-sm text-gray-500 ml-1">{subtitle}</span>
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
      className="project-card block bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      style={{ cursor: 'pointer', textDecoration: 'none', pointerEvents: 'auto' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 truncate">{project.name}</h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {project.status.replace('_', ' ')}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
      
      <div className="space-y-3">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>{project.taskCount || 0} tasks</span>
          <span>{project.completedTasksCount || 0} completed</span>
        </div>
        
        {project.dueDate && (
          <div className="text-sm text-gray-500">
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load dashboard data</p>
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
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
          <h2 className="text-lg font-medium text-gray-900">Recent Projects</h2>
          <div>
          <Link
            to="/projects"
            onClick={() => console.log('View all projects clicked')}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
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
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first project</p>
            <Link
              to="/projects"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Project
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/projects"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-blue-600 text-lg">📁</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Manage Projects</h3>
              <p className="text-sm text-gray-500">View and organize projects</p>
            </div>
          </Link>
          
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-green-600 text-lg">📋</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">View All Tasks</h3>
              <p className="text-sm text-gray-500">See tasks across projects</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-purple-600 text-lg">📊</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">View Reports</h3>
              <p className="text-sm text-gray-500">Analyze project performance</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
