import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/common/LoadingSpinner";

const AuthorRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has author role (or higher)
  const userRoles = user.roles || [user.role] || [];
  const contentCreators = ['admin', 'moderator', 'author'];
  const hasPermission = userRoles.some(role => contentCreators.includes(role));

  if (!hasPermission) {
    // Redirect readers to home or show unauthorized
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthorRoute;
