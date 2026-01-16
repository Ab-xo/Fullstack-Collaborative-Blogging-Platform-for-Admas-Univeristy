/**
 * ============================================================================
 * REPORTED CONTENT PAGE - Handle Flagged Posts with AI Violations
 * ============================================================================
 * Displays posts that have been flagged by the AI content moderation system
 * Allows moderators to review, approve, or remove violating content
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flag,
  Search,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  X,
  AlertTriangle,
  Shield,
  Ban,
  ThumbsUp,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { postsAPI } from "../../api/posts";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const ReportedContent = () => {
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFlagged, setTotalFlagged] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [severityStats, setSeverityStats] = useState({});

  const postsPerPage = 10;

  // Debug: Log when component mounts
  useEffect(() => {
    console.log("[ReportedContent] Component mounted");
  }, []);

  // Fetch flagged posts from API
  const fetchFlaggedPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("[ReportedContent] Fetching flagged posts...");

      const response = await postsAPI.getFlaggedPosts({
        page: currentPage,
        limit: postsPerPage,
        severity: filterSeverity !== "all" ? filterSeverity : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
      });

      console.log("[ReportedContent] API Response:", response);

      if (response && response.success) {
        const posts = response.data?.posts || [];
        console.log("[ReportedContent] Found", posts.length, "flagged posts");
        setFlaggedPosts(posts);
        setTotalPages(response.data?.pagination?.pages || 1);
        setTotalFlagged(response.data?.pagination?.total || posts.length);
        setSeverityStats(response.data?.stats?.bySeverity || {});
      } else {
        console.warn("[ReportedContent] Response not successful:", response);
        setFlaggedPosts([]);
        setError(response?.message || "Failed to load flagged content");
        toast.error(response?.message || "Failed to load flagged content");
      }
    } catch (error) {
      console.error("[ReportedContent] Error fetching flagged posts:", error);
      console.error("[ReportedContent] Error response:", error.response?.data);

      const errorMessage =
        error.response?.status === 403
          ? "Access denied. You need moderator permissions."
          : error.response?.status === 401
          ? "Please log in to view flagged content."
          : error.response?.data?.message || "Failed to load flagged content";

      setError(errorMessage);
      toast.error(errorMessage);
      setFlaggedPosts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterSeverity, filterStatus]);

  useEffect(() => {
    fetchFlaggedPosts();
  }, [fetchFlaggedPosts]);

  // Dismiss violation (approve post)
  const handleDismissViolation = async (postId) => {
    try {
      setActionLoading(postId);
      await postsAPI.dismissViolation(
        postId,
        "Violation reviewed and dismissed by moderator"
      );
      toast.success("Post approved - violation dismissed");
      fetchFlaggedPosts();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to dismiss violation"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Remove content (delete post)
  const handleRemoveContent = async (postId) => {
    try {
      setActionLoading(postId);
      await postsAPI.removeFlaggedContent(postId);
      toast.success("Content removed successfully");
      fetchFlaggedPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove content");
    } finally {
      setActionLoading(null);
    }
  };

  // Reject post (keep but mark as rejected)
  const handleRejectPost = async (postId) => {
    try {
      setActionLoading(postId);
      await postsAPI.rejectPost(
        postId,
        "Content violates community guidelines"
      );
      toast.success("Post rejected");
      fetchFlaggedPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject post");
    } finally {
      setActionLoading(null);
    }
  };

  // Get severity badge styling
  const getSeverityBadge = (severity) => {
    const badges = {
      critical: {
        color:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
        label: "Critical",
        icon: XCircle,
      },
      high: {
        color:
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
        label: "High",
        icon: AlertTriangle,
      },
      medium: {
        color:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
        label: "Medium",
        icon: AlertCircle,
      },
      low: {
        color:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        label: "Low",
        icon: Flag,
      },
      none: {
        color:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
        label: "Clean",
        icon: CheckCircle,
      },
    };
    return badges[severity] || badges.none;
  };

  // Get violation type badge
  const getViolationTypeBadge = (type) => {
    const types = {
      hate_speech: { color: "bg-red-100 text-red-700", label: "Hate Speech" },
      spam: { color: "bg-orange-100 text-orange-700", label: "Spam" },
      profanity: { color: "bg-yellow-100 text-yellow-700", label: "Profanity" },
      harassment: { color: "bg-pink-100 text-pink-700", label: "Harassment" },
      violence: { color: "bg-red-100 text-red-700", label: "Violence" },
      personal_attacks: {
        color: "bg-purple-100 text-purple-700",
        label: "Personal Attacks",
      },
      plagiarism: {
        color: "bg-indigo-100 text-indigo-700",
        label: "Plagiarism",
      },
      misleading_information: {
        color: "bg-amber-100 text-amber-700",
        label: "Misleading",
      },
      inappropriate_content: {
        color: "bg-gray-100 text-gray-700",
        label: "Inappropriate",
      },
    };
    return types[type] || { color: "bg-gray-100 text-gray-700", label: type };
  };

  const getAuthorName = (author) => {
    if (!author) return "Unknown";
    return (
      `${author.firstName || ""} ${author.lastName || ""}`.trim() || "Unknown"
    );
  };

  // Filter posts by search query
  const filteredPosts = flaggedPosts.filter(
    (post) =>
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getAuthorName(post.author)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      post.violationReport?.violations?.some((v) =>
        v.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
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
            <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30">
              <Flag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
                Flagged Content
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {totalFlagged} posts flagged by AI moderation
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchFlaggedPosts}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </motion.button>
        </motion.div>

        {/* Severity Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {["critical", "high", "medium", "low"].map((severity) => {
            const badge = getSeverityBadge(severity);
            const Icon = badge.icon;
            return (
              <div
                key={severity}
                className={`p-4 rounded-xl border ${badge.color} cursor-pointer transition-all hover:scale-105`}
                onClick={() =>
                  setFilterSeverity(
                    filterSeverity === severity ? "all" : severity
                  )
                }
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{badge.label}</span>
                </div>
                <p className="text-2xl font-bold mt-1">
                  {severityStats[severity] || 0}
                </p>
              </div>
            );
          })}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search flagged content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
            >
              <option value="pending">Pending Review</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Status</option>
            </select>
          </div>
        </motion.div>

        {/* Flagged Posts List */}
        {error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-8 text-center"
          >
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
              Error Loading Content
            </h3>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchFlaggedPosts}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </motion.button>
          </motion.div>
        ) : loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
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
            <Shield className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              All Clear!
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No flagged content to review at the moment.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post, index) => {
              const severityBadge = getSeverityBadge(
                post.violationReport?.severity || "none"
              );
              const SeverityIcon = severityBadge.icon;
              const violations = post.violationReport?.violations || [];

              return (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Severity Icon */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${severityBadge.color}`}
                      >
                        <SeverityIcon className="w-6 h-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${severityBadge.color}`}
                          >
                            {severityBadge.label} Severity
                          </span>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full">
                            {post.category}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                            {post.status}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {post.title}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                          {post.excerpt ||
                            post.content?.substring(0, 150) + "..."}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            By {getAuthorName(post.author)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDistanceToNow(new Date(post.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Flag className="w-4 h-4 text-red-500" />
                            {violations.length} violation
                            {violations.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Violations List */}
                        {violations.length > 0 && (
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-lg p-3 mb-4">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                                  Detected Violations:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {violations.map((violation, vIndex) => {
                                    const vBadge = getViolationTypeBadge(
                                      violation.type
                                    );
                                    return (
                                      <span
                                        key={vIndex}
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${vBadge.color}`}
                                        title={violation.description}
                                      >
                                        {vBadge.label}
                                      </span>
                                    );
                                  })}
                                </div>
                                {violations[0]?.excerpt && (
                                  <p className="text-xs text-red-600 dark:text-red-300 mt-2 italic">
                                    "{violations[0].excerpt}"
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setPreviewItem(post)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            View Full Content
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleDismissViolation(post._id)}
                            disabled={actionLoading === post._id}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            Approve (Dismiss)
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleRejectPost(post._id)}
                            disabled={actionLoading === post._id}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleRemoveContent(post._id)}
                            disabled={actionLoading === post._id}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            <Ban className="w-4 h-4" />
                            Delete
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
          {previewItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setPreviewItem(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Review Flagged Post
                    </h2>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${
                        getSeverityBadge(previewItem.violationReport?.severity)
                          .color
                      }`}
                    >
                      {
                        getSeverityBadge(previewItem.violationReport?.severity)
                          .label
                      }
                    </span>
                  </div>
                  <button
                    onClick={() => setPreviewItem(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {/* Violation Report */}
                  {previewItem.violationReport?.violations?.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-red-700 dark:text-red-400 mb-3">
                            AI Violation Report -{" "}
                            {previewItem.violationReport.violations.length}{" "}
                            issue(s) detected
                          </p>
                          <div className="space-y-3">
                            {previewItem.violationReport.violations.map(
                              (violation, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-red-100 dark:border-red-800/50"
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span
                                      className={`px-2 py-0.5 text-xs font-medium rounded ${
                                        getViolationTypeBadge(violation.type)
                                          .color
                                      }`}
                                    >
                                      {
                                        getViolationTypeBadge(violation.type)
                                          .label
                                      }
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {violation.description}
                                  </p>
                                  {violation.excerpt && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 italic bg-red-50 dark:bg-red-900/30 p-2 rounded">
                                      Flagged content: "{violation.excerpt}"
                                    </p>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                            Analyzed:{" "}
                            {previewItem.violationReport.analyzedAt
                              ? formatDistanceToNow(
                                  new Date(
                                    previewItem.violationReport.analyzedAt
                                  ),
                                  { addSuffix: true }
                                )
                              : "Unknown"}
                            {previewItem.violationReport.sources?.ai &&
                              " • AI Analysis"}
                            {previewItem.violationReport.sources?.ruleBased &&
                              " • Rule-Based Detection"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {previewItem.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span>By {getAuthorName(previewItem.author)}</span>
                      <span>•</span>
                      <span>{previewItem.category}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(previewItem.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  {previewItem.featuredImage && (
                    <img
                      src={previewItem.featuredImage}
                      alt={previewItem.title}
                      className="w-full h-48 object-cover rounded-xl mb-4"
                    />
                  )}

                  <div className="prose dark:prose-invert max-w-none">
                    <div
                      className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: previewItem.content }}
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex flex-wrap justify-end gap-3">
                  <button
                    onClick={() => {
                      handleDismissViolation(previewItem._id);
                      setPreviewItem(null);
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Approve Post
                  </button>
                  <button
                    onClick={() => {
                      handleRejectPost(previewItem._id);
                      setPreviewItem(null);
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Post
                  </button>
                  <button
                    onClick={() => {
                      handleRemoveContent(previewItem._id);
                      setPreviewItem(null);
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    <Ban className="w-4 h-4" />
                    Delete Post
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

export default ReportedContent;
