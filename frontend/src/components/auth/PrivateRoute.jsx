import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Spinner } from '../ui/Spinner';

export function PrivateRoute({ adminOnly = false }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}

