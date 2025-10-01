import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { useAppStore } from '../store';
import {
  GET_ORGANIZATIONS,
  GET_ORGANIZATION,
  GET_PROJECTS,
  GET_PROJECT,
  GET_TASKS,
  GET_TASK,
  GET_TASK_COMMENTS,
  GET_DASHBOARD_DATA,
  SEARCH_ALL,
  GET_ORGANIZATION_STATS,
} from '../graphql/queries';
import {
  CREATE_ORGANIZATION,
  CREATE_PROJECT,
  UPDATE_PROJECT,
  CREATE_TASK,
  UPDATE_TASK,
  CREATE_TASK_COMMENT,
} from '../graphql/mutations';
import type {
  Organization,
  Project,
  Task,
  TaskComment,
  CreateOrganizationInput,
  CreateProjectInput,
  UpdateProjectInput,
  CreateTaskInput,
  UpdateTaskInput,
  CreateTaskCommentInput,
  ProjectFilters,
  TaskFilters,
} from '../types';

// Organization hooks
export const useOrganizations = () => {
  const { data, loading, error, refetch } = useQuery(GET_ORGANIZATIONS, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  return {
    organizations: (data?.organizations || []) as Organization[],
    loading,
    error,
    refetch,
  };
};

export const useOrganization = (slug: string) => {
  const { data, loading, error, refetch } = useQuery(GET_ORGANIZATION, {
    variables: { slug },
    skip: !slug,
    errorPolicy: 'all',
  });

  return {
    organization: data?.organization as Organization | undefined,
    loading,
    error,
    refetch,
  };
};

export const useCreateOrganization = () => {
  const { addNotification } = useAppStore();
  
  const [createOrganization, { loading, error }] = useMutation(CREATE_ORGANIZATION, {
    update(cache, { data }) {
      if (data?.createOrganization?.success && data?.createOrganization?.organization) {
        // Update organizations cache
        try {
          const existingOrgs = cache.readQuery<{ organizations: Organization[] }>({ query: GET_ORGANIZATIONS });
          if (existingOrgs) {
            cache.writeQuery({
              query: GET_ORGANIZATIONS,
              data: {
                organizations: [...existingOrgs.organizations, data.createOrganization.organization],
              },
            });
          }
        } catch (error) {
          console.warn('Cache update failed:', error);
        }
      }
    },
    onCompleted: (data) => {
      if (data?.createOrganization?.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: data.createOrganization.message,
          read: false,
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data?.createOrganization?.message || 'Failed to create organization',
          read: false,
        });
      }
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message,
        read: false,
      });
    },
  });

  const handleCreateOrganization = async (input: CreateOrganizationInput) => {
    try {
      const result = await createOrganization({
        variables: input,
      });
      return result.data?.createOrganization;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  };

  return {
    createOrganization: handleCreateOrganization,
    loading,
    error,
  };
};

// Project hooks
export const useProjects = (organizationSlug: string, filters?: Partial<ProjectFilters>) => {
  const { data, loading, error, refetch, fetchMore } = useQuery(GET_PROJECTS, {
    variables: {
      organizationSlug,
      ...filters,
    },
    skip: !organizationSlug,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  const loadMore = () => {
    if (data?.projects?.length) {
      fetchMore({
        variables: {
          offset: data.projects.length,
        },
      });
    }
  };

  return {
    projects: (data?.projects || []) as Project[],
    loading,
    error,
    refetch,
    loadMore,
  };
};

export const useProject = (id: string, organizationSlug: string) => {
  const { data, loading, error, refetch } = useQuery(GET_PROJECT, {
    variables: { id, organizationSlug },
    skip: !id || !organizationSlug,
    errorPolicy: 'all',
  });

  return {
    project: data?.project as Project | undefined,
    loading,
    error,
    refetch,
  };
};

export const useCreateProject = () => {
  const { addNotification } = useAppStore();
  
  const [createProject, { loading, error }] = useMutation(CREATE_PROJECT, {
    update(cache, { data }) {
      if (data?.createProject?.success && data?.createProject?.project) {
        // Update projects cache
        try {
          const existingProjects = cache.readQuery<{ projects: Project[] }>({
            query: GET_PROJECTS,
            variables: { organizationSlug: data.createProject.project.organization.slug },
          });
          
          if (existingProjects) {
            cache.writeQuery({
              query: GET_PROJECTS,
              variables: { organizationSlug: data.createProject.project.organization.slug },
              data: {
                projects: [data.createProject.project, ...existingProjects.projects],
              },
            });
          }
        } catch (error) {
          console.warn('Cache update failed:', error);
        }
      }
    },
    onCompleted: (data) => {
      if (data?.createProject?.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: data.createProject.message,
          read: false,
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data?.createProject?.message || 'Failed to create project',
          read: false,
        });
      }
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message,
        read: false,
      });
    },
  });

  const handleCreateProject = async (input: CreateProjectInput) => {
    try {
      const result = await createProject({
        variables: input,
      });
      return result.data?.createProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  return {
    createProject: handleCreateProject,
    loading,
    error,
  };
};

export const useUpdateProject = () => {
  const { addNotification, updateProject: updateProjectInStore } = useAppStore();
  
  const [updateProject, { loading, error }] = useMutation(UPDATE_PROJECT, {
    onCompleted: (data) => {
      if (data?.updateProject?.success && data?.updateProject?.project) {
        // Update store
        updateProjectInStore(data.updateProject.project.id, data.updateProject.project);
        
        addNotification({
          type: 'success',
          title: 'Success',
          message: data.updateProject.message,
          read: false,
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data?.updateProject?.message || 'Failed to update project',
          read: false,
        });
      }
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message,
        read: false,
      });
    },
  });

  const handleUpdateProject = async (input: UpdateProjectInput) => {
    try {
      const result = await updateProject({
        variables: input,
      });
      return result.data?.updateProject;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  return {
    updateProject: handleUpdateProject,
    loading,
    error,
  };
};

// Task hooks
export const useTasks = (projectId: string, organizationSlug: string, filters?: Partial<TaskFilters>) => {
  const { data, loading, error, refetch, fetchMore } = useQuery(GET_TASKS, {
    variables: {
      projectId,
      organizationSlug,
      ...filters,
    },
    skip: !projectId || !organizationSlug,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  const loadMore = () => {
    if (data?.tasks?.length) {
      fetchMore({
        variables: {
          offset: data.tasks.length,
        },
      });
    }
  };

  return {
    tasks: (data?.tasks || []) as Task[],
    loading,
    error,
    refetch,
    loadMore,
  };
};

export const useTask = (id: string, organizationSlug: string) => {
  const { data, loading, error, refetch } = useQuery(GET_TASK, {
    variables: { id, organizationSlug },
    skip: !id || !organizationSlug,
    errorPolicy: 'all',
  });

  return {
    task: data?.task as Task | undefined,
    loading,
    error,
    refetch,
  };
};

export const useCreateTask = () => {
  const { addNotification } = useAppStore();
  
  const [createTask, { loading, error }] = useMutation(CREATE_TASK, {
    update(cache, { data }) {
      if (data?.createTask?.success && data?.createTask?.task) {
        // Update tasks cache
        try {
          const existingTasks = cache.readQuery<{ tasks: Task[] }>({
            query: GET_TASKS,
            variables: {
              projectId: data.createTask.task.project.id,
              organizationSlug: data.createTask.task.project.organization.slug,
            },
          });
          
          if (existingTasks) {
            cache.writeQuery({
              query: GET_TASKS,
              variables: {
                projectId: data.createTask.task.project.id,
                organizationSlug: data.createTask.task.project.organization.slug,
              },
              data: {
                tasks: [data.createTask.task, ...existingTasks.tasks],
              },
            });
          }
        } catch (error) {
          console.warn('Cache update failed:', error);
        }
      }
    },
    onCompleted: (data) => {
      if (data?.createTask?.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: data.createTask.message,
          read: false,
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data?.createTask?.message || 'Failed to create task',
          read: false,
        });
      }
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message,
        read: false,  
      });
    },
  });

  const handleCreateTask = async (input: CreateTaskInput) => {
    try {
      const result = await createTask({
        variables: input,
      });
      return result.data?.createTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  return {
    createTask: handleCreateTask,
    loading,
    error,
  };
};

export const useUpdateTask = () => {
  const { addNotification, updateTask: updateTaskInStore } = useAppStore();
  
  const [updateTask, { loading, error }] = useMutation(UPDATE_TASK, {
    onCompleted: (data) => {
      if (data?.updateTask?.success && data?.updateTask?.task) {
        // Update store
        updateTaskInStore(data.updateTask.task.id, data.updateTask.task);
        
        addNotification({
          type: 'success',
          title: 'Success',
          message: data.updateTask.message,
          read: false,
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data?.updateTask?.message || 'Failed to update task',
          read: false,
        });
      }
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message,
        read: false,
      });
    },
  });

  const handleUpdateTask = async (input: UpdateTaskInput) => {
    try {
      const result = await updateTask({
        variables: input,
      });
      return result.data?.updateTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  return {
    updateTask: handleUpdateTask,
    loading,
    error,
  };
};

// Comment hooks
export const useTaskComments = (taskId: string, organizationSlug: string) => {
  const { data, loading, error, refetch } = useQuery(GET_TASK_COMMENTS, {
    variables: { taskId, organizationSlug },
    skip: !taskId || !organizationSlug,
    errorPolicy: 'all',
  });

  return {
    comments: (data?.taskComments || []) as TaskComment[],
    loading,
    error,
    refetch,
  };
};

export const useCreateTaskComment = () => {
  const { addNotification } = useAppStore();
  
  const [createTaskComment, { loading, error }] = useMutation(CREATE_TASK_COMMENT, {
    update(cache, { data }) {
      if (data?.createTaskComment?.success && data?.createTaskComment?.comment) {
        // Update comments cache
        try {
          const existingComments = cache.readQuery<{ taskComments: TaskComment[] }>({
            query: GET_TASK_COMMENTS,
            variables: {
              taskId: data.createTaskComment.comment.task.id,
              organizationSlug: data.createTaskComment.comment.task.project?.organization?.slug,
            },
          });
          
          if (existingComments) {
            cache.writeQuery({
              query: GET_TASK_COMMENTS,
              variables: {
                taskId: data.createTaskComment.comment.task.id,
                organizationSlug: data.createTaskComment.comment.task.project?.organization?.slug,
              },
              data: {
                taskComments: [data.createTaskComment.comment, ...existingComments.taskComments],
              },
            });
          }
        } catch (error) {
          console.warn('Cache update failed:', error);
        }
      }
    },
    onCompleted: (data) => {
      if (data?.createTaskComment?.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: data.createTaskComment.message,
          read: false,
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data?.createTaskComment?.message || 'Failed to add comment',
          read: false,
        });
      }
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message,
        read: false,
      });
    },
  });

  const handleCreateTaskComment = async (input: CreateTaskCommentInput) => {
    try {
      const result = await createTaskComment({
        variables: input,
      });
      return result.data?.createTaskComment;
    } catch (error) {
      console.error('Error creating task comment:', error);
      throw error;
    }
  };

  return {
    createTaskComment: handleCreateTaskComment,
    loading,
    error,
  };
};

// Dashboard hook
export const useDashboard = (organizationSlug: string) => {
  const { data, loading, error, refetch } = useQuery(GET_DASHBOARD_DATA, {
    variables: { organizationSlug },
    skip: !organizationSlug,
    errorPolicy: 'all',
    pollInterval: 30000, // Refresh every 30 seconds
  });

  return {
    organization: data?.organization as Organization | undefined,
    projects: (data?.projects || []) as Project[],
    loading,
    error,
    refetch,
  };
};

// Search hook
export const useSearch = (organizationSlug: string, query: string, limit?: number) => {
  const { data, loading, error, refetch } = useQuery(SEARCH_ALL, {
    variables: { organizationSlug, query, limit },
    skip: !organizationSlug || !query,
    errorPolicy: 'all',
  });

  return {
    projects: (data?.projects || []) as Project[],
    tasks: (data?.tasks || []) as Task[],
    loading,
    error,
    refetch,
  };
};

// Statistics hook
export const useOrganizationStats = (organizationSlug: string) => {
  const { data, loading, error, refetch } = useQuery(GET_ORGANIZATION_STATS, {
    variables: { organizationSlug },
    skip: !organizationSlug,
    errorPolicy: 'all',
  });

  return {
    organization: data?.organization as Organization | undefined,
    projects: (data?.projects || []) as Project[],
    loading,
    error,
    refetch,
  };
};

// Cache management hook
export const useCacheManagement = () => {
  const client = useApolloClient();

  const clearCache = () => {
    client.clearStore();
  };

  const refetchAll = () => {
    client.refetchQueries({
      include: 'active',
    });
  };

  const evictEntity = (typename: string, id: string) => {
    client.cache.evict({
      id: client.cache.identify({ __typename: typename, id }),
    });
    client.cache.gc();
  };

  return {
    clearCache,
    refetchAll,
    evictEntity,
  };
};

// Utility hooks for common operations
export const useOptimisticUpdates = () => {
  const { updateProject, updateTask } = useAppStore();

  const optimisticUpdateProject = (id: string, updates: Partial<Project>) => {
    updateProject(id, updates);
  };

  const optimisticUpdateTask = (id: string, updates: Partial<Task>) => {
    updateTask(id, updates);
  };

  return {
    optimisticUpdateProject,
    optimisticUpdateTask,
  };
};

// Error handling hook
export const useErrorHandler = () => {
  const { addNotification } = useAppStore();

  const handleGraphQLError = (error: Error | unknown, context?: string) => {
    const message = (error as Error)?.message || 'An unexpected error occurred';
    const title = context ? `Error in ${context}` : 'Error';

    addNotification({
      type: 'error',
      title,
      message,
      read: false,
    });

    console.error('GraphQL Error:', error);
  };

  const handleNetworkError = (error: Error | unknown, context?: string) => {
    const message = 'Network error. Please check your connection and try again.';
    const title = context ? `Network Error in ${context}` : 'Network Error';

    addNotification({
      type: 'error',
      title,
      message,
      read: false,
    });

    console.error('Network Error:', error);
  };

  return {
    handleGraphQLError,
    handleNetworkError,
  };
};