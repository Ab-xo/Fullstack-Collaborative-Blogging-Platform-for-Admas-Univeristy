import { useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import {
  Heart,
  Eye,
  MessageCircle,
  Clock,
  Share2,
  Edit,
  Trash2,
  BarChart3,
  UserPlus,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import Badge from "../common/Badge";
import Avatar from "../common/Avatar";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import {
  calculateReadingTime,
  formatNumber,
  getStatusBadgeConfig,
} from "../../utils/blogUtils";
import { getPostCardConfig } from "../../utils/roleConfig";

/**
 * Enhanced Post Card Component with Role-Based Features
 *
 * Supports three user roles:
 * - Guest: View only, signup prompts for interactions
 * - Reader: Full engagement (like, follow, share, comment)
 * - Author: Management features for own posts (edit, delete, analytics)
 */
const EnhancedPostCard = ({
  post,
  index = 0,
  viewMode = "grid",
  user = null,
  isAuthenticated = false,
  isLiked = false,
  isFollowingAuthor = false,
  onLike,
  onFollow,
  onDelete,
  onLoginPrompt,
}) => {
  const cardRef = useRef(null);
  const navigate = useNavigate();

  // Get role-based configuration
  const cardConfig = getPostCardConfig(post, user, isAuthenticated);
  const statusConfig = getStatusBadgeConfig(post.status);

  // Calculate reading time
  const readingTime = calculateReadingTime(post.content || "");

  // GSAP entrance animation - with fallback to ensure visibility
  useEffect(() => {
    if (!cardRef.current) return;

    // Ensure card is visible even if animation fails
    const card = cardRef.current;
    card.style.opacity = "1";
    card.style.transform = "translateY(0)";

    const ctx = gsap.context(() => {
      gsap.fromTo(
        card,
        { opacity: 0.5, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          delay: Math.min(index * 0.05, 0.3), // Cap delay at 0.3s
          ease: "power2.out",
        }
      );
    }, cardRef);

    return () => ctx.revert();
  }, [index]);

  // Handle like action
  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cardConfig.canLike) {
      if (onLoginPrompt) {
        onLoginPrompt("like");
      } else {
        toast.error("Please login to like posts");
      }
      return;
    }

    if (onLike) {
      onLike(post._id);
    }
  };

  // Handle follow action
  const handleFollow = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cardConfig.canFollow) {
      if (onLoginPrompt) {
        onLoginPrompt("follow");
      }
      return;
    }

    if (onFollow) {
      onFollow(post.author?._id || post.author);
    }
  };

  // Handle share action
  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const postUrl = `${window.location.origin}/posts/${post._id}`;

    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: postUrl,
      });
    } else {
      navigator.clipboard.writeText(postUrl);
      toast.success("Link copied!");
    }
  };

  // Handle edit action (author only)
  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/posts/${post._id}/edit`);
  };

  // Handle delete action (author only)
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onDelete) {
      onDelete(post._id);
    }
  };

  // Author info
  const authorName =
    post.author?.fullName || post.author?.firstName || "Unknown Author";
  const authorAvatar = post.author?.profile?.avatar;
  const publishDate = post.publishedAt || post.createdAt;

  // Render status badge for authors viewing their own posts
  const renderStatusBadge = () => {
    if (!cardConfig.showStatusBadge || post.status === "published") return null;

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bgClass} ${statusConfig.textClass}`}
      >
        {statusConfig.label}
      </span>
    );
  };

  // Render author actions (edit/delete)
  const renderAuthorActions = () => {
    if (!cardConfig.showEditButton && !cardConfig.showDeleteButton) return null;

    return (
      <div className="flex items-center gap-1">
        {cardConfig.showEditButton && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleEdit}
            className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors"
            title="Edit post"
          >
            <Edit className="w-4 h-4" />
          </motion.button>
        )}
        {cardConfig.showDeleteButton && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 transition-colors"
            title="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    );
  };

  // Render guest signup prompt
  const renderGuestPrompt = () => {
    if (!cardConfig.showSignupPrompts) return null;

    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onLoginPrompt) onLoginPrompt("follow");
        }}
        className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
      >
        <UserPlus className="w-3 h-3" />
        Sign up to follow
      </button>
    );
  };

  // Render rejection notice for authors
  const renderRejectionNotice = () => {
    if (!cardConfig.isOwner || post.status !== "rejected") return null;

    return (
      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              Post Rejected
            </p>
            {post.moderationNotes && (
              <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                {post.moderationNotes}
              </p>
            )}
            <button
              onClick={handleEdit}
              className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 mt-2 underline"
            >
              Edit and resubmit
            </button>
          </div>
        </div>
      </div>
    );
  };

  // List View
  if (viewMode === "list") {
    return (
      <motion.div
        ref={cardRef}
        layout
        className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border ${
          cardConfig.highlightAsOwn
            ? "border-primary-300 dark:border-primary-600 ring-2 ring-primary-100 dark:ring-primary-900/30"
            : "border-gray-100 dark:border-gray-700"
        }`}
      >
        <Link to={`/posts/${post._id}`} className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative w-full md:w-72 h-48 md:h-auto flex-shrink-0 overflow-hidden">
            {post.featuredImage ? (
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-white/50" />
              </div>
            )}
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge
                variant="primary"
                className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90"
              >
                {post.category}
              </Badge>
              {renderStatusBadge()}
            </div>

            {/* Top Right Badge */}
            {cardConfig.highlightAsOwn ? (
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 text-xs font-medium bg-primary-500 text-white rounded-full backdrop-blur-sm">
                  Your Post
                </span>
              </div>
            ) : (
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 text-xs font-medium bg-black/50 text-white rounded-full backdrop-blur-sm">
                  {readingTime} min
                </span>
              </div>
            )}

            {/* Owner Actions - Bottom Left (for list view) */}
            {(cardConfig.showEditButton || cardConfig.showDeleteButton) && (
              <div className="absolute bottom-3 left-3 flex gap-2">
                {cardConfig.showEditButton && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleEdit}
                    className="p-2 rounded-full bg-blue-500 text-white backdrop-blur-sm shadow-lg hover:shadow-blue-500/50 transition-all"
                    title="Edit post"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                )}
                {cardConfig.showDeleteButton && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDelete}
                    className="p-2 rounded-full bg-red-500 text-white backdrop-blur-sm shadow-lg hover:shadow-red-500/50 transition-all"
                    title="Delete post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            )}

            {/* Hover Overlay - Bookmark/Share for NON-owner posts (Bottom Right) */}
            {!cardConfig.highlightAsOwn && cardConfig.canLike && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLike}
                  className={`p-2 rounded-full backdrop-blur-sm shadow-lg transition-all ${
                    isLiked
                      ? "bg-red-500 text-white shadow-red-500/50"
                      : "bg-white/90 text-gray-700 hover:bg-white hover:shadow-gray-300"
                  }`}
                  title={isLiked ? "Unlike" : "Like"}
                >
                  <Heart
                    className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                  />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShare}
                  className="p-2 rounded-full bg-white/90 text-gray-700 hover:bg-white backdrop-blur-sm shadow-lg hover:shadow-gray-300 transition-all"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                src={authorAvatar}
                alt={authorName}
                fallback={authorName}
                size="sm"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {authorName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(publishDate), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
              {post.title}
            </h3>

            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {post.excerpt}
            </p>

            {renderRejectionNotice()}

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1 hover:text-primary-500 transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  {readingTime} min read
                </motion.span>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {formatNumber(post.views || 0)}
                </motion.span>
                {cardConfig.showPostAnalytics && (
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1 hover:text-purple-500 transition-colors cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </motion.span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {cardConfig.showSignupPrompts ? (
                  renderGuestPrompt()
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleLike}
                      className={`p-2 rounded-full transition-all duration-300 ${
                        isLiked
                          ? "bg-red-100 text-red-600 dark:bg-red-900/30 shadow-lg shadow-red-200 dark:shadow-red-900/20"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                      }`}
                    >
                      <motion.div
                        animate={
                          isLiked
                            ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }
                            : {}
                        }
                        transition={{ duration: 0.5 }}
                      >
                        <Heart
                          className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                        />
                      </motion.div>
                    </motion.button>
                    <motion.span
                      animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
                      className="text-sm text-gray-500 font-medium"
                    >
                      {formatNumber(post.likesCount || 0)}
                    </motion.span>
                  </>
                )}
                <motion.button
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShare}
                  className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-500 hover:text-blue-600 transition-all duration-300"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Grid View (default)
  return (
    <motion.div
      ref={cardRef}
      layout
      whileHover={{ y: -8 }}
      className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border h-full flex flex-col ${
        cardConfig.highlightAsOwn
          ? "border-primary-300 dark:border-primary-600 ring-2 ring-primary-100 dark:ring-primary-900/30"
          : "border-gray-100 dark:border-gray-700"
      }`}
    >
      <Link to={`/posts/${post._id}`} className="flex flex-col h-full">
        {/* Image */}
        <div className="relative h-48 flex-shrink-0 overflow-hidden">
          {post.featuredImage ? (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-white/50" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge
              variant="primary"
              className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90"
            >
              {post.category}
            </Badge>
            {renderStatusBadge()}
          </div>

          {/* Reading Time Badge - Top Right */}
          {!cardConfig.highlightAsOwn && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 text-xs font-medium bg-black/50 text-white rounded-full backdrop-blur-sm">
                {readingTime} min
              </span>
            </div>
          )}

          {/* Owner Actions - Bottom Left (so they don't overlap with hover overlay) */}
          {(cardConfig.showEditButton || cardConfig.showDeleteButton) && (
            <div className="absolute bottom-3 left-3 flex gap-2">
              {cardConfig.showEditButton && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleEdit}
                  className="p-2.5 rounded-full bg-blue-500 text-white backdrop-blur-sm shadow-lg hover:shadow-blue-500/50 transition-all"
                  title="Edit post"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
              )}
              {cardConfig.showDeleteButton && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  className="p-2.5 rounded-full bg-red-500 text-white backdrop-blur-sm shadow-lg hover:shadow-red-500/50 transition-all"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          )}

          {/* Hover Overlay - Bookmark/Share for NON-owner posts (Bottom Right) */}
          {!cardConfig.highlightAsOwn && cardConfig.canLike && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className={`p-2.5 rounded-full backdrop-blur-sm shadow-lg transition-all ${
                  isLiked
                    ? "bg-red-500 text-white shadow-red-500/50"
                    : "bg-white/90 text-gray-700 hover:bg-white hover:shadow-gray-300"
                }`}
                title={isLiked ? "Unlike" : "Like"}
              >
                <motion.div
                  animate={
                    isLiked
                      ? { scale: [1, 1.3, 1], rotate: [0, -15, 15, 0] }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                >
                  <Heart
                    className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                  />
                </motion.div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white/90 text-gray-700 hover:bg-white backdrop-blur-sm shadow-lg hover:shadow-gray-300 transition-all"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 min-h-[3.5rem]">
            {post.title}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem] flex-grow">
            {post.excerpt}
          </p>

          {renderRejectionNotice()}

          {/* Author & Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
            <div className="flex items-center gap-2">
              <Avatar
                src={authorAvatar}
                alt={authorName}
                fallback={authorName}
                size="xs"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[100px]">
                {authorName}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {cardConfig.showSignupPrompts ? (
                renderGuestPrompt()
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center gap-1 cursor-pointer hover:text-red-500 transition-colors"
                    onClick={handleLike}
                    title={isLiked ? "Unlike" : "Like"}
                  >
                    <motion.div
                      animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isLiked ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                    </motion.div>
                    {formatNumber(post.likesCount || 0)}
                  </motion.button>
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                    title="Views"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {formatNumber(post.views || 0)}
                  </motion.span>
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-1 hover:text-green-500 transition-colors"
                    title="Comments"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {formatNumber(post.commentsCount || 0)}
                  </motion.span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default EnhancedPostCard;
