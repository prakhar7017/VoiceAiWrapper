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
      'sidebar fixed inset-y-0 left-0 z-50 glass backdrop-blur-md transition-all duration-300',
      ui.sidebarCollapsed ? 'w-16' : 'w-64'
    )}
    style={{ 
      background: 'rgba(26, 26, 26, 0.9)',
      borderRight: '1px solid var(--border-primary)',
      boxShadow: '0 0 30px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        {!ui.sidebarCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center glow-hover" style={{ background: 'var(--gradient-primary)' }}>
              <span className="text-white font-bold text-sm">PM</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Project Manager</h1>
              <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{selectedOrganization.name}</p>
            </div>
          </div>
        )}
        
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md transition-all duration-200 hover:glow-hover"
          style={{ 
            color: 'var(--text-muted)',
            background: 'var(--bg-hover)'
          }}
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
                      ? 'glow'
                      : 'hover:glow-hover'
                  )}
                  style={{ 
                    cursor: 'pointer', 
                    textDecoration: 'none', 
                    pointerEvents: 'auto',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--bg-hover)' : 'transparent'
                  }}
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
        <div className="absolute bottom-0 left-0 right-0 p-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <button 
            onClick={() => {
              setSelectedOrganization(null);
              navigate('/organizations');
            }}
            className="w-full flex items-center space-x-3 p-2 rounded-md transition-all duration-200 hover:glow-hover"
            style={{ background: 'var(--bg-hover)' }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {selectedOrganization.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {selectedOrganization.name}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                Switch organization
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
