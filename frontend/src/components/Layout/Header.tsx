import { useLocation, Link } from 'react-router-dom';
import { useSelectedOrganization } from '../../store';

const breadcrumbMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/organizations': 'Organizations',
  '/organizations/:id': 'Organization',
  '/organizations/:id/projects': 'Projects',
  '/organizations/:id/projects/new': 'Create Project',
  '/organizations/:id/projects/:projectId': 'Project',
};

export function Header() {
  const location = useLocation();
  const selectedOrganization = useSelectedOrganization();

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    if (selectedOrganization) {
      breadcrumbs.push({
        name: selectedOrganization.name,
        href: '/dashboard',
        current: false,
      });
    }

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      let name = breadcrumbMap[currentPath] || segment;
      
      // Handle dynamic segments - skip numeric IDs but keep meaningful segments
      if (segment.match(/^[0-9]+$/)) {
        // Skip numeric IDs in breadcrumbs to avoid showing #18, etc.
        return;
      }

      // Special handling for project pages
      if (segment === 'projects' && pathSegments.includes('projects')) {
        name = 'Projects';
      }

      breadcrumbs.push({
        name,
        href: currentPath,
        current: isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header 
      className="glass backdrop-blur-md relative z-20"
      style={{ 
        background: 'rgba(26, 26, 26, 0.8)',
        borderBottom: '1px solid var(--border-primary)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="px-6 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={breadcrumb.href}>
                <div className="flex items-center">
                  {index > 0 && (
                    <svg
                      className="flex-shrink-0 h-5 w-5 mr-4"
                      style={{ color: 'var(--text-muted)' }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {breadcrumb.current ? (
                    <span 
                      className="text-sm font-medium gradient-text"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {breadcrumb.name}
                    </span>
                  ) : (
                    <Link
                      to={breadcrumb.href}
                      className="text-sm font-medium cursor-pointer transition-all duration-200 hover:glow-hover"
                      style={{ 
                        cursor: 'pointer', 
                        textDecoration: 'none',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {breadcrumb.name}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </header>
  );
}
