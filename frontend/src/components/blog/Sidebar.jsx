import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Eye,
  Heart,
  ChevronRight,
  X,
  Menu,
  Sparkles,
  BookOpen,
  Users,
  Calendar,
  MessageCircle,
} from "lucide-react";
import Avatar from "../common/Avatar";
import { formatNumber } from "../../utils/blogUtils";

// Category icons mapping
const CATEGORY_ICONS = {
  academic: BookOpen,
  research: TrendingUp,
  "campus-life": Users,
  events: Calendar,
  technology: Sparkles,
  innovation: TrendingUp,
  sports: Users,
  culture: BookOpen,
  opinion: MessageCircle,
};

/**
 * Sidebar Component
 *
 * Displays trending posts and categories for content discovery
 * with GSAP stagger animations and mobile drawer support
 */
const Sidebar = ({
  trendingPosts = [],
  categories = [],
  selectedCategory = null,
  onCategorySelect,
  isMobile = false,
  trendingLoading = false,
  categoriesLoading = false,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const trendingRef = useRef(null);
  const categoriesRef = useRef(null);

  // GSAP stagger animation for trending posts - with visibility fallback
  useEffect(() => {
    if (!trendingRef.current || trendingPosts.length === 0) return;

    const items = trendingRef.current.querySelectorAll(".trending-item");

    // Ensure items are visible even if animation fails
    items.forEach((item) => {
      item.style.opacity = "1";
      item.style.transform = "translateX(0)";
    });

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0.5, x: -10 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.out",
        }
      );
    }, trendingRef);

    return () => ctx.revert();
  }, [trendingPosts]);

  // GSAP stagger animation for categories - with visibility fallback
  useEffect(() => {
    if (!categoriesRef.current || categories.length === 0) return;

    const items = categoriesRef.current.querySelectorAll(".category-item");

    // Ensure items are visible even if animation fails
    items.forEach((item) => {
      item.style.opacity = "1";
      item.style.transform = "translateX(0)";
    });

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0.5, x: -10 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.03,
          ease: "power2.out",
          delay: 0.1,
        }
      );
    }, categoriesRef);

    return () => ctx.revert();
  }, [categories]);

  // Sidebar content
  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Trending Posts Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Trending Posts
          </h3>
        </div>

        <div ref={trendingRef} className="space-y-4">
          {trendingLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : trendingPosts.length > 0 ? (
            trendingPosts.slice(0, 5).map((post, index) => (
              <Link
                key={post._id}
                to={`/posts/${post._id}`}
                className="trending-item group flex gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {/* Rank Number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>

                {/* Post Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      {formatNumber(post.views || 0)}
                    </motion.span>
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className="flex items-center gap-1 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-3 h-3" />
                      {formatNumber(post.likesCount || 0)}
                    </motion.span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 self-center" />
              </Link>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No trending posts yet
            </p>
          )}
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Categories
          </h3>
        </div>

        <div ref={categoriesRef} className="space-y-1">
          {categoriesLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              {/* All Categories Option */}
              <button
                onClick={() => onCategorySelect?.(null)}
                className={`category-item w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                  !selectedCategory
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">All Posts</span>
                </div>
              </button>

              {categories.map((cat) => {
                const IconComponent = CATEGORY_ICONS[cat.category] || BookOpen;
                const isSelected = selectedCategory === cat.category;

                return (
                  <button
                    key={cat.category}
                    onClick={() => onCategorySelect?.(cat.category)}
                    className={`category-item w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium capitalize">
                        {cat.category}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-5 text-white">
        <h3 className="font-semibold mb-3">Community Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold">
              {formatNumber(categories.reduce((sum, c) => sum + c.count, 0))}
            </p>
            <p className="text-sm text-white/80">Total Posts</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{categories.length}</p>
            <p className="text-sm text-white/80">Categories</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Drawer
  if (isMobile) {
    return (
      <>
        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-4 right-4 z-40 p-4 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Drawer Overlay */}
        <AnimatePresence>
          {isDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDrawerOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-gray-50 dark:bg-gray-900 z-50 overflow-y-auto p-4 md:hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Discover
                  </h2>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <SidebarContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <aside className="w-80 flex-shrink-0 hidden lg:block">
      <div className="sticky top-24">
        <SidebarContent />
      </div>
    </aside>
  );
};

export default Sidebar;
