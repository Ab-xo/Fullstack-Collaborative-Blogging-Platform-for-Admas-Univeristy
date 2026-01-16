/**
 * ============================================================================
 * FEATURED BLOGS SECTION - Real Data from Database
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Clock,
  Heart,
  MessageCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BookOpen,
  Eye,
  User,
} from "lucide-react";
import apiClient from "../../api/client";

// Author Avatar component with proper fallback handling
const AuthorAvatar = ({ author }) => {
  const [imageError, setImageError] = useState(false);

  const getAuthorInitial = (author) => {
    if (!author) return "A";
    if (author.firstName) return author.firstName.charAt(0).toUpperCase();
    if (author.username) return author.username.charAt(0).toUpperCase();
    return "A";
  };

  const getAuthorName = (author) => {
    if (!author) return "Anonymous";
    if (author.firstName && author.lastName) {
      return `${author.firstName} ${author.lastName}`;
    }
    if (author.username) return author.username;
    return "Anonymous";
  };

  // Check for avatar in multiple locations (profile.avatar or profilePicture)
  const avatarUrl = author?.profile?.avatar || author?.profilePicture;

  if (avatarUrl && !imageError) {
    return (
      <img
        src={avatarUrl}
        alt={getAuthorName(author)}
        className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 dark:border-blue-800"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
      {getAuthorInitial(author)}
    </div>
  );
};

const FeaturedBlogs = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try multiple endpoints to get posts
        let posts = [];

        // First try: public stats endpoint
        try {
          const statsResponse = await apiClient.get("/public/stats");
          if (
            statsResponse.data?.success &&
            statsResponse.data?.data?.recentPosts?.length > 0
          ) {
            posts = statsResponse.data.data.recentPosts;
          }
        } catch (e) {
          console.log("Stats endpoint failed, trying featured...");
        }

        // Second try: featured endpoint
        if (posts.length === 0) {
          try {
            const featuredResponse = await apiClient.get("/public/featured");
            if (
              featuredResponse.data?.success &&
              featuredResponse.data?.data?.length > 0
            ) {
              posts = featuredResponse.data.data;
            }
          } catch (e) {
            console.log("Featured endpoint failed, trying posts...");
          }
        }

        // Third try: direct posts endpoint (published posts)
        if (posts.length === 0) {
          try {
            const postsResponse = await apiClient.get(
              "/posts?status=published&limit=6"
            );
            if (
              postsResponse.data?.success &&
              postsResponse.data?.data?.posts?.length > 0
            ) {
              posts = postsResponse.data.data.posts;
            } else if (postsResponse.data?.posts?.length > 0) {
              posts = postsResponse.data.posts;
            }
          } catch (e) {
            console.log("Posts endpoint failed");
          }
        }

        setFeaturedPosts(posts);

        if (posts.length === 0) {
          // No error, just no posts available
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching featured posts:", err);
        setError(null); // Don't show error, just show empty state
        setFeaturedPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, []);

  const getCategoryColor = (category) => {
    const colors = {
      research: "from-blue-500 to-cyan-500",
      technology: "from-purple-500 to-pink-500",
      academic: "from-green-500 to-emerald-500",
      "campus-life": "from-orange-500 to-amber-500",
      events: "from-red-500 to-rose-500",
      tutorials: "from-indigo-500 to-blue-500",
      innovation: "from-violet-500 to-purple-500",
      science: "from-teal-500 to-cyan-500",
      engineering: "from-slate-500 to-gray-500",
      culture: "from-pink-500 to-rose-500",
      arts: "from-fuchsia-500 to-pink-500",
      career: "from-amber-500 to-yellow-500",
      sports: "from-lime-500 to-green-500",
      default: "from-indigo-500 to-purple-500",
    };
    const categorySlug =
      typeof category === "object" ? category?.slug : category;
    return colors[categorySlug] || colors.default;
  };

  const getCategoryName = (category) => {
    if (typeof category === "object" && category?.name) {
      return category.name;
    }
    if (typeof category === "string") {
      return (
        category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")
      );
    }
    return "Article";
  };

  const getAuthorName = (author) => {
    if (!author) return "Anonymous";
    if (author.firstName && author.lastName) {
      return `${author.firstName} ${author.lastName}`;
    }
    if (author.username) {
      return author.username;
    }
    return "Anonymous";
  };

  const getAuthorInitial = (author) => {
    if (!author) return "A";
    if (author.firstName) return author.firstName.charAt(0).toUpperCase();
    if (author.username) return author.username.charAt(0).toUpperCase();
    return "A";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const estimateReadTime = (content) => {
    if (!content) return "3 min read";
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  return (
    <section className="relative py-16 sm:py-24 bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/3 to-cyan-500/3 dark:from-blue-500/5 dark:to-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Featured{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500">
              Stories
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
            Discover the most engaging articles from our vibrant academic
            community
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg animate-pulse"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Unable to load posts at the moment
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && featuredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Stories Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Our community is just getting started. Be among the first to share
              your knowledge and insights!
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/25"
            >
              Join & Start Writing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Posts Grid */}
        {!isLoading && !error && featuredPosts.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredPosts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={`/posts/${post.slug || post._id}`}
                  className="group block bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
                >
                  {/* Image Container */}
                  <div className="relative h-48 sm:h-52 overflow-hidden">
                    <img
                      src={
                        post.featuredImage ||
                        `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800`
                      }
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";
                      }}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getCategoryColor(
                          post.category
                        )} shadow-lg`}
                      >
                        {getCategoryName(post.category)}
                      </span>
                    </div>

                    {/* Views Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full text-white text-xs">
                      <Eye className="w-3 h-3" />
                      <span>{post.views || post.viewsCount || 0}</span>
                    </div>

                    {/* Floating Illustration Accent */}
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {post.excerpt ||
                        "Click to read this amazing article from our community..."}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(post.createdAt)}</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-red-400" />
                          <span>{post.likesCount || 0}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4 text-blue-400" />
                          <span>{post.commentsCount || 0}</span>
                        </span>
                      </div>
                    </div>

                    {/* Author & Read More */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <AuthorAvatar author={post.author} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {getAuthorName(post.author)}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:gap-2 transition-all">
                        Read
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Button */}
        {!isLoading && featuredPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-1"
            >
              <BookOpen className="w-5 h-5" />
              <span>Explore All Posts</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FeaturedBlogs;
