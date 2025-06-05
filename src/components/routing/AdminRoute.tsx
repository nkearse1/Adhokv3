import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';

export default function AdminRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return isAuthenticated && isAdmin ? <Outlet /> : <Navigate to="/signin" />;
}