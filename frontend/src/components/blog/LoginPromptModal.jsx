import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  MessageCircle,
  UserPlus,
  Share2,
  Bookmark,
  Bell,
  Users,
  Sparkles,
} from "lucide-react";

// Action-specific content
const ACTION_CONTENT = {
  like: {
    icon: Heart,
    title: "Like this post?",
    description:
      "Sign in to like posts and show appreciation for great content.",
    benefits: [
      "Like and save your favorite posts",
      "Build your reading history",
      "Get personalized recommendations",
    ],
  },
  comment: {
    icon: MessageCircle,
    title: "Join the conversation",
    description:
      "Sign in to share your thoughts and engage with the community.",
    benefits: [
      "Comment on posts",
      "Reply to other readers",
      "Get notified of responses",
    ],
  },
  follow: {
    icon: UserPlus,
    title: "Follow this author?",
    description: "Sign in to follow authors and never miss their new posts.",
    benefits: [
      "Follow your favorite authors",
      "Get updates on new posts",
      "Build your personalized feed",
    ],
  },
  share: {
    icon: Share2,
    title: "Share this post",
    description:
      "Sign in to share posts with your network and track engagement.",
    benefits: [
      "Share to social media",
      "Track your shared content",
      "Build your influence",
    ],
  },
  bookmark: {
    icon: Bookmark,
    title: "Save for later?",
    description: "Sign in to bookmark posts and create your reading list.",
    benefits: [
      "Save posts to read later",
      "Organize your bookmarks",
      "Access from any device",
    ],
  },
};

/**
 * LoginPromptModal Component
 *
 * Displays a modal when guests attempt restricted actions
 * with GSAP entrance animation and action-specific messaging
 */
const LoginPromptModal = ({ isOpen = false, onClose, action = "like" }) => {
  const modalRef = useRef(null);
  const contentRef = useRef(null);

  // Get action-specific content
  const content = ACTION_CONTENT[action] || ACTION_CONTENT.like;
  const IconComponent = content.icon;

  // GSAP entrance animation
  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const ctx = gsap.context(() => {
      // Animate icon
      gsap.fromTo(
        ".modal-icon",
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)" }
      );

      // Animate content
      gsap.fromTo(
        ".modal-content > *",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.2,
        }
      );

      // Animate benefits
      gsap.fromTo(
        ".benefit-item",
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.4,
        }
      );
    }, contentRef);

    return () => ctx.revert();
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              ref={contentRef}
              className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Header with Icon */}
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 px-6 py-8 text-center">
                <div className="modal-icon inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
                  <IconComponent className="w-8 h-8 text-primary-500" />
                </div>
                <h2 className="modal-content text-2xl font-bold text-white mb-2">
                  {content.title}
                </h2>
                <p className="modal-content text-white/80">
                  {content.description}
                </p>
              </div>

              {/* Content */}
              <div className="modal-content p-6">
                {/* Benefits */}
                <div className="space-y-3 mb-6">
                  {content.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="benefit-item flex items-center gap-3"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="block w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl text-center transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-center transition-colors"
                  >
                    Create Account
                  </Link>
                </div>

                {/* Community Note */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <Users className="w-5 h-5" />
                    <span>Join thousands of readers in our community</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginPromptModal;
