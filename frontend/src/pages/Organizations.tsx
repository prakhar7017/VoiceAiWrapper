import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizations, useCreateOrganization } from '../hooks/useGraphQL';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';
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
      className="w-full bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer text-left"
      style={{ cursor: 'pointer' }}
    >
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-blue-600 font-semibold text-lg">
            {organization.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{organization.name}</h3>
          <p className="text-sm text-gray-500">{organization.contactEmail}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            {organization.projectCount || 0} projects
          </div>
          <div className="text-sm text-gray-500">
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
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Organization</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Organization Name
          </label>
          <input
            type="text"
            id="name"
            required
            className="mt-1 form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        
        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
            Contact Email
          </label>
          <input
            type="email"
            id="contactEmail"
            required
            className="mt-1 form-input"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
            style={{ cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={cn(
              'px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 cursor-pointer',
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load organizations</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="organization-page min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Select Organization</h1>
          <p className="mt-2 text-gray-600">
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
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                style={{ cursor: 'pointer' }}
              >
                <span className="mr-2">+</span>
                Create New Organization
              </button>
            </div>
          )}

          {organizations.length === 0 && !showCreateForm && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No organizations found</p>
              <button
                onClick={() => {
                  console.log('Create Your First Organization clicked');
                  setShowCreateForm(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
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
  );
}
