/**
 * Blog Moderation Page - Unified Content Management
 * Admin interface for managing and moderating all blog posts
 * Combines AllPosts design with moderation functionality
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Tag,
  Heart,
  MessageSquare,
  Grid3X3,
  List,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  Copy,
  Star,
  X,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { postsAPI } from "../../api/posts";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import RejectionModal from "../../components/moderation/RejectionModal";
import { toast } from "react-hot-toast";
import { formatDistanceToNow, format } from "date-fns";

// Debounce hook for search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Status configuration
const statusConfig = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: FileText },
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "bg-blue-100 text-blue-700",
    icon: CheckCircle,
  },
  published: {
    label: "Published",
    color: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
  archived: {
    label: "Archived",
    color: "bg-slate-100 text-slate-700",
    icon: FileText,
  },
};

const BlogModeration = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    author: "all",
    dateRange: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [actionMenuPost, setActionMenuPost] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectionModal, setRejectionModal] = useState({
    isOpen: false,
    postId: null,
    postTitle: "",
  });

  const postsPerPage = 12;

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: postsPerPage,
        adminView: true, // Flag for admin access to all posts
      };

      // Status filter
      if (filters.status !== "all") params.status = filters.status;

      // Category filter
      if (filters.category !== "all") params.category = filters.category;

      // Sort options
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;

      let response;
      if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
        params.q = debouncedSearchQuery.trim();
        response = await postsAPI.searchPosts(
          debouncedSearchQuery.trim(),
          params
        );
      } else {
        response = await postsAPI.getAdminPosts(params);
      }

      const postsData =
        response.data?.posts || response.posts || response.data || [];
      const pagination = response.data?.pagination || response.pagination || {};

      setPosts(Array.isArray(postsData) ? postsData : []);
      setTotalPages(pagination.pages || pagination.totalPages || 1);
      setTotalPosts(
        pagination.total || (Array.isArray(postsData) ? postsData.length : 0)
      );
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, debouncedSearchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await postsAPI.getCategories();
      const cats = response.data?.categories || response.data || [];
      setCategories(cats.map((c) => c.name || c._id || c));
    } catch (error) {
      setCategories([
        "academic",
        "research",
        "campus-life",
        "events",
        "technology",
        "innovation",
        "sports",
        "culture",
        "opinion",
        "other",
      ]);
    }
  };

  // Moderation Actions
  const handleApprove = async (postId) => {
    try {
      setActionLoading(postId);
      const post = posts.find((p) => p._id === postId);
      if (post?.status === "rejected") {
        await postsAPI.updatePost(postId, { status: "pending" });
        toast.success("Post moved to pending!");
      } else {
        await postsAPI.approvePost(postId);
        toast.success("Post approved and published!");
      }
      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve");
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
      toast.success("Post rejected");
      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject");
    }
  };

  const handleDeletePost = async (post) => {
    try {
      await postsAPI.deletePost(post._id);
      toast.success("Post deleted successfully");
      fetchPosts();
      setShowDeleteModal(null);
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedPosts.length === 0) {
      toast.error("No posts selected");
      return;
    }
    try {
      toast.success(`${action} applied to ${selectedPosts.length} posts`);
      setSelectedPosts([]);
      fetchPosts();
    } catch (error) {
      toast.error(`Failed to ${action} posts`);
    }
  };

  const toggleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map((p) => p._id));
    }
  };

  const toggleSelectPost = (postId) => {
    setSelectedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  // Stats calculation
  const stats = useMemo(() => {
    const all = posts.length;
    const published = posts.filter((p) => p.status === "published").length;
    const pending = posts.filter((p) => p.status === "pending").length;
    const draft = posts.filter((p) => p.status === "draft").length;
    const rejected = posts.filter((p) => p.status === "rejected").length;
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = posts.reduce(
      (sum, p) => sum + (p.likesCount || p.likes?.length || 0),
      0
    );
    return { all, published, pending, draft, rejected, totalViews, totalLikes };
  }, [posts]);

  // Get author display name
  const getAuthorName = (author) => {
    if (!author) return "Unknown Author";
    if (author.firstName) {
      return `${author.firstName} ${author.lastName || ""}`.trim();
    }
    return author.fullName || author.email || "Unknown Author";
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Blog Moderation
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Review, approve, and manage all blog content
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/posts/create")}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all"
            >
              <FileText className="w-5 h-5" />
              New Post
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
        >
          <StatsCard
            label="Total Posts"
            value={totalPosts}
            icon={FileText}
            color="blue"
          />
          <StatsCard
            label="Published"
            value={stats.published}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            label="Pending"
            value={stats.pending}
            icon={Clock}
            color="amber"
            badge
          />
          <StatsCard
            label="Drafts"
            value={stats.draft}
            icon={Edit3}
            color="gray"
          />
          <StatsCard
            label="Rejected"
            value={stats.rejected}
            icon={XCircle}
            color="red"
          />
          <StatsCard
            label="Total Views"
            value={stats.totalViews}
            icon={Eye}
            color="purple"
          />
          <StatsCard
            label="Total Likes"
            value={stats.totalLikes}
            icon={Heart}
            color="pink"
          />
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts by title, author, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
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

            {/* Quick Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {["all", "published", "pending", "draft", "rejected"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, status }));
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filters.status === status
                        ? "bg-indigo-500 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                )
              )}
            </div>

            {/* View Toggle & Filter Button */}
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-600 shadow-sm"
                      : ""
                  }`}
                >
                  <List className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-600 shadow-sm"
                      : ""
                  }`}
                >
                  <Grid3X3 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  showFilters
                    ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FilterSelect
                    label="Category"
                    value={filters.category}
                    onChange={(v) => {
                      setFilters((prev) => ({ ...prev, category: v }));
                      setCurrentPage(1);
                    }}
                    options={[
                      { value: "all", label: "All Categories" },
                      ...categories.map((c) => ({ value: c, label: c })),
                    ]}
                  />
                  <FilterSelect
                    label="Sort By"
                    value={filters.sortBy}
                    onChange={(v) => {
                      setFilters((prev) => ({ ...prev, sortBy: v }));
                      setCurrentPage(1);
                    }}
                    options={[
                      { value: "createdAt", label: "Date Created" },
                      { value: "updatedAt", label: "Last Updated" },
                      { value: "views", label: "Most Views" },
                      { value: "likesCount", label: "Most Likes" },
                      { value: "title", label: "Title" },
                    ]}
                  />
                  <FilterSelect
                    label="Order"
                    value={filters.sortOrder}
                    onChange={(v) => {
                      setFilters((prev) => ({ ...prev, sortOrder: v }));
                      setCurrentPage(1);
                    }}
                    options={[
                      { value: "desc", label: "Descending" },
                      { value: "asc", label: "Ascending" },
                    ]}
                  />
                  {/* Clear Filters Button */}
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setFilters({
                          status: "all",
                          category: "all",
                          author: "all",
                          dateRange: "all",
                          sortBy: "createdAt",
                          sortOrder: "desc",
                        });
                        setCurrentPage(1);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 flex items-center justify-between"
            >
              <span className="text-indigo-700 dark:text-indigo-300 font-medium">
                {selectedPosts.length} post{selectedPosts.length > 1 ? "s" : ""}{" "}
                selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction("publish")}
                  className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                >
                  Publish
                </button>
                <button
                  onClick={() => handleBulkAction("archive")}
                  className="px-3 py-1.5 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                >
                  Archive
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedPosts([])}
                  className="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts Content */}
        {loading ? (
          <PostsSkeleton viewMode={viewMode} />
        ) : posts.length === 0 ? (
          <EmptyState searchQuery={debouncedSearchQuery} />
        ) : viewMode === "list" ? (
          <PostsTable
            posts={posts}
            selectedPosts={selectedPosts}
            onToggleSelect={toggleSelectPost}
            onToggleSelectAll={toggleSelectAll}
            onActionMenu={setActionMenuPost}
            actionMenuPost={actionMenuPost}
            onDelete={setShowDeleteModal}
            onNavigate={navigate}
            onPreview={setPreviewPost}
            onApprove={handleApprove}
            onReject={handleReject}
            actionLoading={actionLoading}
            getAuthorName={getAuthorName}
          />
        ) : (
          <PostsGrid
            posts={posts}
            selectedPosts={selectedPosts}
            onToggleSelect={toggleSelectPost}
            onDelete={setShowDeleteModal}
            onNavigate={navigate}
            onPreview={setPreviewPost}
            onApprove={handleApprove}
            onReject={handleReject}
            actionLoading={actionLoading}
            getAuthorName={getAuthorName}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Delete Confirmation Modal */}
        <DeleteModal
          post={showDeleteModal}
          onClose={() => setShowDeleteModal(null)}
          onConfirm={() => showDeleteModal && handleDeletePost(showDeleteModal)}
        />

        {/* Rejection Modal */}
        <RejectionModal
          isOpen={rejectionModal.isOpen}
          onClose={() =>
            setRejectionModal({ isOpen: false, postId: null, postTitle: "" })
          }
          onConfirm={handleRejectConfirm}
          postTitle={rejectionModal.postTitle}
        />

        {/* Preview Panel */}
        <PreviewPanel
          post={previewPost}
          onClose={() => setPreviewPost(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          getAuthorName={getAuthorName}
        />
      </div>
    </DashboardLayout>
  );
};

// Stats Card Component
const StatsCard = ({ label, value, icon: Icon, color, badge }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    gray: "from-gray-500 to-gray-600",
    purple: "from-purple-500 to-purple-600",
    pink: "from-pink-500 to-pink-600",
    red: "from-red-500 to-red-600",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all relative"
    >
      {badge && value > 0 && (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-indigo-500 text-white text-xs font-bold rounded-full">
          {value}
        </span>
      )}
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {value.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {label}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Filter Select Component
const FilterSelect = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-gray-900 dark:text-white"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

// Posts Table Component with Moderation Actions
const PostsTable = ({
  posts,
  selectedPosts,
  onToggleSelect,
  onToggleSelectAll,
  onActionMenu,
  actionMenuPost,
  onDelete,
  onNavigate,
  onPreview,
  onApprove,
  onReject,
  actionLoading,
  getAuthorName,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
  >
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={
                  selectedPosts.length === posts.length && posts.length > 0
                }
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Post
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Author
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Engagement
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {posts.map((post, index) => {
            const status = statusConfig[post.status] || statusConfig.draft;
            const StatusIcon = status.icon;

            return (
              <motion.tr
                key={post._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`hover:bg-gray-50 transition-colors ${
                  selectedPosts.includes(post._id) ? "bg-amber-50" : ""
                }`}
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedPosts.includes(post._id)}
                    onChange={() => onToggleSelect(post._id)}
                    className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate max-w-[200px]">
                        {post.title}
                      </div>
                      {post.isFeatured && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                          <Star className="w-3 h-3 fill-current" />
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {post.author?.profile?.avatar ? (
                      <img
                        src={post.author.profile.avatar}
                        alt={getAuthorName(post.author)}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-medium">
                        {getAuthorName(post.author).charAt(0)}
                      </div>
                    )}
                    <span className="text-sm text-gray-700">
                      {getAuthorName(post.author)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    <Tag className="w-3 h-3" />
                    {post.category}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1" title="Views">
                      <Eye className="w-4 h-4" />
                      {post.views || 0}
                    </span>
                    <span className="flex items-center gap-1" title="Likes">
                      <Heart className="w-4 h-4" />
                      {post.likesCount || post.likes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1" title="Comments">
                      <MessageSquare className="w-4 h-4" />
                      {post.commentsCount || 0}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {/* Moderation Actions for Pending Posts */}
                    {post.status === "pending" && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onApprove(post._id)}
                          disabled={actionLoading === post._id}
                          className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          <CheckCircle
                            className={`w-4 h-4 ${
                              actionLoading === post._id ? "animate-spin" : ""
                            }`}
                          />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onReject(post._id, post.title)}
                          className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </motion.button>
                      </>
                    )}
                    {/* Move to Pending for Rejected Posts */}
                    {post.status === "rejected" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onApprove(post._id)}
                        disabled={actionLoading === post._id}
                        className="p-1.5 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50"
                        title="Move to Pending"
                      >
                        <Clock
                          className={`w-4 h-4 ${
                            actionLoading === post._id ? "animate-spin" : ""
                          }`}
                        />
                      </motion.button>
                    )}
                    {/* Preview Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onPreview(post)}
                      className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    {/* More Actions Menu */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          onActionMenu(
                            actionMenuPost === post._id ? null : post._id
                          )
                        }
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      <AnimatePresence>
                        {actionMenuPost === post._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10"
                          >
                            <button
                              onClick={() => {
                                onNavigate(`/posts/${post._id}`);
                                onActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Post
                            </button>
                            <button
                              onClick={() => {
                                onNavigate(`/posts/edit/${post._id}`);
                                onActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit3 className="w-4 h-4" />
                              Edit Post
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `${window.location.origin}/posts/${post._id}`
                                );
                                toast.success("Link copied!");
                                onActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Copy className="w-4 h-4" />
                              Copy Link
                            </button>
                            <hr className="my-1 border-gray-100" />
                            <button
                              onClick={() => {
                                onDelete(post);
                                onActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Post
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </motion.div>
);

// Posts Grid Component with Moderation Actions
const PostsGrid = ({
  posts,
  selectedPosts,
  onToggleSelect,
  onDelete,
  onNavigate,
  onPreview,
  onApprove,
  onReject,
  actionLoading,
  getAuthorName,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
  >
    {posts.map((post, index) => {
      const status = statusConfig[post.status] || statusConfig.draft;
      const StatusIcon = status.icon;
      const isSelected = selectedPosts.includes(post._id);

      return (
        <motion.div
          key={post._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ y: -4 }}
          className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all ${
            isSelected
              ? "border-amber-500 ring-2 ring-amber-500/20"
              : "border-gray-100"
          }`}
        >
          {/* Image */}
          <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
            {post.featuredImage ? (
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileText className="w-12 h-12 text-gray-300" />
              </div>
            )}
            {/* Checkbox */}
            <div className="absolute top-3 left-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(post._id)}
                className="w-5 h-5 rounded border-2 border-white bg-white/80 text-amber-500 focus:ring-amber-500 shadow-sm"
              />
            </div>
            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color} shadow-sm`}
              >
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>
            {/* Featured Badge */}
            {post.isFeatured && (
              <div className="absolute bottom-3 left-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500 text-white rounded-full text-xs font-medium shadow-sm">
                  <Star className="w-3 h-3 fill-current" />
                  Featured
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {post.category}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[48px]">
              {post.title}
            </h3>

            {/* Author */}
            <div className="flex items-center gap-2 mb-3">
              {post.author?.profile?.avatar ? (
                <img
                  src={post.author.profile.avatar}
                  alt={getAuthorName(post.author)}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-medium">
                  {getAuthorName(post.author).charAt(0)}
                </div>
              )}
              <span className="text-sm text-gray-600">
                {getAuthorName(post.author)}
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1" title="Views">
                <Eye className="w-4 h-4" />
                {post.views || 0}
              </span>
              <span className="flex items-center gap-1" title="Likes">
                <Heart className="w-4 h-4" />
                {post.likesCount || post.likes?.length || 0}
              </span>
              <span className="flex items-center gap-1" title="Comments">
                <MessageSquare className="w-4 h-4" />
                {post.commentsCount || 0}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Moderation Actions for Pending Posts */}
              {post.status === "pending" && (
                <>
                  <button
                    onClick={() => onApprove(post._id)}
                    disabled={actionLoading === post._id}
                    className="flex-1 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <CheckCircle
                      className={`w-4 h-4 ${
                        actionLoading === post._id ? "animate-spin" : ""
                      }`}
                    />
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(post._id, post.title)}
                    className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </>
              )}
              {/* Move to Pending for Rejected Posts */}
              {post.status === "rejected" && (
                <button
                  onClick={() => onApprove(post._id)}
                  disabled={actionLoading === post._id}
                  className="flex-1 px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  <Clock
                    className={`w-4 h-4 ${
                      actionLoading === post._id ? "animate-spin" : ""
                    }`}
                  />
                  To Pending
                </button>
              )}
              {/* Default Actions for Published/Draft */}
              {(post.status === "published" || post.status === "draft") && (
                <>
                  <button
                    onClick={() => onPreview(post)}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => onNavigate(`/posts/edit/${post._id}`)}
                    className="flex-1 px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                </>
              )}
              {/* Preview for Pending/Rejected */}
              {(post.status === "pending" || post.status === "rejected") && (
                <button
                  onClick={() => onPreview(post)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onDelete(post)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      );
    })}
  </motion.div>
);

// Preview Panel Component
const PreviewPanel = ({
  post,
  onClose,
  onApprove,
  onReject,
  getAuthorName,
}) => {
  if (!post) return null;

  return (
    <AnimatePresence>
      {post && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-3xl bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Post Preview
                  </h2>
                  <p className="text-xs text-gray-500">
                    Review content before moderation
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/posts/${post._id}`} target="_blank">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    Open Full
                  </button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Featured Image */}
              {post.featuredImage && (
                <div className="relative h-64 w-full">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          statusConfig[post.status]?.color ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {post.status}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                        {post.category}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-6">
                {/* Title */}
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                  {post.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    {post.author?.profile?.avatar ? (
                      <img
                        src={post.author.profile.avatar}
                        alt={getAuthorName(post.author)}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-medium">
                        {getAuthorName(post.author).charAt(0)}
                      </div>
                    )}
                    <span className="font-medium text-gray-900">
                      {getAuthorName(post.author)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(post.createdAt), "MMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.views || 0} views
                  </div>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Excerpt */}
                {post.excerpt && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <p className="text-sm italic text-amber-800">
                      {post.excerpt}
                    </p>
                  </div>
                )}

                {/* Content */}
                <div
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Stats */}
                <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="font-medium">
                      {post.likesCount || 0} likes
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">
                      {post.commentsCount || 0} comments
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Close Preview
                </button>
                <div className="flex items-center gap-2">
                  {post.status === "pending" && (
                    <>
                      <button
                        onClick={() => {
                          onApprove(post._id);
                          onClose();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          onReject(post._id, post.title);
                          onClose();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  {post.status === "rejected" && (
                    <button
                      onClick={() => {
                        onApprove(post._id);
                        onClose();
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      Move to Pending
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center gap-2"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="w-10 h-10 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            1
          </button>
          {start > 2 && <span className="text-gray-400">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-lg font-medium transition-all ${
            currentPage === page
              ? "bg-amber-500 text-white shadow-md"
              : "border border-gray-200 hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-gray-400">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-10 h-10 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
};

// Delete Modal Component
const DeleteModal = ({ post, onClose, onConfirm }) => {
  if (!post) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Delete Post?
            </h3>
            <p className="text-gray-500 text-center mb-6">
              Are you sure you want to delete "{post.title}"? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Skeleton Loader
const PostsSkeleton = ({ viewMode }) => {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
          >
            <div className="aspect-video bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-5 bg-gray-200 rounded w-full" />
              <div className="h-5 bg-gray-200 rounded w-2/3" />
              <div className="flex gap-2">
                <div className="h-6 w-6 bg-gray-200 rounded-full" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 border-b border-gray-100 animate-pulse"
        >
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <div className="w-12 h-12 bg-gray-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  );
};

// Empty State
const EmptyState = ({ searchQuery }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-gray-100 p-12 text-center"
  >
    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
      <FileText className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {searchQuery ? "No posts found" : "No posts yet"}
    </h3>
    <p className="text-gray-500 mb-6">
      {searchQuery
        ? `No posts match "${searchQuery}". Try a different search term.`
        : "Create your first post to get started."}
    </p>
  </motion.div>
);

export default BlogModeration;
