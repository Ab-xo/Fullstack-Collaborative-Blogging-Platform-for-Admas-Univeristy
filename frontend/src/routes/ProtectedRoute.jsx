import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/common/LoadingSpinner";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log("🛡️  ProtectedRoute check:", {
    path: location.pathname,
    isLoading,
    isAuthenticated,
  });

  if (isLoading) {
    console.log("⏳ ProtectedRoute: Still loading auth state...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("❌ ProtectedRoute: Not authenticated, redirecting to login");
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("✅ ProtectedRoute: Authenticated, rendering protected content");
  return children;
};

export default ProtectedRoute;
