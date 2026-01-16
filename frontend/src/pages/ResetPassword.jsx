/**
 * ============================================================================
 * RESET PASSWORD PAGE - PASSWORD RECOVERY COMPLETION
 * ============================================================================
 *
 * Purpose:
 *   Allows users to set a new password after receiving a reset link
 *   via email from the Forgot Password flow.
 *
 * Features:
 *   - Verification code input (from email)
 *   - New password entry with confirmation
 *   - Password visibility toggle
 *   - Password strength validation
 *   - Success/error state handling
 *   - Redirect to login after successful reset
 *
 * Flow:
 *   1. User clicks reset link from email
 *   2. Page extracts email and code from URL params
 *   3. User enters new password and confirms
 *   4. System validates and updates password
 *   5. User redirected to login page
 *
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import Button from "../components/common/Button";
import Input from "../components/common/Input";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");

    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }

    if (tokenParam) {
      setCode(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate code
    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(code, password);
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to reset password. Please check your code and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Password reset successful!
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Your password has been reset successfully. You can now log in with
              your new password.
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Redirecting to login page...
            </p>

            <Link to="/login">
              <Button variant="primary" className="w-full">
                Go to login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6">
            <span className="text-2xl font-bold text-white">AU</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reset your password
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Enter the 6-digit code sent to your email
          </p>
          {email && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              {email}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Verification Code"
              type="text"
              placeholder="Enter 6-digit code"
              icon={KeyRound}
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(value);
              }}
              required
              maxLength={6}
              className="text-center text-2xl tracking-widest font-mono"
            />

            <div className="relative">
              <Input
                label="New Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="ml-3 text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Password requirements:</strong>
              </p>
              <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• At least 6 characters long</li>
                <li>• Both passwords must match</li>
              </ul>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
              disabled={
                !code || !password || !confirmPassword || code.length !== 6
              }
            >
              Reset password
            </Button>

            <div className="text-center space-y-2">
              <Link
                to="/forgot-password"
                className="block text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Didn't receive a code? Request new one
              </Link>
              <Link
                to="/login"
                className="block text-sm font-medium text-gray-600 hover:text-gray-500 dark:text-gray-400"
              >
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
