import { Link } from "react-router-dom";
import { ArrowRight, PenTool, Sparkles } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

/**
 * Smart Call-to-Action Component
 * Shows different CTAs based on user authentication and role status
 */
const SmartCTA = ({ variant = "hero" }) => {
  const { user, isAuthenticated } = useAuth();

  // Check if user is an author (has author, moderator, or admin role)
  const isAuthor = user?.roles?.some(role => 
    ['author', 'moderator', 'admin'].includes(role)
  );

  // For logged-in users who are already authors
  if (isAuthenticated && isAuthor) {
    return (
      <div className={variant === "hero" ? "hero-animate space-y-3 sm:space-y-4" : "space-y-3"}>
        <h3 className={variant === "hero" ? "text-xl sm:text-2xl md:text-3xl font-bold text-white" : "text-2xl font-bold text-gray-900 dark:text-white"}>
          Welcome Back, {user?.firstName}! 👋
        </h3>
        <Link
          to="/posts/create"
          className={`inline-flex items-center justify-center px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105`}
        >
          <PenTool className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
          Create New Post
          <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
        </Link>
      </div>
    );
  }

  // For logged-in users who are NOT authors (readers only)
  if (isAuthenticated && !isAuthor) {
    return (
      <div className={variant === "hero" ? "hero-animate space-y-3 sm:space-y-4" : "space-y-3"}>
        <h3 className={variant === "hero" ? "text-xl sm:text-2xl md:text-3xl font-bold text-white" : "text-2xl font-bold text-gray-900 dark:text-white"}>
          Ready to Share Your Knowledge? ✍️
        </h3>
        <p className={variant === "hero" ? "text-sm sm:text-base text-white/80 max-w-xl mx-auto" : "text-sm text-gray-600 dark:text-gray-400"}>
          Become an author and start publishing your ideas!
        </p>
        <Link
          to="/contact"
          className={`inline-flex items-center justify-center px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105`}
        >
          <Sparkles className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
          Request Author Access
          <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
        </Link>
      </div>
    );
  }

  // For guest users (not logged in)
  return (
    <div className={variant === "hero" ? "hero-animate space-y-3 sm:space-y-4" : "space-y-3"}>
      <h3 className={variant === "hero" ? "text-xl sm:text-2xl md:text-3xl font-bold text-white" : "text-2xl font-bold text-gray-900 dark:text-white"}>
        Ready to Join Our Community?
      </h3>
      <Link
        to="/register"
        className={`inline-flex items-center justify-center px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105`}
      >
        Get Started
        <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
      </Link>
    </div>
  );
};

export default SmartCTA;
