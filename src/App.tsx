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
import Loader from './components/Loader';
import LinearProgress from '@mui/material/LinearProgress';

// --- Loading Context ---
type LoadingContextType = {
  loading: boolean;
  setLoading: (v: boolean) => void;
};
export const LoadingContext = React.createContext<LoadingContextType>({
  loading: false,
  setLoading: () => {},
});

// --- Layout wrapper to show LinearProgress when loading ---
const LayoutWithLoading: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading } = React.useContext(LoadingContext);
  return (
    <Layout>
      {loading && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1201 }} />}
      {children}
    </Layout>
  );
};

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
  const [loading, setLoading] = React.useState(false);

  // דוגמה לשימוש במשתנה סביבה
  React.useEffect(() => {
    // לדוג' VITE_API_URL או כל משתנה אחר שהגדרת
    console.log('API URL:', import.meta.env.VITE_API_URL);
  }, []);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      <BrowserRouter>
        <RouteLogger />
        <LayoutWithLoading>
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
        </LayoutWithLoading>
      </BrowserRouter>
    </LoadingContext.Provider>
  );
};

export default App;

// --- דוגמה לשימוש ב-loading context בעמוד (יש להוסיף לכל עמוד שטוען נתונים) ---
// import { useContext, useEffect } from 'react';
// import { LoadingContext } from '../App';
// const { setLoading } = useContext(LoadingContext);
// useEffect(() => {
//   setLoading(true);
//   fetchData().finally(() => setLoading(false));
// }, []);
