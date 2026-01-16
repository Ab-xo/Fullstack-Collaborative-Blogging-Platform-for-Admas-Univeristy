/**
 * ============================================================================
 * VERIFY EMAIL PAGE - EMAIL VERIFICATION
 * ============================================================================
 *
 * Purpose:
 *   Allows new users to verify their email address after registration
 *   by entering the verification code sent to their email.
 *
 * Features:
 *   - Verification code input field
 *   - Loading state during verification
 *   - Success confirmation with redirect
 *   - Error handling for invalid codes
 *   - Resend verification code option
 *
 * Flow:
 *   1. User registers and receives verification email
 *   2. User enters 6-digit verification code
 *   3. System validates the code
 *   4. On success, user is redirected to login
 *   5. Account is now fully activated
 *
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Mail, CheckCircle } from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    try {
      setLoading(true);
      await verifyEmail(verificationCode);
      setVerified(true);
      toast.success("Email verified successfully!");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Verification failed. Please try again."
      );
      console.error("Verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Email Verified!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your email has been verified successfully. Redirecting to login...
          </p>
          <Button
            onClick={() => navigate("/login")}
            variant="primary"
            className="w-full"
          >
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Mail className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Verify Your Email
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            We sent a verification code to your email address
          </p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Verification Code"
            type="text"
            placeholder="Enter the 6-digit code"
            value={verificationCode}
            onChange={(e) =>
              setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            maxLength="6"
            error={
              verificationCode && verificationCode.length !== 6
                ? "Code must be 6 digits"
                : ""
            }
          />

          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Check your email for the verification code. It may take a few
            minutes to arrive.
          </p>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
            disabled={verificationCode.length !== 6}
          >
            Verify Email
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Register again
              </button>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default VerifyEmail;
