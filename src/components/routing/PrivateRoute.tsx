import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';

export default function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" />;
}