import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizations, useCreateOrganization } from '../hooks/useGraphQL';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';
import Particles from '../components/Particles';
import type { Organization } from '../types';

interface OrganizationCardProps {
  organization: Organization;
  onSelect: (org: Organization) => void;
}

function OrganizationCard({ organization, onSelect }: OrganizationCardProps) {
  const handleClick = () => {
    console.log('Organization card clicked:', organization.name);
    onSelect(organization);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full modern-card hover:glow-hover transition-all duration-300 cursor-pointer text-left float"
      style={{ cursor: 'pointer' }}
    >
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center glow-hover" style={{ background: 'var(--gradient-primary)' }}>
          <span className="text-white font-semibold text-lg">
            {organization.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium gradient-text">{organization.name}</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{organization.contactEmail}</p>
        </div>
        <div className="text-right">
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {organization.projectCount || 0} projects
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {organization.totalTasks || 0} tasks
          </div>
        </div>
      </div>
    </button>
  );
}

interface CreateOrganizationFormProps {
  onSubmit: (data: { name: string; contactEmail: string }) => void;
  onCancel: () => void;
  loading?: boolean;
}

function CreateOrganizationForm({ onSubmit, onCancel, loading }: CreateOrganizationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modern-card glow-hover">
      <h3 className="text-lg font-medium gradient-text mb-4">Create New Organization</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Organization Name
          </label>
          <input
            type="text"
            id="name"
            required
            className="mt-1 w-full px-3 py-2 rounded-md transition-all duration-200 focus:glow"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)'
            }}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        
        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Contact Email
          </label>
          <input
            type="email"
            id="contactEmail"
            required
            className="mt-1 w-full px-3 py-2 rounded-md transition-all duration-200 focus:glow"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)'
            }}
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:glow-hover cursor-pointer"
            style={{
              color: 'var(--text-secondary)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              cursor: 'pointer'
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
            style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Creating...' : 'Create Organization'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function Organizations() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();
  const { organizations, loading, error, refetch } = useOrganizations();
  const { createOrganization, loading: creating } = useCreateOrganization();
  const { setSelectedOrganization } = useAppStore();

  const handleSelectOrganization = (org: Organization) => {
    console.log('handleSelectOrganization called with:', org);
    setSelectedOrganization(org);
    // Navigate to dashboard after selecting organization
    navigate('/dashboard');
  };

  const handleCreateOrganization = async (data: { name: string; contactEmail: string }) => {
    try {
      const result = await createOrganization(data);
      if (result?.success) {
        setShowCreateForm(false);
        refetch();
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <div className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }}>
          <Particles
            particleColors={['#ffffff', '#ffffff']}
            particleCount={300}
            particleSpread={2}
            speed={0.3}
            particleBaseSize={20}
            moveParticlesOnHover={true}
            alphaParticles={false}
            disableRotation={false}
          />
        </div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 mx-auto glow" style={{ border: '2px solid transparent', borderTop: '2px solid var(--accent-primary)' }}></div>
          <p className="mt-4 gradient-text">Loading organizations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <div className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }}>
          <Particles
            particleColors={['#ffffff', '#ffffff']}
            particleCount={300}
            particleSpread={2}
            speed={0.3}
            particleBaseSize={20}
            moveParticlesOnHover={true}
            alphaParticles={false}
            disableRotation={false}
          />
        </div>
        <div className="text-center relative z-10">
          <p className="mb-4" style={{ color: '#f5576c' }}>Failed to load organizations</p>
          <button
            onClick={() => refetch()}
            className="btn-primary glow-hover"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="organization-page min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Particles Background */}
      <div className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }}>
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={800}
          particleSpread={2}
          speed={1}
          particleBaseSize={20}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Gradient Overlay */}
      <div 
        className="fixed inset-0 w-full h-full opacity-40"
        style={{ 
          background: 'radial-gradient(ellipse at center, transparent 0%, var(--bg-primary) 70%)',
          zIndex: 1
        }}
      />

      <div className="relative z-10 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text float">Select Organization</h1>
            <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
              Choose an organization to manage projects and tasks
            </p>
          </div>

        <div className="space-y-6">
          {/* Create Organization Form */}
          {showCreateForm && (
            <CreateOrganizationForm
              onSubmit={handleCreateOrganization}
              onCancel={() => setShowCreateForm(false)}
              loading={creating}
            />
          )}

          {/* Organizations List */}
          <div className="space-y-4">
            {organizations.map((org:Organization) => (
              <OrganizationCard
                key={org.id}
                organization={org}
                onSelect={handleSelectOrganization}
              />
            ))}
          </div>

          {/* Create New Organization Button */}
          {!showCreateForm && (
            <div className="text-center">
              <button
                onClick={() => {
                  console.log('Create New Organization clicked');
                  setShowCreateForm(true);
                }}
                className="btn-primary inline-flex items-center"
                style={{ cursor: 'pointer' }}
              >
                <span className="mr-2">+</span>
                Create New Organization
              </button>
            </div>
          )}

          {organizations.length === 0 && !showCreateForm && (
            <div className="text-center py-12">
              <p className="mb-4" style={{ color: 'var(--text-muted)' }}>No organizations found</p>
              <button
                onClick={() => {
                  console.log('Create Your First Organization clicked');
                  setShowCreateForm(true);
                }}
                className="btn-primary inline-flex items-center pulse-glow"
                style={{ cursor: 'pointer' }}
              >
                <span className="mr-2">+</span>
                Create Your First Organization
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
