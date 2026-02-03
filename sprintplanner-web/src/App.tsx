import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Dashboard, Users, Login, GanttBoard } from '@/pages';
import { GlobalStyles } from '@/styles';
import { useStore } from '@/store';
import { api, auth } from '@/api';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const setUser = useStore((s) => s.setUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      setLoading(false);
      return;
    }
    api.getMe()
      .then(setUser)
      .catch(() => auth.removeToken())
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!auth.isAuthenticated()) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export const App = () => {
  const theme = useStore((s) => s.theme);

  return (
    <BrowserRouter>
      <GlobalStyles mode={theme} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/gantt/:id" element={<ProtectedRoute><GanttBoard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
