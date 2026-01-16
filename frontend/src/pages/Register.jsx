/**
 * ============================================================================
 * REGISTER PAGE - STANDALONE REGISTRATION PAGE
 * ============================================================================
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Zap, Globe } from "lucide-react";
import RegisterForm from "../components/auth/RegisterForm";

const Register = () => {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Animated Background Orbs */}
      <motion.div
        className="absolute top-20 right-20 w-72 h-72 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center px-6 sm:px-8 lg:px-12 py-8">
        <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
          {/* Left Side - Information Panel */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:flex lg:w-5/12 flex-col justify-center relative z-10"
          >
            <div className="relative z-10 max-w-md">
              <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Start Your{" "}
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                  Academic Journey
                </span>
              </h2>

              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Create your account and become part of a thriving community of
                scholars and innovators.
              </p>

              {/* Benefits */}
              <div className="space-y-4">
                {[
                  {
                    icon: Shield,
                    title: "Secure & Verified",
                    description: "Protected with university-level security",
                  },
                  {
                    icon: Zap,
                    title: "Instant Publishing",
                    description: "Share your thoughts with the community",
                  },
                  {
                    icon: Globe,
                    title: "Global Reach",
                    description: "Connect with academics worldwide",
                  },
                ].map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex items-start space-x-4 p-4 rounded-2xl glass card-hover border border-gray-200 dark:border-white/10"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {benefit.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {benefit.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Register Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-7/12 flex items-center justify-center relative z-10"
          >
            <div className="w-full max-w-lg">
              {/* Form Card */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-blue-500/30 rounded-3xl blur-xl opacity-20" />

                <div className="relative glass rounded-2xl shadow-2xl border border-gray-200 dark:border-white/20 p-6 sm:p-8 max-h-[85vh] overflow-y-auto scrollbar-thin">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Create Account
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Join the community today
                    </p>
                  </div>

                  <RegisterForm />
                </div>
              </div>

              {/* Back to Home */}
              <div className="mt-6 text-center">
                <Link
                  to="/"
                  className="inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
