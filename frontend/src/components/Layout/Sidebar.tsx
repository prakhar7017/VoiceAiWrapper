import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSelectedOrganization, useAppStore } from '../../store';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Projects', href: '/projects', icon: '📁' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedOrganization = useSelectedOrganization();
  const { ui, toggleSidebar, setSelectedOrganization } = useAppStore();

  if (!selectedOrganization) return null;

  return (
    <div className={cn(
      'sidebar fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300',
      ui.sidebarCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!ui.sidebarCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PM</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">Project Manager</h1>
              <p className="text-xs text-gray-500 truncate">{selectedOrganization.name}</p>
            </div>
          </div>
        )}
        
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          {ui.sidebarCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <li key={item.name}>
                <div>
                <NavLink
                  to={item.href}
                  onClick={() => console.log('Sidebar link clicked:', item.name)}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  style={{ cursor: 'pointer', textDecoration: 'none', pointerEvents: 'auto' }}
                  title={ui.sidebarCollapsed ? item.name : undefined}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {!ui.sidebarCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </NavLink>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Organization switcher */}
      {!ui.sidebarCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button 
            onClick={() => {
              setSelectedOrganization(null);
              navigate('/organizations');
            }}
            className="w-full flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm font-medium">
                {selectedOrganization.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedOrganization.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                Switch organization
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
