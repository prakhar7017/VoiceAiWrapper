import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './lib/apollo';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Organizations } from './pages/Organizations';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Tasks } from './pages/Tasks';
import { TaskDetail } from './pages/TaskDetail';
import { NotificationProvider } from './components/NotificationProvider';
import { useSelectedOrganization } from './store';
import './App.css';

function AppRoutes() {
  const selectedOrganization = useSelectedOrganization();

  return (
    <Routes>
      {/* Organization selection - no layout */}
      <Route path="/organizations" element={<Organizations />} />
      
      {/* Protected routes - with layout */}
      {selectedOrganization ? (
        <>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/projects" element={
            <Layout>
              <Projects />
            </Layout>
          } />
          <Route path="/projects/:projectId" element={
            <Layout>
              <ProjectDetail />
            </Layout>
          } />
          <Route path="/projects/:projectId/tasks" element={
            <Layout>
              <Tasks />
            </Layout>
          } />
          <Route path="/projects/:projectId/tasks/:taskId" element={
            <Layout>
              <TaskDetail />
            </Layout>
          } />
          {/* Redirect any unknown routes to dashboard when org is selected */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : (
        <>
          {/* No organization selected - redirect to organizations page */}
          <Route path="/" element={<Navigate to="/organizations" replace />} />
          <Route path="*" element={<Navigate to="/organizations" replace />} />
        </>
      )}
    </Routes>
  );
}

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <Router>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </Router>
    </ApolloProvider>
  );
}

export default App;
