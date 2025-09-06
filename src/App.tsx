import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import EntityListPage from './pages/entities/EntityListPage';
import EntityCreatePage from './pages/entities/EntityCreatePage';
import StudentRequestsPage from './pages/StudentRequestsPage';
import StudentRequestFormPage from './pages/StudentRequestFormPage';
import StatisticsPage from './pages/StatisticsPage';
import HelpPage from './pages/HelpPage';
import AdminUsersPage from './pages/AdminUsersPage';

// Route logging component
const RouteLogger: React.FC = () => {
  const location = useLocation();
  React.useEffect(() => {
    if ((import.meta as any).env?.DEV) {
      console.log('[ROUTE]', `path=${location.pathname}`);
    }
  }, [location.pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <RouteLogger />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Admin */}
          <Route path="/admin" element={<Navigate to="/admin/requests" replace />} />
          <Route path="/admin/requests" element={<EntityListPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />

          {/* Student */}
          <Route path="/student" element={<Navigate to="/student/requests" replace />} />
          <Route path="/student/requests" element={<StudentRequestsPage />} />
          <Route path="/student/requests/new" element={<StudentRequestFormPage />} />

          {/* Help */}
          <Route path="/help" element={<HelpPage />} />

          {/* Statistics — canonical path + redirect from legacy */}
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/stats" element={<Navigate to="/statistics" replace />} />

          {/* Misc */}
          <Route path="/logout" element={<div style={{ textAlign: 'right' }}>יציאה</div>} />
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
