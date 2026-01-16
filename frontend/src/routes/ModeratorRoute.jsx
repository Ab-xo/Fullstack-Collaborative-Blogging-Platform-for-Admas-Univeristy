import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/common/LoadingSpinner";

/**
 * ModeratorRoute - Protects routes that require moderator or admin access
 * Redirects to login if not authenticated (saves original URL for redirect after login)
 * Redirects to home if user doesn't have moderator/admin role
 */
const ModeratorRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted URL so we can redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has moderator or admin role
  // Support both 'role' (singular) and 'roles' (array) formats
  const userRole = user?.role;
  const userRoles = user?.roles || [];

  const isModerator =
    userRole === "moderator" || userRoles.includes("moderator");
  const isAdmin = userRole === "admin" || userRoles.includes("admin");

  if (!isModerator && !isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ModeratorRoute;
