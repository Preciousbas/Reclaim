import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../hooks/useUser.jsx';

export function AuthGuard({ children }) {
  const { authReady, hasProfile } = useUser();
  const location = useLocation();

  if (!authReady) {
    return (
      <div className="page-center">
        <p>Loading…</p>
      </div>
    );
  }

  if (!hasProfile) {
    return <Navigate to="/signup" state={{ from: location }} replace />;
  }

  return children;
}

export function PublicOnly({ children }) {
  const { authReady, hasProfile } = useUser();
  if (!authReady) return null;
  if (hasProfile) return <Navigate to="/app/dashboard" replace />;
  return children;
}
