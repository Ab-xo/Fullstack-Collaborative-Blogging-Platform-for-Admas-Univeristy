/**
 * ============================================================================
 * COMMENTS MODERATION PAGE - Manage and Moderate Comments
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  X,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Flag,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Filter,
} from "lucide-react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);
  const [previewComment, setPreviewComment] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all, flagged, approved
  const [sortBy, setSortBy] = useState("newest");

  const commentsPerPage = 15;

  // Mock data for demonstration
  const mockComments = [
    {
      _id: "1",
      content:
        "This is a great article! Very informative and well-written. I learned a lot from this.",
      author: { firstName: "Alice", lastName: "Johnson", avatar: null },
      post: { _id: "post1", title: "Introduction to Machine Learning" },
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      likes: 12,
      status: "approved",
      flagged: false,
    },
    {
      _id: "2",
      content:
        "I disagree with some points here. The methodology seems flawed.",
      author: { firstName: "Bob", lastName: "Smith", avatar: null },
      post: { _id: "post2", title: "Research Methods in Computer Science" },
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      likes: 5,
      status: "approved",
      flagged: false,
    },
    {
      _id: "3",
      content: "This is spam content trying to sell products...",
      author: { firstName: "Spam", lastName: "User", avatar: null },
      post: { _id: "post3", title: "Best Practices for Web Development" },
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      likes: 0,
      status: "pending",
      flagged: true,
      flagReason: "spam",
    },
    {
      _id: "4",
      content:
        "Thank you for sharing this knowledge. It helped me understand the concept better.",
      author: { firstName: "Carol", lastName: "Davis", avatar: null },
      post: { _id: "post1", title: "Introduction to Machine Learning" },
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      likes: 8,
      status: "approved",
      flagged: false,
    },
    {
      _id: "5",
      content:
        "You're completely wrong about this. Do your research before posting such nonsense!",
      author: { firstName: "Dave", lastName: "Wilson", avatar: null },
      post: { _id: "post4", title: "Climate Change and Technology" },
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      likes: 2,
      status: "pending",
      flagged: true,
      flagReason: "harassment",
    },
  ];

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await api.get('/comments/moderation', { params: { ... } });

      await new Promise((resolve) => setTimeout(resolve, 500));

      let filteredComments = [...mockComments];

      if (filterStatus === "flagged") {
        filteredComments = filteredComments.filter((c) => c.flagged);
      } else if (filterStatus === "approved") {
        filteredComments = filteredComments.filter(
          (c) => c.status === "approved" && !c.flagged
        );
      }

      if (sortBy === "newest") {
        filteredComments.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      } else if (sortBy === "oldest") {
        filteredComments.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      } else if (sortBy === "mostLiked") {
        filteredComments.sort((a, b) => b.likes - a.likes);
      }

      setComments(filteredComments);
      setTotalPages(Math.ceil(filteredComments.length / commentsPerPage));
      setTotalComments(filteredComments.length);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, sortBy]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleApproveComment = async (commentId) => {
    try {
      setActionLoading(commentId);
      // TODO: API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Comment approved");
      fetchComments();
    } catch (error) {
      toast.error("Failed to approve comment");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setActionLoading(commentId);
      // TODO: API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Comment deleted");
      fetchComments();
    } catch (error) {
      toast.error("Failed to delete comment");
    } finally {
      setActionLoading(null);
    }
  };

  const getAuthorName = (author) => {
    if (!author) return "Unknown";
    return (
      `${author.firstName || ""} ${author.lastName || ""}`.trim() || "Unknown"
    );
  };

  const filteredComments = comments.filter(
    (comment) =>
      comment.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getAuthorName(comment.author)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      comment.post?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const stats = {
    total: comments.length,
    flagged: comments.filter((c) => c.flagged).length,
    approved: comments.filter((c) => c.status === "approved" && !c.flagged)
      .length,
  };

  return (
    <DashboardLayout userRole="moderator">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
                Comment Moderation
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {totalComments} comments to review
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchComments}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Comments
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Flag className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.flagged}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Flagged
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.approved}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Approved
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search comments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
            >
              <option value="all">All Comments</option>
              <option value="flagged">Flagged Only</option>
              <option value="approved">Approved Only</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="mostLiked">Most Liked</option>
            </select>
          </div>
        </motion.div>

        {/* Comments List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredComments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center"
          >
            <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No comments found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "No comments match your search."
                : "No comments to moderate."}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredComments.map((comment, index) => (
              <motion.div
                key={comment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                  comment.flagged
                    ? "border-red-200 dark:border-red-900/30"
                    : "border-gray-100 dark:border-gray-700"
                }`}
              >
                <div className="p-6">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {getAuthorName(comment.author).charAt(0)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {getAuthorName(comment.author)}
                        </span>
                        {comment.flagged && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full flex items-center gap-1">
                            <Flag className="w-3 h-3" />
                            {comment.flagReason || "Flagged"}
                          </span>
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {comment.content}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          {comment.likes} likes
                        </span>
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          On: {comment.post?.title}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setPreviewComment(comment)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </motion.button>
                        {comment.flagged && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleApproveComment(comment._id)}
                            disabled={actionLoading === comment._id}
                            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleDeleteComment(comment._id)}
                          disabled={actionLoading === comment._id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Preview Modal */}
        <AnimatePresence>
          {previewComment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setPreviewComment(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Comment Details
                  </h2>
                  <button
                    onClick={() => setPreviewComment(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold">
                      {getAuthorName(previewComment.author).charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {getAuthorName(previewComment.author)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(
                          new Date(previewComment.createdAt),
                          { addSuffix: true }
                        )}
                      </p>
                    </div>
                  </div>

                  {previewComment.flagged && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">
                          Flagged: {previewComment.flagReason}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      "{previewComment.content}"
                    </p>
                  </div>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      On post: {previewComment.post?.title}
                    </p>
                    <p className="flex items-center gap-2 mt-1">
                      <ThumbsUp className="w-4 h-4" />
                      {previewComment.likes} likes
                    </p>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  {previewComment.flagged && (
                    <button
                      onClick={() => {
                        handleApproveComment(previewComment._id);
                        setPreviewComment(null);
                      }}
                      className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleDeleteComment(previewComment._id);
                      setPreviewComment(null);
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default Comments;
