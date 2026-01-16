/**
 * ============================================================================
 * PENDING QUEUE PAGE - Moderator Content Review
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Tag,
  FileText,
  X,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { postsAPI } from "../../api/posts";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import RejectionModal from "../../components/moderation/RejectionModal";
import ViolationReport from "../../components/ai/ViolationReport";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const PendingQueue = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);
  const [rejectionModal, setRejectionModal] = useState({
    isOpen: false,
    postId: null,
    postTitle: "",
  });

  const postsPerPage = 10;

  const fetchPendingPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getPosts({
        status: "pending",
        page: currentPage,
        limit: postsPerPage,
        sortBy: "createdAt",
        sortOrder: "asc", // Oldest first for fair review
      });

      const postsData = response.data?.posts || response.posts || [];
      const pagination = response.data?.pagination || response.pagination || {};

      setPosts(postsData);
      setTotalPages(pagination.pages || pagination.totalPages || 1);
      setTotalPosts(pagination.total || postsData.length || 0);
    } catch (error) {
      console.error("Error fetching pending posts:", error);
      toast.error("Failed to load pending posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchPendingPosts();
  }, [fetchPendingPosts]);

  const handleApprove = async (postId) => {
    try {
      setActionLoading(postId);
      await postsAPI.approvePost(postId);
      toast.success("Post approved and published!");
      fetchPendingPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve post");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (postId, postTitle) => {
    setRejectionModal({ isOpen: true, postId, postTitle });
  };

  const handleRejectConfirm = async (reason) => {
    try {
      await postsAPI.rejectPost(rejectionModal.postId, reason);
      toast.success("Post rejected with feedback");
      fetchPendingPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject post");
    }
  };

  const getAuthorName = (author) => {
    if (!author) return "Unknown Author";
    if (author.firstName) {
      return `${author.firstName} ${author.lastName || ""}`.trim();
    }
    return author.fullName || author.email || "Unknown Author";
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getAuthorName(post.author)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

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
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
                Pending Queue
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {totalPosts} posts awaiting review
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchPendingPosts}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </motion.button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Posts List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center"
          >
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              All caught up!
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No pending posts to review at the moment.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Thumbnail */}
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full lg:w-32 h-32 object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-full lg:w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {post.title}
                        </h3>
                        {/* Violation Indicator */}
                        {post.violationReport && (
                          <ViolationReport
                            report={post.violationReport}
                            compact
                          />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {getAuthorName(post.author)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        {post.category && (
                          <span className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {post.category}
                          </span>
                        )}
                      </div>

                      {/* Violation Warning Banner */}
                      {post.violationReport?.hasViolations && (
                        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                            <ShieldAlert className="w-4 h-4" />
                            <span className="font-medium">
                              AI flagged{" "}
                              {post.violationReport.violations?.length || 0}{" "}
                              potential violation(s)
                            </span>
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                post.violationReport.severity === "critical"
                                  ? "bg-red-200 text-red-800"
                                  : post.violationReport.severity === "high"
                                  ? "bg-orange-200 text-orange-800"
                                  : post.violationReport.severity === "medium"
                                  ? "bg-yellow-200 text-yellow-800"
                                  : "bg-blue-200 text-blue-800"
                              }`}
                            >
                              {post.violationReport.severity}
                            </span>
                          </div>
                        </div>
                      )}

                      {post.excerpt && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                          {post.excerpt}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setPreviewPost(post)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleApprove(post._id)}
                          disabled={actionLoading === post._id}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          {actionLoading === post._id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleReject(post._id, post.title)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
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
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Preview Modal */}
        <AnimatePresence>
          {previewPost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setPreviewPost(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Post Preview
                  </h2>
                  <button
                    onClick={() => setPreviewPost(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {/* Violation Report in Preview */}
                  {previewPost.violationReport?.hasViolations && (
                    <div className="mb-6">
                      <ViolationReport report={previewPost.violationReport} />
                    </div>
                  )}

                  {previewPost.featuredImage && (
                    <img
                      src={previewPost.featuredImage}
                      alt={previewPost.title}
                      className="w-full h-64 object-cover rounded-xl mb-6"
                    />
                  )}
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {previewPost.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <span>By {getAuthorName(previewPost.author)}</span>
                    <span>•</span>
                    <span>{previewPost.category}</span>
                  </div>
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: previewPost.content }}
                  />
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      handleApprove(previewPost._id);
                      setPreviewPost(null);
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleReject(previewPost._id, previewPost.title);
                      setPreviewPost(null);
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rejection Modal */}
        <RejectionModal
          isOpen={rejectionModal.isOpen}
          onClose={() =>
            setRejectionModal({ isOpen: false, postId: null, postTitle: "" })
          }
          onConfirm={handleRejectConfirm}
          postTitle={rejectionModal.postTitle}
        />
      </div>
    </DashboardLayout>
  );
};

export default PendingQueue;
