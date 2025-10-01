import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  Organization,
  Project,
  Task,
  TaskComment,
  Notification,
  SearchState,
} from '../types';

// Main application state interface
interface AppState {
  // Authentication & Organization
  selectedOrganization: Organization | null;
  organizations: Organization[];
  
  // Current navigation context
  selectedProject: Project | null;
  selectedTask: Task | null;
  
  // UI State
  ui: {
    loading: boolean;
    error: string | null;
    sidebarCollapsed: boolean;
    theme: 'light' | 'dark' | 'system';
    compactMode: boolean;
  };
  
  // Data caches
  projects: Project[];
  tasks: Task[];
  comments: TaskComment[];
  
  // Notifications
  notifications: Notification[];
  
  // Search & Filters
  search: SearchState;
  
  // Actions
  setSelectedOrganization: (org: Organization | null) => void;
  setOrganizations: (orgs: Organization[]) => void;
  setSelectedProject: (project: Project | null) => void;
  setSelectedTask: (task: Task | null) => void;
  
  // UI Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setCompactMode: (compact: boolean) => void;
  
  // Data Actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  
  setComments: (comments: TaskComment[]) => void;
  addComment: (comment: TaskComment) => void;
  updateComment: (id: string, updates: Partial<TaskComment>) => void;
  removeComment: (id: string) => void;
  
  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  markNotificationAsRead: (id: string) => void;
  
  // Search Actions
  setSearchQuery: (query: string) => void;
  setSearchFilters: (filters: Record<string, any>) => void;
  setSearchSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  setSearchPage: (page: number) => void;
  clearSearch: () => void;
  
  // Reset Actions
  resetState: () => void;
  resetUIState: () => void;
}

// Initial state
const initialState = {
  selectedOrganization: null,
  organizations: [],
  selectedProject: null,
  selectedTask: null,
  ui: {
    loading: false,
    error: null,
    sidebarCollapsed: false,
    theme: 'system' as const,
    compactMode: false,
  },
  projects: [],
  tasks: [],
  comments: [],
  notifications: [],
  search: {
    query: '',
    filters: {},
    sortBy: 'createdAt',
    sortOrder: 'desc' as const,
    page: 1,
    pageSize: 20,
  },
};

// Create the store
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Organization Actions
        setSelectedOrganization: (org) => {
          set({ selectedOrganization: org, selectedProject: null, selectedTask: null });
        },
        
        setOrganizations: (orgs) => {
          set({ organizations: orgs });
        },
        
        setSelectedProject: (project) => {
          set({ selectedProject: project, selectedTask: null });
        },
        
        setSelectedTask: (task) => {
          set({ selectedTask: task });
        },
        
        // UI Actions
        setLoading: (loading) => {
          set((state) => ({
            ui: { ...state.ui, loading }
          }));
        },
        
        setError: (error) => {
          set((state) => ({
            ui: { ...state.ui, error }
          }));
        },
        
        toggleSidebar: () => {
          set((state) => ({
            ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed }
          }));
        },
        
        setTheme: (theme) => {
          set((state) => ({
            ui: { ...state.ui, theme }
          }));
        },
        
        setCompactMode: (compact) => {
          set((state) => ({
            ui: { ...state.ui, compactMode: compact }
          }));
        },
        
        // Project Actions
        setProjects: (projects) => {
          set({ projects });
        },
        
        addProject: (project) => {
          set((state) => ({
            projects: [...state.projects, project]
          }));
        },
        
        updateProject: (id, updates) => {
          set((state) => ({
            projects: state.projects.map(p => 
              p.id === id ? { ...p, ...updates } : p
            ),
            selectedProject: state.selectedProject?.id === id 
              ? { ...state.selectedProject, ...updates }
              : state.selectedProject
          }));
        },
        
        removeProject: (id) => {
          set((state) => ({
            projects: state.projects.filter(p => p.id !== id),
            selectedProject: state.selectedProject?.id === id ? null : state.selectedProject
          }));
        },
        
        // Task Actions
        setTasks: (tasks) => {
          set({ tasks });
        },
        
        addTask: (task) => {
          set((state) => ({
            tasks: [...state.tasks, task]
          }));
        },
        
        updateTask: (id, updates) => {
          set((state) => ({
            tasks: state.tasks.map(t => 
              t.id === id ? { ...t, ...updates } : t
            ),
            selectedTask: state.selectedTask?.id === id 
              ? { ...state.selectedTask, ...updates }
              : state.selectedTask
          }));
        },
        
        removeTask: (id) => {
          set((state) => ({
            tasks: state.tasks.filter(t => t.id !== id),
            selectedTask: state.selectedTask?.id === id ? null : state.selectedTask
          }));
        },
        
        // Comment Actions
        setComments: (comments) => {
          set({ comments });
        },
        
        addComment: (comment) => {
          set((state) => ({
            comments: [...state.comments, comment]
          }));
        },
        
        updateComment: (id, updates) => {
          set((state) => ({
            comments: state.comments.map(c => 
              c.id === id ? { ...c, ...updates } : c
            )
          }));
        },
        
        removeComment: (id) => {
          set((state) => ({
            comments: state.comments.filter(c => c.id !== id)
          }));
        },
        
        // Notification Actions
        addNotification: (notification) => {
          const id = Date.now().toString();
          const newNotification: Notification = {
            ...notification,
            id,
            timestamp: new Date(),
            read: false,
          };
          
          set((state) => ({
            notifications: [newNotification, ...state.notifications]
          }));
        },
        
        removeNotification: (id) => {
          set((state) => ({
            notifications: state.notifications.filter(n => n.id !== id)
          }));
        },
        
        clearNotifications: () => {
          set({ notifications: [] });
        },
        
        markNotificationAsRead: (id) => {
          set((state) => ({
            notifications: state.notifications.map(n =>
              n.id === id ? { ...n, read: true } : n
            )
          }));
        },
        
        // Search Actions
        setSearchQuery: (query) => {
          set((state) => ({
            search: { ...state.search, query, page: 1 }
          }));
        },
        
        setSearchFilters: (filters) => {
          set((state) => ({
            search: { ...state.search, filters, page: 1 }
          }));
        },
        
        setSearchSort: (sortBy, sortOrder) => {
          set((state) => ({
            search: { ...state.search, sortBy, sortOrder, page: 1 }
          }));
        },
        
        setSearchPage: (page) => {
          set((state) => ({
            search: { ...state.search, page }
          }));
        },
        
        clearSearch: () => {
          set((state) => ({
            search: { ...initialState.search }
          }));
        },
        
        // Reset Actions
        resetState: () => {
          set(initialState);
        },
        
        resetUIState: () => {
          set((state) => ({
            ui: { ...initialState.ui }
          }));
        },
      }),
      {
        name: 'project-management-store',
        partialize: (state) => ({
          selectedOrganization: state.selectedOrganization,
          ui: {
            sidebarCollapsed: state.ui.sidebarCollapsed,
            theme: state.ui.theme,
            compactMode: state.ui.compactMode,
          },
        }),
      }
    ),
    {
      name: 'project-management-store',
    }
  )
);

// Selector hooks for better performance
export const useSelectedOrganization = () => useAppStore(state => state.selectedOrganization);
export const useSelectedProject = () => useAppStore(state => state.selectedProject);
export const useSelectedTask = () => useAppStore(state => state.selectedTask);
export const useUIState = () => useAppStore(state => state.ui);
export const useProjects = () => useAppStore(state => state.projects);
export const useTasks = () => useAppStore(state => state.tasks);
export const useComments = () => useAppStore(state => state.comments);
export const useNotifications = () => useAppStore(state => state.notifications);
export const useSearch = () => useAppStore(state => state.search);
