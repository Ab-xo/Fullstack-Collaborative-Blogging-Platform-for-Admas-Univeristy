import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { authAPI } from "../api/auth";
import {
  getToken,
  setToken,
  setRefreshToken,
  getUser,
  setUser,
  clearAuth,
  migrateToSessionStorage,
} from "../utils/storage";
import toast from "react-hot-toast";

export const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on mount - optimized for speed
  const checkAuth = useCallback(async () => {
    try {
      // Run migration for security update (clears old localStorage tokens)
      migrateToSessionStorage();

      const token = getToken();
      const storedUser = getUser();

      // Immediately use stored data for faster initial render
      if (token && storedUser) {
        setUserState(storedUser);
        setIsAuthenticated(true);
        setIsLoading(false);

        // Verify token in background (non-blocking)
        authAPI
          .getMe()
          .then((response) => {
            if (response.user) {
              setUserState(response.user);
              setUser(response.user);
            }
          })
          .catch((error) => {
            // Only clear auth if token is truly invalid (401)
            if (error.response?.status === 401) {
              clearAuth();
              setUserState(null);
              setIsAuthenticated(false);
            }
            // For other errors, keep using stored user
          });
      } else {
        setUserState(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUserState(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login - optimized
  const login = async (email, password) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authAPI.login({ email, password });

      // Store tokens and user data
      if (response.accessToken) {
        setToken(response.accessToken);
      }
      if (response.refreshToken) {
        setRefreshToken(response.refreshToken);
      }
      if (response.user) {
        setUser(response.user);
      }

      setUserState(response.user);
      setIsAuthenticated(true);

      toast.success("Login successful!");
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (userData) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authAPI.register(userData);

      toast.success(
        "Registration successful! Please check your email to verify your account."
      );
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      setError(errorMessage);
      // Don't show toast here - let the form handle it for better error messages
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear auth data regardless of API call success
      clearAuth();
      setUserState(null);
      setIsAuthenticated(false);
      toast.success("Logged out successfully");
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUserState(userData);
    setUser(userData);
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await authAPI.updateProfile(profileData);

      // Update user in context immediately for real-time display
      setUserState(response.user);
      setUser(response.user);

      toast.success("Profile updated successfully!");
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUserState(response.user);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error("Failed to refresh user:", error);
      throw error;
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    try {
      setError(null);
      const response = await authAPI.verifyEmail(token);
      toast.success("Email verified successfully!");
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Email verification failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setError(null);
      const response = await authAPI.forgotPassword(email);
      toast.success("Password reset link sent to your email");
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to send reset link";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      setError(null);
      const response = await authAPI.resetPassword(token, password);
      toast.success(
        "Password reset successful! Please login with your new password."
      );
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Password reset failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  // Resend verification
  const resendVerification = async (email) => {
    try {
      setError(null);
      const response = await authAPI.resendVerification(email);
      toast.success("Verification email sent!");
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to resend verification";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    refreshUser,
    checkAuth,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
