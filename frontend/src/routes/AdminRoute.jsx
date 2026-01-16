import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/common/LoadingSpinner";

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted URL so we can redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.roles?.includes("admin")) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
