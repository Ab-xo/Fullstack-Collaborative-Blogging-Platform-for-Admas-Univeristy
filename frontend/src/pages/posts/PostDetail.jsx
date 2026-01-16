/**
 * ============================================================================
 * POST DETAIL PAGE
 * ============================================================================
 *
 * Displays a single blog post with full content and interactions.
 *
 * PAGE SECTIONS:
 *   1. Post Header - Title, author info, date, category
 *   2. Featured Image - Main post image
 *   3. Post Content - Full article content (HTML rendered)
 *   4. Engagement Bar - Like, dislike, share buttons
 *   5. Author Card - Author bio and follow button
 *   6. Comments Section - View and add comments
 *   7. Related Posts - Similar posts (future feature)
 *
 * FEATURES:
 *   - Like/dislike posts (requires login)
 *   - Share to social media
 *   - Follow post author
 *   - Comment on posts
 *   - Edit/delete own posts
 *   - View count tracking
 *
 * ACCESS:
 *   - Public: View published posts
 *   - Authenticated: Like, comment, follow
 *   - Author: Edit, delete own posts
 *
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { postsAPI } from "../../api/posts";
import { useAuth } from "../../hooks/useAuth";
import {
  Heart,
  ThumbsDown,
  Eye,
  Calendar,
  Tag,
  ArrowLeft,
  Share2,
  Edit,
  Trash2,
  AlertTriangle,
  X,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MessageCircle,
  Check,
} from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Avatar from "../../components/common/Avatar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import FollowButton from "../../components/common/FollowButton";
import PostTemplate from "../../components/blog/PostTemplate";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";
import CommentSection from "../../components/blog/CommentSection";
import { commentsAPI } from "../../api/comments";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (id) {
      const timer = setTimeout(() => {
        fetchPost();
        fetchComments();
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getPostWithView(id);
      const postData = response.post || response.data?.post;
      setPost(postData);
      if (user && postData?.likes) {
        setIsLiked(postData.likes.includes(user._id));
      }
      if (user && postData?.dislikes) {
        setIsDisliked(postData.dislikes.includes(user._id));
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      if (error.response?.status === 404) {
        toast.error("Post not found");
        navigate("/blogs");
      } else if (error.response?.status !== 401) {
        toast.error("Failed to load post");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      setLoginPrompt(true);
      return;
    }

    try {
      if (isLiked) {
        await postsAPI.unlikePost(id);
        setPost({ ...post, likesCount: (post.likesCount || 1) - 1 });
        setIsLiked(false);
        toast.success("Post unliked");
      } else {
        const response = await postsAPI.likePost(id);
        setPost({
          ...post,
          likesCount: response.likesCount || (post.likesCount || 0) + 1,
          dislikesCount:
            response.dislikesCount ||
            (isDisliked ? (post.dislikesCount || 1) - 1 : post.dislikesCount),
        });
        setIsLiked(true);
        setIsDisliked(false);
        toast.success("Post liked!");
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
    }
  };

  const handleDislike = async () => {
    if (!user) {
      setLoginPrompt(true);
      return;
    }

    try {
      if (isDisliked) {
        await postsAPI.undislikePost(id);
        setPost({ ...post, dislikesCount: (post.dislikesCount || 1) - 1 });
        setIsDisliked(false);
        toast.success("Dislike removed");
      } else {
        const response = await postsAPI.dislikePost(id);
        setPost({
          ...post,
          dislikesCount:
            response.dislikesCount || (post.dislikesCount || 0) + 1,
          likesCount:
            response.likesCount ||
            (isLiked ? (post.likesCount || 1) - 1 : post.likesCount),
        });
        setIsDisliked(true);
        setIsLiked(false);
        toast.success("Post disliked");
      }
    } catch (error) {
      console.error("Error disliking post:", error);
      toast.error("Failed to dislike post");
    }
  };

  const handleShare = () => {
    setShareModal(true);
  };

  const handleEdit = () => {
    navigate(`/posts/${id}/edit`);
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await postsAPI.deletePost(id);
      toast.success("Post deleted successfully");
      navigate("/my-posts");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error(error.response?.data?.message || "Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentsAPI.getComments(id);
      setComments(response.data?.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async (content, parentId = null) => {
    try {
      const response = await commentsAPI.createComment(id, content, parentId);
      if (parentId) {
        setComments((prev) =>
          prev.map((comment) => {
            if (comment._id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), response.data.comment],
              };
            }
            return comment;
          })
        );
      } else {
        setComments((prev) => [response.data.comment, ...prev]);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentsAPI.deleteComment(commentId);
      setComments((prev) =>
        prev.filter((comment) => {
          if (comment._id === commentId) return false;
          if (comment.replies) {
            comment.replies = comment.replies.filter(
              (reply) => reply._id !== commentId
            );
          }
          return true;
        })
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    try {
      await commentsAPI.updateComment(commentId, newContent);
      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === commentId) {
            return { ...comment, content: newContent, isEdited: true };
          }
          if (comment.replies) {
            comment.replies = comment.replies.map((reply) =>
              reply._id === commentId
                ? { ...reply, content: newContent, isEdited: true }
                : reply
            );
          }
          return comment;
        })
      );
    } catch (error) {
      console.error("Error editing comment:", error);
      throw error;
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const comment =
        comments.find((c) => c._id === commentId) ||
        comments
          .flatMap((c) => c.replies || [])
          .find((r) => r._id === commentId);
      const isCurrentlyLiked = comment?.isLiked;

      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === commentId) {
            return {
              ...comment,
              isLiked: !isCurrentlyLiked,
              likesCount: isCurrentlyLiked
                ? comment.likesCount - 1
                : comment.likesCount + 1,
            };
          }
          if (comment.replies) {
            comment.replies = comment.replies.map((reply) =>
              reply._id === commentId
                ? {
                    ...reply,
                    isLiked: !isCurrentlyLiked,
                    likesCount: isCurrentlyLiked
                      ? reply.likesCount - 1
                      : reply.likesCount + 1,
                  }
                : reply
            );
          }
          return comment;
        })
      );

      if (isCurrentlyLiked) {
        await commentsAPI.unlikeComment(commentId);
      } else {
        await commentsAPI.likeComment(commentId);
      }
    } catch (error) {
      console.error("Error liking comment:", error);
      fetchComments();
    }
  };

  const isAuthor = user && post && post.author?._id === user._id;
  const isAdmin =
    user &&
    (user.role === "admin" ||
      user.roles?.includes("admin") ||
      user.roles?.includes("moderator"));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading post..." />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Post not found
        </h2>
        <Button onClick={() => navigate("/blogs")}>Back to Blogs</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Back Button - Below Navbar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-20 left-4 sm:left-6 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium text-sm">Back</span>
        </motion.button>
      </motion.div>

      {/* Hero Image Section */}
      {post.featuredImage && (
        <div className="relative h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-gray-50 dark:to-gray-900" />
        </div>
      )}

      {/* Main Content - Wider Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        {/* Article Card */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-8 sm:p-12 lg:p-16">
            {/* Status Badge */}
            {post.status !== "published" && (
              <div className="mb-6">
                <Badge
                  variant={
                    post.status === "pending"
                      ? "warning"
                      : post.status === "rejected"
                      ? "danger"
                      : "secondary"
                  }
                >
                  {post.status}
                </Badge>
              </div>
            )}

            {/* Category */}
            <div className="mb-4">
              <Badge variant="primary" className="text-sm">
                {post.category}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Author & Meta Info */}
            <div className="flex flex-wrap items-center justify-between gap-6 pb-8 mb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <Avatar
                  src={post.author?.profile?.avatar}
                  alt={post.author?.fullName}
                  fallback={post.author?.fullName}
                  size="lg"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">
                    {post.author?.fullName || "Unknown Author"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {post.publishedAt
                        ? format(new Date(post.publishedAt), "MMMM d, yyyy")
                        : format(new Date(post.createdAt), "MMMM d, yyyy")}
                    </span>
                  </div>
                </div>
                {post.author?._id && user?._id !== post.author._id && (
                  <FollowButton userId={post.author._id} size="sm" />
                )}
              </div>

              {/* Co-Authors */}
              {post.coAuthors && post.coAuthors.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Co-authors:
                  </span>
                  <div className="flex -space-x-2">
                    {post.coAuthors.slice(0, 3).map((coAuthor) => (
                      <Avatar
                        key={coAuthor.user?._id || coAuthor._id}
                        src={coAuthor.user?.profile?.avatar}
                        alt={
                          coAuthor.user?.fullName || coAuthor.user?.firstName
                        }
                        fallback={
                          coAuthor.user?.fullName || coAuthor.user?.firstName
                        }
                        size="sm"
                        className="ring-2 ring-white dark:ring-gray-800"
                      />
                    ))}
                    {post.coAuthors.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400 ring-2 ring-white dark:ring-gray-800">
                        +{post.coAuthors.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-6">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                >
                  <Eye className="w-5 h-5" />
                  <span className="font-medium">{post.views || 0}</span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  onClick={handleLike}
                >
                  <motion.div
                    animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isLiked ? "fill-current text-red-500" : ""
                      }`}
                    />
                  </motion.div>
                  <span className="font-medium">{post.likesCount || 0}</span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
                  onClick={handleDislike}
                >
                  <motion.div
                    animate={isDisliked ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <ThumbsDown
                      className={`w-5 h-5 ${
                        isDisliked ? "fill-current text-orange-500" : ""
                      }`}
                    />
                  </motion.div>
                  <span className="font-medium">{post.dislikesCount || 0}</span>
                </motion.div>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-8">
                <Tag className="w-4 h-4 text-gray-400" />
                {post.tags.map((tag, index) => (
                  <motion.span
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-400 transition-colors cursor-pointer"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            )}

            {/* Article Content - Smart Template */}
            <PostTemplate
              content={post.content}
              showProgress={true}
              showToc={true}
              showMeta={true}
              onShare={handleShare}
              onBookmark={() => toast.success("Bookmark feature coming soon!")}
              isBookmarked={false}
            />

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                  isLiked
                    ? "bg-red-500 text-white shadow-lg shadow-red-200 dark:shadow-red-900/30"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20"
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
                <span>{isLiked ? "Liked" : "Like"}</span>
                <span className="text-sm">({post.likesCount || 0})</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDislike}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                  isDisliked
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/30"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                }`}
              >
                <motion.div
                  animate={
                    isDisliked
                      ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                >
                  <ThumbsDown
                    className={`w-5 h-5 ${isDisliked ? "fill-current" : ""}`}
                  />
                </motion.div>
                <span>{isDisliked ? "Disliked" : "Dislike"}</span>
                <span className="text-sm">({post.dislikesCount || 0})</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </motion.button>

              {(isAuthor || isAdmin) && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDeleteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.article>

        {/* Comment Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden"
        >
          <CommentSection
            postId={id}
            postAuthorId={post?.author?._id}
            comments={comments}
            user={user}
            isAuthenticated={!!user}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            onEditComment={handleEditComment}
            onLikeComment={handleLikeComment}
            onLoginPrompt={() => setLoginPrompt(true)}
          />
        </motion.div>
      </div>

      {/* Modals */}
      {deleteModal && (
        <DeletePostModal
          post={post}
          onClose={() => setDeleteModal(false)}
          onConfirm={handleDelete}
          isDeleting={deleting}
        />
      )}

      {loginPrompt && (
        <LoginPromptModal
          onClose={() => setLoginPrompt(false)}
          onLogin={() => navigate("/login")}
          onRegister={() => navigate("/register")}
        />
      )}

      {shareModal && (
        <ShareModal
          post={post}
          onClose={() => setShareModal(false)}
          isAuthenticated={!!user}
        />
      )}
    </div>
  );
};

// Share Modal Component
const ShareModal = ({ post, onClose, isAuthenticated }) => {
  const [copied, setCopied] = useState(false);
  const postUrl = window.location.href;
  const shareText = `Check out this article: ${post.title}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: postUrl,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    }
  };

  const shareLinks = [
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-blue-400 hover:bg-blue-500",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(postUrl)}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        postUrl
      )}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-700 hover:bg-blue-800",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        postUrl
      )}`,
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500 hover:bg-green-600",
      url: `https://wa.me/?text=${encodeURIComponent(
        shareText + " " + postUrl
      )}`,
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-gray-600 hover:bg-gray-700",
      url: `mailto:?subject=${encodeURIComponent(
        post.title
      )}&body=${encodeURIComponent(shareText + "\n\n" + postUrl)}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Share2 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Share this article
            </h3>

            <p className="text-gray-500 dark:text-gray-400 text-center mb-6 text-sm">
              {post.title}
            </p>

            <div className="mb-6">
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <input
                  type="text"
                  value={postUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-400 outline-none"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {navigator.share && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNativeShare}
                className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-primary-500 to-blue-500 text-white rounded-xl font-medium hover:from-primary-600 hover:to-blue-600 transition-all shadow-lg"
              >
                Share via...
              </motion.button>
            )}

            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">
                Or share on social media
              </p>
              <div className="grid grid-cols-5 gap-3">
                {shareLinks.map((platform) => (
                  <motion.a
                    key={platform.name}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${platform.color} text-white p-3 rounded-xl flex items-center justify-center transition-all shadow-md hover:shadow-lg`}
                    title={`Share on ${platform.name}`}
                  >
                    <platform.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            {isAuthenticated && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  💡 Sharing helps support the author and grow the community!
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Login Prompt Modal Component
const LoginPromptModal = ({ onClose, onLogin, onRegister }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <Heart className="w-8 h-8 text-blue-600" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Join the Conversation!
            </h3>

            <p className="text-gray-500 text-center mb-6">
              Login or create an account to like posts, leave comments, and
              interact with the community.
            </p>

            <div className="space-y-3">
              <button
                onClick={onLogin}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Login
              </button>
              <button
                onClick={onRegister}
                className="w-full px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Create Account
              </button>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete Post Modal Component
const DeletePostModal = ({ post, onClose, onConfirm, isDeleting }) => {
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Delete Post?
            </h3>

            <p className="text-gray-500 text-center mb-4">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                {post.featuredImage && (
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {post.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Created{" "}
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.views || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {post.likesCount || 0} likes
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">This will permanently delete:</p>
                  <ul className="mt-1 list-disc list-inside text-amber-700">
                    <li>The post content and images</li>
                    <li>All comments on this post</li>
                    <li>All likes and engagement data</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
