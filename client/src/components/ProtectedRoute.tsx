import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();

  // If not logged in, redirect to login page
  // 'replace' prevents them from hitting Back button to return here
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, show the page
  return children;
};

export default ProtectedRoute;