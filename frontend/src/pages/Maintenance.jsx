import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wrench,
  RefreshCw,
  Mail,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const Maintenance = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRefresh = () => {
    sessionStorage.removeItem("maintenanceMode");
    window.location.href = "/";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);

      // The login function returns { user, accessToken, ... } on success
      // Check if we got a user back (login was successful)
      if (result && result.user) {
        // Check role - could be in 'role' or 'roles' array
        const userRole =
          result.user.role || (result.user.roles && result.user.roles[0]);

        console.log("Login result:", result);
        console.log("User role:", userRole);

        if (userRole === "admin" || userRole === "moderator") {
          sessionStorage.removeItem("maintenanceMode");
          // Use window.location for a full page reload to ensure auth state is fresh
          window.location.href =
            userRole === "admin" ? "/admin/dashboard" : "/moderator/dashboard";
        } else {
          setError(
            "Only administrators and moderators can access the platform during maintenance."
          );
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        {!showLogin ? (
          <>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="inline-flex items-center justify-center w-24 h-24 bg-blue-600/20 rounded-full mb-8"
            >
              <Wrench className="w-12 h-12 text-blue-400" />
            </motion.div>

            <h1 className="text-3xl font-bold text-white mb-4">
              Under Maintenance
            </h1>

            <p className="text-gray-300 mb-8">
              We're currently performing scheduled maintenance to improve your
              experience. Please check back shortly.
            </p>

            <div className="space-y-4">
              <button
                onClick={handleRefresh}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>

              <a
                href="mailto:support@admas.edu"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Contact Support
              </a>
            </div>

            <p className="text-gray-500 text-sm mt-8">
              If you're an administrator,{" "}
              <button
                onClick={() => setShowLogin(true)}
                className="text-blue-400 hover:underline"
              >
                login here
              </button>
            </p>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-full mb-6">
              <LogIn className="w-8 h-8 text-blue-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Admin Login</h2>
            <p className="text-gray-400 text-sm mb-6">
              Only administrators and moderators can access during maintenance
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-300 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@admas.edu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <button
              onClick={() => {
                setShowLogin(false);
                setError("");
                setEmail("");
                setPassword("");
              }}
              className="mt-6 text-gray-500 text-sm hover:text-gray-300"
            >
              ← Back to maintenance page
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Maintenance;
