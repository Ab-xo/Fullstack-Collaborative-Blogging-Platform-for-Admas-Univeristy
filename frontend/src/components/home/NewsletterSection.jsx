/**
 * ============================================================================
 * NEWSLETTER SECTION
 * ============================================================================
 *
 * A beautiful newsletter subscription section with university students
 * background image and email signup form.
 *
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Send, CheckCircle, Sparkles, Users } from "lucide-react";
import toast from "react-hot-toast";
import { subscribe, getStats } from "../../api/newsletter";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);

  // Fetch subscriber count on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getStats();
        if (response.success) {
          setSubscriberCount(response.data.totalSubscribers);
        }
      } catch (error) {
        // Silently fail - show default count
        console.log("Could not fetch subscriber stats");
      }
    };
    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await subscribe(email, "homepage");

      if (response.success) {
        setIsSubscribed(true);
        setEmail("");
        setSubscriberCount((prev) => prev + 1);
        toast.success(response.message || "Welcome to our community! 🎉");

        // Reset after 5 seconds
        setTimeout(() => setIsSubscribed(false), 5000);
      } else {
        toast.error(
          response.message || "Failed to subscribe. Please try again."
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to subscribe. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format subscriber count
  const formatCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k+`;
    }
    return `${count}+`;
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="University Students"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 via-primary-800/85 to-indigo-900/90" />
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
        animate={{
          y: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl"
        animate={{
          y: [0, -20, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl"
        animate={{
          x: [0, 20, 0],
          y: [0, -10, 0],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm mb-6"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Join Our Community
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Stay Connected with{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">
              Admas University
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-white/80 mb-8 max-w-2xl mx-auto"
          >
            Subscribe to our newsletter and never miss the latest research,
            campus news, academic insights, and community updates from our
            vibrant university community.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-8 mb-10"
          >
            <div className="flex items-center gap-2 text-white/70">
              <Users className="w-5 h-5 text-cyan-400" />
              <span className="text-sm">
                {formatCount(subscriberCount)} Subscribers
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Mail className="w-5 h-5 text-amber-400" />
              <span className="text-sm">Weekly Updates</span>
            </div>
          </motion.div>

          {/* Newsletter Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {isSubscribed ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center gap-3 p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div className="text-left">
                  <p className="text-white font-semibold">You're all set!</p>
                  <p className="text-white/70 text-sm">
                    Thank you for joining our community.
                  </p>
                </div>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="relative max-w-xl mx-auto"
              >
                <div className="relative flex flex-col sm:flex-row gap-3">
                  {/* Email Input */}
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-white/20 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-primary-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <>
                        <span>Subscribe</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Privacy Note */}
                <p className="mt-4 text-sm text-white/60">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
