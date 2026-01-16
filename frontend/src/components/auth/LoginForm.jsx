import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import GoogleSignInButton from "./GoogleSignInButton";
import toast from "react-hot-toast";
import { setRememberMe } from "../../utils/storage";

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMeState] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Set remember me preference BEFORE login so tokens are stored correctly
      setRememberMe(rememberMe);

      const response = await login(data.email, data.password);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const user = response?.user;
      const userRoles = user?.roles || [];

      // First check if there's a saved location to redirect to
      const from = location.state?.from?.pathname;
      let redirectPath = "/dashboard";

      // If there's a saved location and it's not login/register, use it
      if (from && from !== "/login" && from !== "/register" && from !== "/") {
        // Verify user has permission for the saved path
        if (from.startsWith("/admin") && !userRoles.includes("admin")) {
          redirectPath = "/dashboard";
        } else if (
          from.startsWith("/moderator") &&
          !userRoles.includes("admin") &&
          !userRoles.includes("moderator")
        ) {
          redirectPath = "/dashboard";
        } else if (
          (from.startsWith("/posts/create") ||
            from.startsWith("/posts/edit") ||
            from === "/my-posts" ||
            from.startsWith("/author")) &&
          !userRoles.includes("admin") &&
          !userRoles.includes("moderator") &&
          !userRoles.includes("author")
        ) {
          redirectPath = "/dashboard";
        } else {
          redirectPath = from;
        }
      } else {
        // No saved location, redirect based on role
        if (userRoles.includes("admin")) {
          redirectPath = "/admin";
        } else if (userRoles.includes("moderator")) {
          redirectPath = "/moderator";
        }
      }

      navigate(redirectPath, { replace: true });
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";

      // Handle timeout errors specifically
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        errorMessage =
          "Server is waking up (this takes 30-60 seconds on first request). Please try again in a moment.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        duration: 6000,
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email Input */}
      <motion.div variants={inputVariants} whileFocus="focus">
        <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-blue-500 dark:text-blue-300/60" />
          </div>
          <input
            type="email"
            placeholder="your.email@admas.edu.et"
            className="w-full pl-11 pr-4 py-2.5 bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-300 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">
            {errors.email.message}
          </p>
        )}
      </motion.div>

      {/* Password Input */}
      <motion.div variants={inputVariants} whileFocus="focus">
        <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-1.5">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-blue-500 dark:text-blue-300/60" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="w-full pl-11 pr-11 py-2.5 bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-300 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-blue-300/60 hover:text-gray-600 dark:hover:text-white transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">
            {errors.password.message}
          </p>
        )}
      </motion.div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMeState(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-blue-500 focus:ring-blue-500/50"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-600 dark:text-white/70"
          >
            Remember me
          </label>
        </div>

        <Link
          to="/forgot-password"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Signing in...</span>
          </>
        ) : (
          "Sign In"
        )}
      </motion.button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white dark:bg-transparent text-gray-500 dark:text-white/50">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google Sign In */}
      <GoogleSignInButton isRegister={false} />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white dark:bg-transparent text-gray-500 dark:text-white/50">
            Don't have an account?
          </span>
        </div>
      </div>

      {/* Register Link */}
      <Link to="/register">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-700 dark:text-white font-semibold rounded-xl transition-all"
        >
          Create New Account
        </motion.button>
      </Link>
    </form>
  );
};

export default LoginForm;
