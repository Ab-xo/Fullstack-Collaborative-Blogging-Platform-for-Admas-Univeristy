import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * GuestRoute - Protects routes that should only be accessible to non-authenticated users
 * Redirects authenticated users to /home
 * 
 * Use this for: Login, Register, Introduction pages
 */
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show nothing while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // If not authenticated, show the page
  return children;
};

export default GuestRoute;
