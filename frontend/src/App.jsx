import {
  BrowserRouter as Router,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import {
  SiteSettingsProvider,
  useSiteSettings,
} from "./contexts/SiteSettingsContext";
import { SocketProvider } from "./contexts/SocketContext";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ChatBot from "./components/layout/ChatBot";
import { useEffect, useState } from "react";
import apiClient from "./api/client";
import { SITE_BRANDING } from "./constants/branding";
// Initialize Chart.js
import "./utils/chartSetup";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);

  // Update document title with consistent branding
  useEffect(() => {
    document.title = SITE_BRANDING.name;
  }, []);

  const isLandingPage = location.pathname === "/";
  const isMaintenancePage = location.pathname === "/maintenance";
  const isLoginPage = location.pathname === "/login";
  const isAdminPage = location.pathname.startsWith("/admin");
  const isModeratorPage = location.pathname.startsWith("/moderator");

  // Check maintenance status on app load
  useEffect(() => {
    // Wait for auth to finish loading before checking maintenance
    if (isLoading) {
      return;
    }

    const checkMaintenanceStatus = async () => {
      try {
        const response = await apiClient.get("/public/maintenance-status");
        const isInMaintenance = response.data?.maintenanceMode;

        if (isInMaintenance) {
          // Get user role from multiple sources
          const contextRole = user?.role;
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
          const storedRole = storedUser?.role;
          // Also check roles array
          const storedRoles = storedUser?.roles || [];
          const hasAdminRole =
            storedRoles.includes("admin") || storedRoles.includes("moderator");

          const userRole = contextRole || storedRole;
          const canBypass =
            userRole === "admin" || userRole === "moderator" || hasAdminRole;

          console.log(
            "Maintenance check - Role:",
            userRole,
            "Can bypass:",
            canBypass,
            "Path:",
            location.pathname
          );

          // Don't redirect if user is admin/moderator OR if they're on admin/moderator pages
          if (
            !canBypass &&
            !isMaintenancePage &&
            !isLoginPage &&
            !isAdminPage &&
            !isModeratorPage
          ) {
            navigate("/maintenance");
          }
        } else {
          // If not in maintenance mode but on maintenance page, redirect to home
          if (isMaintenancePage) {
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Failed to check maintenance status:", error);
      } finally {
        setCheckingMaintenance(false);
      }
    };

    checkMaintenanceStatus();
  }, [
    user,
    isLoading,
    isMaintenancePage,
    isLoginPage,
    isAdminPage,
    isModeratorPage,
    navigate,
    location.pathname,
  ]);

  // Hide navbar and footer on landing page and maintenance page
  const hideLayout = isLandingPage || isMaintenancePage;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
      {!hideLayout && <Navbar />}
      <main className="flex-grow">
        <AppRoutes />
      </main>
      {!hideLayout && <Footer />}
      <ChatBot />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--toast-bg)",
            color: "var(--toast-color)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <SiteSettingsProvider>
            <Router>
              <AppContent />
            </Router>
          </SiteSettingsProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
