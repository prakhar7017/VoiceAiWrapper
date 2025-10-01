import React from 'react';
import { useUIState } from '../../store';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '../../lib/utils';
import Particles from '../Particles';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { sidebarCollapsed } = useUIState();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Particles Background */}
      <div className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }}>
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={800}
          particleSpread={2}
          speed={1.5}
          particleBaseSize={20}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Gradient Overlay */}
      <div 
        className="fixed inset-0 w-full h-full opacity-30"
        style={{ 
          background: 'radial-gradient(ellipse at center, transparent 0%, var(--bg-primary) 70%)',
          zIndex: 1
        }}
      />

      {/* Main Content */}
      <div className="relative" style={{ zIndex: 10 }}>
        <Sidebar />
        
        <div className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}>
          <Header />
          
          <main className="p-6 relative">
            <div className="relative z-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
