/**
 * ============================================================================
 * UNSUBSCRIBE PAGE
 * ============================================================================
 *
 * Page for users to unsubscribe from the newsletter via email link.
 *
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { unsubscribe } from "../api/newsletter";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading, success, error, already
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage(
        "Invalid unsubscribe link. Please use the link from your email."
      );
      return;
    }

    const handleUnsubscribe = async () => {
      try {
        const response = await unsubscribe(null, token);

        if (response.success) {
          setStatus("success");
          setMessage(
            response.message ||
              "You have been successfully unsubscribed from our newsletter."
          );
        } else {
          if (response.message?.includes("already unsubscribed")) {
            setStatus("already");
            setMessage(
              "This email is already unsubscribed from our newsletter."
            );
          } else {
            setStatus("error");
            setMessage(
              response.message || "Failed to unsubscribe. Please try again."
            );
          }
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Failed to unsubscribe. Please try again.";

        if (errorMessage.includes("already unsubscribed")) {
          setStatus("already");
          setMessage("This email is already unsubscribed from our newsletter.");
        } else {
          setStatus("error");
          setMessage(errorMessage);
        }
      }
    };

    handleUnsubscribe();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-12">
      {/* Animated Background */}
      <motion.div
        className="absolute top-20 left-20 w-72 h-72 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -40, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-white/20 text-center">
          {/* Loading State */}
          {status === "loading" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Processing...
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we process your request.
              </p>
            </motion.div>
          )}

          {/* Success State */}
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Successfully Unsubscribed!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/20 mb-6">
                <p className="text-sm text-green-700 dark:text-green-300">
                  You will no longer receive newsletter emails from Admas
                  University.
                </p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Changed your mind? You can always subscribe again from our
                homepage.
              </p>
            </motion.div>
          )}

          {/* Already Unsubscribed State */}
          {status === "already" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Already Unsubscribed
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20 mb-6">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  This email address is not currently subscribed to our
                  newsletter.
                </p>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Oops! Something Went Wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20 mb-6">
                <p className="text-sm text-red-700 dark:text-red-300">
                  Please try using the unsubscribe link from your email again,
                  or contact support.
                </p>
              </div>
            </motion.div>
          )}

          {/* Back to Home Button */}
          {status !== "loading" && (
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          © {new Date().getFullYear()} Admas University. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default Unsubscribe;
