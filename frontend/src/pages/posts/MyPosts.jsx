/**
 * ============================================================================
 * MY POSTS PAGE - AUTHOR'S POST MANAGEMENT
 * ============================================================================
 *
 * Purpose:
 *   Displays all posts created by the logged-in user with management
 *   options for editing, deleting, and tracking post status.
 *
 * Features:
 *   - List all user's posts (published, draft, pending, rejected)
 *   - Post status indicators with color-coded badges
 *   - Edit and delete functionality
 *   - View count and engagement metrics
 *   - Pagination for large post collections
 *   - Delete confirmation modal
 *   - Quick actions menu per post
 *
 * Post Statuses:
 *   - Draft: Saved but not submitted
 *   - Pending: Awaiting moderator approval
 *   - Published: Live and visible to all
 *   - Rejected: Not approved by moderator
 *
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usersAPI } from "../../api/users";
import { postsAPI } from "../../api/posts";
import { useAuth } from "../../hooks/useAuth";
import {
  PenTool,
  Edit2,
  Eye,
  Heart,
  Calendar,
  Trash2,
  AlertTriangle,
  X,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
} from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { usePagination } from "../../hooks/usePagination";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";

const MyPosts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, post: null });
  const [deleting, setDeleting] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const {
    page,
    totalPages,
    updatePagination,
    nextPage,
    previousPage,
    hasPrevious,
    hasMore,
  } = usePagination();

  // Check if user has author permissions
  const userRoles = user?.roles || [user?.role] || [];
  const canCreatePosts = userRoles.some((role) =>
    ["admin", "moderator", "author"].includes(role)
  );

  useEffect(() => {
    fetchMyPosts();
  }, [page]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActionMenuOpen(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getUserPosts();
      setPosts(response.posts || []);
      updatePagination({
        totalPages: response.totalPages || 1,
        currentPage: response.currentPage || 1,
        totalItems: response.totalPosts || 0,
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load your posts");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (postId) => {
    navigate(`/posts/edit/${postId}`);
  };

  const handleDelete = async () => {
    if (!deleteModal.post) return;

    try {
      setDeleting(true);
      await postsAPI.deletePost(deleteModal.post._id);
      toast.success("Post deleted successfully");
      setDeleteModal({ isOpen: false, post: null });
      fetchMyPosts(); // Refresh the list
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error(error.response?.data?.message || "Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (post) => {
    setDeleteModal({ isOpen: true, post });
    setActionMenuOpen(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "published":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "draft":
        return <FileText className="w-4 h-4 text-gray-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "draft":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading your posts..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Posts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track your blog posts ({posts.length} total)
          </p>
        </div>
        {canCreatePosts && (
          <Link to="/posts/create">
            <Button variant="primary" icon={PenTool}>
              Create New Post
            </Button>
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <PenTool className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No posts yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            {canCreatePosts
              ? "Start sharing your thoughts with the community"
              : "You haven't created any posts yet"}
          </p>
          {canCreatePosts ? (
            <Link to="/posts/create">
              <Button variant="primary" size="lg">
                Create Your First Post
              </Button>
            </Link>
          ) : (
            <p className="text-sm text-gray-500">
              As a Reader, you can browse and interact with posts. Contact an
              admin to become an Author.
            </p>
          )}
        </Card>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {posts.map((post) => (
              <Card
                key={post._id}
                className="p-6 hover:shadow-lg transition-shadow"
                hover
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Thumbnail */}
                  {post.featuredImage && (
                    <div className="relative">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full md:w-48 h-32 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 left-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            post.status
                          )}`}
                        >
                          {getStatusIcon(post.status)}
                          {post.status}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        {!post.featuredImage && (
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                post.status
                              )}`}
                            >
                              {getStatusIcon(post.status)}
                              {post.status}
                            </span>
                            <Badge variant="primary">{post.category}</Badge>
                          </div>
                        )}
                        <Link to={`/posts/${post._id}`}>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {post.title}
                          </h3>
                        </Link>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(post._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(post)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {post.excerpt || post.content?.substring(0, 150) + "..."}
                    </p>

                    {/* Post rejection reason */}
                    {post.status === "rejected" && post.moderationNotes && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">
                          <span className="font-medium">Rejection reason:</span>{" "}
                          {post.moderationNotes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(post.createdAt), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {post.likesCount || 0} likes
                      </span>
                      {post.featuredImage && (
                        <Badge variant="primary">{post.category}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <Button
                variant="secondary"
                onClick={previousPage}
                disabled={!hasPrevious}
              >
                Previous
              </Button>
              <span className="text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                onClick={nextPage}
                disabled={!hasMore}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <DeletePostModal
          post={deleteModal.post}
          onClose={() => setDeleteModal({ isOpen: false, post: null })}
          onConfirm={handleDelete}
          isDeleting={deleting}
        />
      )}
    </div>
  );
};

// Delete Post Modal Component
const DeletePostModal = ({ post, onClose, onConfirm, isDeleting }) => {
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="p-6">
            {/* Warning Icon */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Delete Post?
            </h3>

            {/* Description */}
            <p className="text-gray-500 text-center mb-4">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>

            {/* Post Preview */}
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

            {/* Warning Message */}
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

            {/* Action Buttons */}
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

export default MyPosts;
