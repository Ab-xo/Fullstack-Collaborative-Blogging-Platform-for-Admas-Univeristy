/**
 * ============================================================================
 * FORGOT PASSWORD PAGE - PASSWORD RECOVERY
 * ============================================================================
 *
 * Purpose:
 *   Allows users to request a password reset link when they've
 *   forgotten their account password.
 *
 * Features:
 *   - Email input for password reset request
 *   - Success confirmation message
 *   - Link back to login page
 *   - Loading state during request
 *   - Error handling via AuthContext
 *
 * Flow:
 *   1. User enters their registered email
 *   2. System sends password reset link to email
 *   3. Success message displayed with instructions
 *   4. User clicks link in email to reset password
 *
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Button from "../components/common/Button";
import Input from "../components/common/Input";

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (error) {
      // Error is already shown by AuthContext toast
      console.error("Forgot password error:", error);
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
              Check your email
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We've sent a 6-digit verification code to <strong>{email}</strong>
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Didn't receive the code? Check your spam folder or try again.
            </p>

            <div className="space-y-3">
              <Link to={`/reset-password?email=${encodeURIComponent(email)}`}>
                <Button variant="primary" className="w-full">
                  Enter verification code
                </Button>
              </Link>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
              >
                Send another code
              </Button>

              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to login
                </Button>
              </Link>
            </div>
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
            Forgot your password?
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="your.email@admas.edu.et"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              Send reset link
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to login
              </Link>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
