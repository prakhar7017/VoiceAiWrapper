import { Link, useLocation } from 'react-router-dom';
import { useSelectedOrganization } from '../../store';

const breadcrumbMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/organizations': 'Organizations',
  '/organizations/new': 'Create Organization',
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
      
      // Handle dynamic segments
      if (segment.match(/^[0-9]+$/)) {
        name = `#${segment}`;
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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={breadcrumb.href}>
                <div className="flex items-center">
                  {index > 0 && (
                    <svg
                      className="flex-shrink-0 h-5 w-5 text-gray-400 mr-4"
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
                    <span className="text-sm font-medium text-gray-900">
                      {breadcrumb.name}
                    </span>
                  ) : (
                    <Link
                      to={breadcrumb.href}
                      className="text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer"
                      style={{ cursor: 'pointer', textDecoration: 'none' }}
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
