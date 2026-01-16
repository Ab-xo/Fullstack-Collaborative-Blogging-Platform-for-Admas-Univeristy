/**
 * ============================================================================
 * BLOG PAGE - Modern Layout
 * ============================================================================
 *
 * Modern blog page with:
 * - Left sidebar: Search, filters, categories, trending
 * - Right main area: Beautiful post cards grid
 * - Responsive design with collapsible sidebar on mobile
 */

import { useState, useCallback, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useBlogPage } from "../../hooks/useBlogPage";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import {
  PenTool,
  Users,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileX,
  TrendingUp,
  Bookmark,
  BookmarkPlus,
  Share2,
  Search,
  X,
  Filter,
  ChevronDown,
  Clock,
  Heart,
  Eye,
  Flame,
  Tag,
  FolderOpen,
  SlidersHorizontal,
  LayoutGrid,
  LayoutList,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import EnhancedPostCard from "../../components/blog/EnhancedPostCard";
import Pagination from "../../components/blog/Pagination";
import LoginPromptModal from "../../components/blog/LoginPromptModal";
import toast from "react-hot-toast";

const SORT_OPTIONS = [
  { id: "latest", label: "Latest", icon: Clock },
  { id: "popular", label: "Most Popular", icon: TrendingUp },
  { id: "mostLiked", label: "Most Liked", icon: Heart },
  { id: "mostViewed", label: "Most Viewed", icon: Eye },
];

const TABS = [
  { id: "all", label: "All Posts", icon: FolderOpen },
  { id: "trending", label: "Trending", icon: Flame },
  { id: "saved", label: "Saved", icon: Bookmark },
];

// Hero Section - Consistent with About/Contact pages (Blue/Primary branding for Admas University)
const HeroSection = ({ user, totalPosts, isAuthenticated }) => (
  <section className="relative pt-24 pb-12 overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    {/* Background Decorations - Blue tones */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/30 dark:bg-blue-800/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200/20 dark:bg-cyan-900/10 rounded-full blur-3xl" />
    </div>

    <div className="container-max section-padding relative">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            {totalPosts || 0}+ Articles Published
          </div>
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {isAuthenticated ? (
              <>
                Welcome back,
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                  {user?.firstName || "there"}!
                </span>
              </>
            ) : (
              <>
                Discover
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                  Amazing Stories
                </span>
              </>
            )}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Explore insightful articles from the Admas University community.
            Learn, share, and grow together.
          </p>
          <div className="flex flex-wrap gap-4">
            {user ? (
              <Link to="/posts/create">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  <PenTool className="w-5 h-5" /> Write Story
                </motion.button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                  >
                    <Users className="w-5 h-5" /> Join Community
                  </motion.button>
                </Link>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300"
                  >
                    Sign In
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </motion.div>

        {/* Hero Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:flex justify-center"
        >
          <div className="relative w-full max-w-[400px]">
            <div
              className="absolute -inset-8 bg-gradient-to-br from-blue-500/25 via-cyan-500/20 to-blue-400/25 blur-3xl"
              style={{ borderRadius: "20% 80% 70% 30% / 60% 30% 70% 40%" }}
            />
            <div
              className="absolute -inset-4 border-4 border-dashed border-blue-300/40 dark:border-blue-500/30"
              style={{ borderRadius: "30% 70% 60% 40% / 50% 40% 60% 50%" }}
            />
            <div
              className="relative overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-700 dark:to-gray-800 p-3 shadow-2xl"
              style={{ borderRadius: "25% 75% 65% 35% / 55% 35% 65% 45%" }}
            >
              <img
                src="https://img.freepik.com/free-vector/online-article-concept-illustration_114360-5193.jpg"
                alt="Blog Articles"
                className="w-full h-auto object-cover aspect-square"
                style={{ borderRadius: "25% 75% 65% 35% / 55% 35% 65% 45%" }}
              />
            </div>
            <div className="absolute -top-6 -right-2 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl rotate-12 opacity-70 shadow-lg" />
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-60 shadow-lg" />
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// Left Sidebar Component
const LeftSidebar = ({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
  categories,
  trendingPosts,
  activeTab,
  onTabChange,
  isAuthenticated,
  savedPostsCount,
  isMobile,
  isOpen,
  onToggle,
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const currentSort =
    SORT_OPTIONS.find((s) => s.id === filters.sortBy) || SORT_OPTIONS[0];

  const hasActiveFilters =
    filters.search || filters.category || filters.tags?.length > 0;

  const sidebarContent = (
    <div className="space-y-6">
      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search posts..."
          className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
        {TABS.filter((tab) => tab.id !== "saved" || isAuthenticated).map(
          (tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.id === "saved" && savedPostsCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-full">
                    {savedPostsCount}
                  </span>
                )}
              </button>
            );
          }
        )}
      </div>

      {/* Sort Options */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Sort by: {currentSort.label}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isSortOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        <AnimatePresence>
          {isSortOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 dark:border-gray-700"
            >
              {SORT_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      onFilterChange({ sortBy: option.id });
                      setIsSortOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      filters.sortBy === option.id
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {option.label}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Categories
          </h3>
        </div>
        <div className="max-h-64 overflow-y-auto">
          <button
            onClick={() => onFilterChange({ category: null })}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
              !filters.category
                ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            <span>All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map((cat) => (
              <button
                key={cat?.category || cat?._id || Math.random()}
                onClick={() =>
                  onFilterChange({ category: cat?.category || cat })
                }
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                  filters.category === (cat?.category || cat)
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <span className="capitalize">{cat?.category || cat}</span>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  {cat?.count || 0}
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              Loading categories...
            </div>
          )}
        </div>
      </div>

      {/* Trending Posts */}
      {trendingPosts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Trending Now
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {trendingPosts.slice(0, 5).map((post, index) => (
              <Link
                key={post._id}
                to={`/posts/${post._id}`}
                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-primary-500 to-indigo-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <Eye className="w-3 h-3" />
                    <span>{post.views || 0}</span>
                    <Heart className="w-3 h-3 ml-2" />
                    <span>{post.likesCount || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
        >
          <X className="w-4 h-4" />
          Clear All Filters
        </button>
      )}
    </div>
  );

  // Mobile sidebar with overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile Filter Button */}
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-40 p-4 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors lg:hidden"
        >
          <Filter className="w-6 h-6" />
        </button>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onToggle}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 w-80 bg-gray-50 dark:bg-gray-900 z-50 overflow-y-auto p-4 lg:hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Filters
                  </h2>
                  <button
                    onClick={onToggle}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {sidebarContent}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside className="hidden lg:block w-80 flex-shrink-0">
      <div className="sticky top-24 space-y-6">{sidebarContent}</div>
    </aside>
  );
};

// Post Skeleton
const PostSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200 dark:bg-gray-700" />
    <div className="p-5 space-y-3">
      <div className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="flex items-center gap-3 pt-2">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  </div>
);

// Empty State
const EmptyState = ({ type, onAction }) => {
  const configs = {
    noResults: {
      icon: FileX,
      title: "No posts found",
      description: "Try adjusting your search or filters",
      action: "Clear Filters",
    },
    noPosts: {
      icon: Sparkles,
      title: "No posts yet",
      description: "Be the first to share your story!",
      action: "Write a Post",
    },
    noSaved: {
      icon: Bookmark,
      title: "No saved posts",
      description: "Save posts you love to read them later",
      action: "Explore Posts",
    },
    noTrending: {
      icon: TrendingUp,
      title: "No trending posts",
      description: "Posts with high engagement will appear here",
      action: "Explore All Posts",
    },
  };

  const config = configs[type] || configs.noPosts;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
    >
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full mb-6">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {config.title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {config.description}
      </p>
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
      >
        <RefreshCw className="w-4 h-4" />
        {config.action}
      </button>
    </motion.div>
  );
};

// Error State
const ErrorState = ({ error, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-900"
  >
    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
      <AlertCircle className="w-10 h-10 text-red-500" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      Something went wrong
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6">
      {error || "Please try again"}
    </p>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
    >
      <RefreshCw className="w-4 h-4" />
      Try Again
    </button>
  </motion.div>
);

// Delete Confirm Modal
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, postTitle }) => {
  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/50 z-50" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Delete Post?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Delete "{postTitle}"? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

// Main Blog Page Component
const BlogPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [viewMode, setViewMode] = useState("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [loginPromptAction, setLoginPromptAction] = useState("like");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [savedPosts, setSavedPosts] = useState(new Set());

  const {
    posts,
    loading,
    error,
    pagination,
    filters,
    trendingPosts,
    categories,
    trendingLoading,
    fetchPosts,
    likePost,
    deletePost,
    updateFilters,
    clearFilters,
    goToPage,
    isLiked,
  } = useBlogPage();

  // Handle URL query parameters on initial load only
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");
    const tagParam = searchParams.get("tag");

    // Only update filters if there are URL params and they differ from current filters
    const newFilters = {};
    let hasChanges = false;

    if (categoryParam && categoryParam !== filters.category) {
      newFilters.category = categoryParam;
      hasChanges = true;
    }
    if (searchParam && searchParam !== filters.search) {
      newFilters.search = searchParam;
      hasChanges = true;
    }
    if (tagParam) {
      const currentTag = filters.tags?.[0];
      if (tagParam !== currentTag) {
        newFilters.tags = [tagParam];
        hasChanges = true;
      }
    }

    if (hasChanges) {
      updateFilters(newFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Handlers
  const handleSearchChange = useCallback(
    (query) => {
      updateFilters({ search: query });
      if (query) {
        searchParams.set("search", query);
      } else {
        searchParams.delete("search");
      }
      setSearchParams(searchParams, { replace: true });
    },
    [updateFilters, searchParams, setSearchParams]
  );

  const handleFilterChange = useCallback(
    (newFilters) => {
      updateFilters(newFilters);
      if (newFilters.category !== undefined) {
        if (newFilters.category) {
          searchParams.set("category", newFilters.category);
        } else {
          searchParams.delete("category");
        }
        setSearchParams(searchParams, { replace: true });
      }
    },
    [updateFilters, searchParams, setSearchParams]
  );

  const handleClearFilters = useCallback(() => {
    clearFilters();
    searchParams.delete("category");
    searchParams.delete("search");
    searchParams.delete("tag");
    setSearchParams(searchParams, { replace: true });
  }, [clearFilters, searchParams, setSearchParams]);

  const handleTabChange = useCallback(
    (tabId) => {
      setActiveTab(tabId);
      if (tabId === "trending") {
        updateFilters({ sortBy: "popular" });
      } else if (tabId === "all") {
        updateFilters({ sortBy: "latest" });
      }
      if (isMobile) setSidebarOpen(false);
    },
    [updateFilters, isMobile]
  );

  const handleLoginPrompt = useCallback((action) => {
    setLoginPromptAction(action);
    setLoginPromptOpen(true);
  }, []);

  const handleLike = useCallback(
    async (postId) => {
      const result = await likePost(postId);
      if (result.requiresAuth) handleLoginPrompt("like");
    },
    [likePost, handleLoginPrompt]
  );

  const handleDeleteRequest = useCallback(
    (postId) => {
      const post = posts.find((p) => p._id === postId);
      if (post) {
        setPostToDelete(post);
        setDeleteModalOpen(true);
      }
    },
    [posts]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (postToDelete) {
      await deletePost(postToDelete._id);
      setDeleteModalOpen(false);
      setPostToDelete(null);
    }
  }, [postToDelete, deletePost]);

  const handleSave = useCallback(
    (postId) => {
      if (!isAuthenticated) {
        handleLoginPrompt("save");
        return;
      }
      setSavedPosts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(postId)) {
          newSet.delete(postId);
          toast.success("Removed from saved");
        } else {
          newSet.add(postId);
          toast.success("Post saved!");
        }
        return newSet;
      });
    },
    [isAuthenticated, handleLoginPrompt]
  );

  const handleShare = useCallback(async (post) => {
    const url = `${window.location.origin}/posts/${post._id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url });
      } catch (err) {
        if (err.name !== "AbortError") {
          navigator.clipboard.writeText(url);
          toast.success("Link copied!");
        }
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  }, []);

  // Determine displayed posts based on active tab
  const displayedPosts =
    activeTab === "saved"
      ? posts.filter((post) => savedPosts.has(post._id))
      : activeTab === "trending"
      ? trendingPosts.length > 0
        ? trendingPosts
        : posts
      : posts;

  const hasActiveFilters =
    filters.search || filters.category || filters.tags?.length > 0;
  const isLoading = loading || (activeTab === "trending" && trendingLoading);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <HeroSection
        user={user}
        totalPosts={pagination.totalPosts}
        isAuthenticated={isAuthenticated}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <LeftSidebar
            searchQuery={filters.search}
            onSearchChange={handleSearchChange}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            categories={categories}
            trendingPosts={trendingPosts}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isAuthenticated={isAuthenticated}
            savedPostsCount={savedPosts.size}
            isMobile={isMobile}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* View Mode Toggle & Results Count */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {activeTab === "trending"
                    ? "Trending Posts"
                    : activeTab === "saved"
                    ? "Saved Posts"
                    : "All Posts"}
                </h2>
                {!isLoading && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({displayedPosts.length}{" "}
                    {displayedPosts.length === 1 ? "post" : "posts"})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                      : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                      : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title="List view"
                >
                  <LayoutList className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && displayedPosts.length === 0 && (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                {[...Array(6)].map((_, i) => (
                  <PostSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <ErrorState error={error} onRetry={() => fetchPosts(1)} />
            )}

            {/* Empty States */}
            {!isLoading && !error && displayedPosts.length === 0 && (
              <EmptyState
                type={
                  activeTab === "saved"
                    ? "noSaved"
                    : activeTab === "trending"
                    ? "noTrending"
                    : hasActiveFilters
                    ? "noResults"
                    : "noPosts"
                }
                onAction={
                  activeTab === "saved" || activeTab === "trending"
                    ? () => handleTabChange("all")
                    : hasActiveFilters
                    ? handleClearFilters
                    : () => {}
                }
              />
            )}

            {/* Posts Grid */}
            {!isLoading && !error && displayedPosts.length > 0 && (
              <>
                <motion.div
                  layout
                  className={`grid gap-6 auto-rows-fr ${
                    viewMode === "grid"
                      ? "grid-cols-1 md:grid-cols-2"
                      : "grid-cols-1"
                  }`}
                >
                  <AnimatePresence mode="popLayout">
                    {displayedPosts.map((post, index) => (
                      <motion.div
                        key={post._id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative group h-full"
                      >
                        <EnhancedPostCard
                          post={post}
                          index={index}
                          viewMode={viewMode}
                          user={user}
                          isAuthenticated={isAuthenticated}
                          isLiked={isLiked(post._id)}
                          onLike={handleLike}
                          onDelete={handleDeleteRequest}
                          onLoginPrompt={handleLoginPrompt}
                        />

                        {/* Quick Actions */}
                        {isAuthenticated && (
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={() => handleSave(post._id)}
                              className={`p-2 rounded-lg backdrop-blur-sm transition-all shadow-lg ${
                                savedPosts.has(post._id)
                                  ? "bg-primary-600 text-white"
                                  : "bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800"
                              }`}
                              title={
                                savedPosts.has(post._id) ? "Unsave" : "Save"
                              }
                            >
                              {savedPosts.has(post._id) ? (
                                <Bookmark className="w-4 h-4 fill-current" />
                              ) : (
                                <BookmarkPlus className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleShare(post)}
                              className="p-2 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-lg"
                              title="Share"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                {activeTab === "all" && pagination.totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      totalItems={pagination.totalPosts}
                      itemsPerPage={pagination.postsPerPage}
                      onPageChange={goToPage}
                    />
                  </div>
                )}
              </>
            )}

            {/* Loading Overlay */}
            {loading && posts.length > 0 && (
              <div className="fixed inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-40">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Loading...
                  </span>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      <LoginPromptModal
        isOpen={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        action={loginPromptAction}
      />
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPostToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        postTitle={postToDelete?.title}
      />
    </div>
  );
};

export default BlogPage;
