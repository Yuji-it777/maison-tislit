import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useApp();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
