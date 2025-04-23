import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = ['user', 'admin'] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show nothing while checking authentication
  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated, saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    // Redirect to home if user's role is not allowed
    return <Navigate to="/" replace />;
  }

  // Render the protected component
  return children;
};

export default ProtectedRoute;
