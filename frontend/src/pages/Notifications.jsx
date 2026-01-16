/**
 * ============================================================================
 * NOTIFICATIONS PAGE
 * ============================================================================
 *
 * Displays all user notifications in a centralized view.
 *
 * NOTIFICATION TYPES:
 *   - like: Someone liked your post
 *   - dislike: Someone disliked your post
 *   - comment: New comment on your post
 *   - reply: Reply to your comment
 *   - follow: New follower
 *   - post_approved: Your post was approved
 *   - post_rejected: Your post was rejected
 *   - post_published: Your post is now live
 *   - pending_review: Posts waiting for review (admin/moderator)
 *   - new_user: New user registered (admin)
 *   - welcome: Welcome message for new users
 *
 * FEATURES:
 *   - Filter by notification type
 *   - Mark as read (individual or all)
 *   - Delete notifications
 *   - Pagination with "Load More"
 *   - Real-time unread count
 *
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Heart,
  ThumbsDown,
  MessageCircle,
  UserPlus,
  CheckCircle,
  XCircle,
  FileText,
  Check,
  Trash2,
  Filter,
  Clock,
  AlertCircle,
  User,
  Shield,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { notificationsAPI } from "../api/notifications";
import { collaborationAPI } from "../api/collaboration";
import { formatDistanceToNow, format } from "date-fns";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/common/LoadingSpinner";

const NOTIFICATION_CONFIG = {
  like: {
    icon: Heart,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900/30",
    gradient: "from-red-500 to-pink-500",
  },
  dislike: {
    icon: ThumbsDown,
    color: "text-orange-500",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    gradient: "from-orange-500 to-amber-500",
  },
  comment: {
    icon: MessageCircle,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    gradient: "from-blue-500 to-cyan-500",
  },
  reply: {
    icon: MessageCircle,
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    gradient: "from-purple-500 to-violet-500",
  },
  follow: {
    icon: UserPlus,
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900/30",
    gradient: "from-green-500 to-emerald-500",
  },
  post_approved: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900/30",
    gradient: "from-green-500 to-teal-500",
  },
  post_rejected: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900/30",
    gradient: "from-red-500 to-rose-500",
  },
  post_published: {
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    gradient: "from-blue-500 to-indigo-500",
  },
  pending_review: {
    icon: Clock,
    color: "text-yellow-500",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    gradient: "from-yellow-500 to-orange-500",
  },
  new_user: {
    icon: User,
    color: "text-indigo-500",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    gradient: "from-indigo-500 to-purple-500",
  },
  account_approved: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900/30",
    gradient: "from-green-500 to-emerald-500",
  },
  account_rejected: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900/30",
    gradient: "from-red-500 to-rose-500",
  },
  content_report: {
    icon: AlertCircle,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900/30",
    gradient: "from-red-500 to-orange-500",
  },
  contact_message: {
    icon: MessageCircle,
    color: "text-indigo-500",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    gradient: "from-indigo-500 to-purple-500",
  },
  collaboration_invite: {
    icon: UserPlus,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    gradient: "from-blue-500 to-indigo-500",
  },
  collaboration_accepted: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900/30",
    gradient: "from-green-500 to-emerald-500",
  },
  collaboration_declined: {
    icon: XCircle,
    color: "text-orange-500",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    gradient: "from-orange-500 to-amber-500",
  },
  collaboration_removed: {
    icon: AlertCircle,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900/30",
    gradient: "from-red-500 to-rose-500",
  },
  collaboration_left: {
    icon: UserPlus,
    color: "text-gray-500",
    bg: "bg-gray-100 dark:bg-gray-700",
    gradient: "from-gray-500 to-slate-500",
  },
  system: {
    icon: Bell,
    color: "text-gray-500",
    bg: "bg-gray-100 dark:bg-gray-700",
    gradient: "from-gray-500 to-slate-500",
  },
  welcome: {
    icon: Sparkles,
    color: "text-yellow-500",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    gradient: "from-yellow-500 to-amber-500",
  },
};

const FILTER_OPTIONS = [
  { value: "all", label: "All Notifications" },
  { value: "unread", label: "Unread Only" },
  { value: "like", label: "Likes" },
  { value: "comment", label: "Comments" },
  { value: "follow", label: "Followers" },
  { value: "post_approved", label: "Approvals" },
  { value: "post_rejected", label: "Rejections" },
  { value: "pending_review", label: "Pending Reviews" },
];

// Helper function to check if a notification link is valid
const isValidLink = (link, type) => {
  if (!link) return false;

  // Valid link patterns
  const validPatterns = [
    /^\/posts\/[a-zA-Z0-9]+$/, // Post detail
    /^\/posts\/[a-zA-Z0-9]+\/edit$/, // Post edit
    /^\/admin\/posts/, // Admin posts
    /^\/admin\/users/, // Admin users
    /^\/admin\/contacts/, // Admin contacts
    /^\/blogs/, // Blogs page
    /^\/my-posts/, // My posts
  ];

  // Check if link matches any valid pattern
  return validPatterns.some((pattern) => pattern.test(link));
};

// Helper function to get action label based on notification type
const getActionLabel = (type) => {
  const labels = {
    like: "View Post",
    dislike: "View Post",
    comment: "View Comment",
    reply: "View Reply",
    follow: "View Profile",
    post_approved: "View Post",
    post_rejected: "Edit Post",
    post_published: "Read Post",
    pending_review: "Review Posts",
    new_user: "View Users",
    account_approved: "Start Writing",
    contact_message: "View Message",
    welcome: "Explore Blogs",
    system: "View Details",
  };
  return labels[type] || "View Details";
};

const NotificationCard = ({
  notification,
  onMarkAsRead,
  onDelete,
  onRefresh,
}) => {
  const config =
    NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.system;
  const Icon = config.icon;
  const [responding, setResponding] = useState(false);

  // Handle collaboration invitation response
  const handleCollaborationResponse = async (accept) => {
    try {
      setResponding(true);
      const postId = notification.metadata?.postId;
      if (!postId) {
        toast.error("Invalid invitation");
        return;
      }

      await collaborationAPI.respondToInvitation(postId, accept);
      toast.success(
        accept ? "You are now a collaborator!" : "Invitation declined"
      );

      // Mark notification as read and refresh
      await onMarkAsRead(notification._id);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error responding to invitation:", error);
      toast.error(
        error.response?.data?.message || "Failed to respond to invitation"
      );
    } finally {
      setResponding(false);
    }
  };

  const isCollaborationInvite = notification.type === "collaboration_invite";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
        !notification.read
          ? "bg-white dark:bg-gray-800 shadow-lg ring-2 ring-blue-500/20"
          : "bg-white/80 dark:bg-gray-800/80 shadow-md hover:shadow-lg"
      }`}
    >
      {/* Gradient accent bar */}
      <div
        className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${config.gradient}`}
      />

      <div className="p-5 pl-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`p-3 rounded-xl ${config.bg} flex-shrink-0`}
          >
            <Icon className={`w-6 h-6 ${config.color}`} />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3
                  className={`font-semibold text-gray-900 dark:text-white ${
                    !notification.read ? "text-lg" : ""
                  }`}
                >
                  {notification.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm leading-relaxed">
                  {notification.message}
                </p>
              </div>

              {!notification.read && (
                <span className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              )}
            </div>

            {/* Role badge for collaboration invites */}
            {isCollaborationInvite && notification.metadata?.role && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                  Role:{" "}
                  {notification.metadata.role.charAt(0).toUpperCase() +
                    notification.metadata.role.slice(1)}
                </span>
              </div>
            )}

            {/* Meta info */}
            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                })}
              </span>

              {notification.sender && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <User className="w-3.5 h-3.5" />
                  {notification.sender.firstName} {notification.sender.lastName}
                </span>
              )}

              {notification.priority === "high" && (
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-full">
                  Important
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4">
              {/* Collaboration Invite Actions */}
              {isCollaborationInvite && !notification.read && (
                <>
                  <button
                    onClick={() => handleCollaborationResponse(true)}
                    disabled={responding}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    {responding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Accept
                  </button>
                  <button
                    onClick={() => handleCollaborationResponse(false)}
                    disabled={responding}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Decline
                  </button>
                </>
              )}

              {/* Regular notification actions */}
              {!isCollaborationInvite &&
                notification.link &&
                isValidLink(notification.link, notification.type) && (
                  <Link
                    to={notification.link}
                    onClick={() =>
                      !notification.read && onMarkAsRead(notification._id)
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
                  >
                    {getActionLabel(notification.type)}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}

              {/* View Post link for collaboration invites */}
              {isCollaborationInvite && notification.link && (
                <Link
                  to={notification.link}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                >
                  View Post
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}

              {!notification.read && !isCollaborationInvite && (
                <button
                  onClick={() => onMarkAsRead(notification._id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Mark Read
                </button>
              )}

              <button
                onClick={() => onDelete(notification._id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({ total: 0, unread: 0 });

  const fetchNotifications = async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      const params = { page: currentPage, limit: 20 };

      if (filter === "unread") {
        params.unreadOnly = "true";
      } else if (filter !== "all") {
        params.type = filter;
      }

      const response = await notificationsAPI.getNotifications(params);
      const newNotifications = response.data?.notifications || [];

      if (reset) {
        setNotifications(newNotifications);
        setPage(1);
      } else {
        setNotifications((prev) => [...prev, ...newNotifications]);
      }

      setStats({
        total: response.data?.pagination?.total || 0,
        unread: response.data?.unreadCount || 0,
      });
      setHasMore(newNotifications.length === 20);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
  }, [filter]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setStats((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setStats((prev) => ({ ...prev, unread: 0 }));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      const notification = notifications.find((n) => n._id === notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      if (!notification?.read) {
        setStats((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
      }
      setStats((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete all notifications?"))
      return;

    try {
      await notificationsAPI.deleteAllNotifications();
      setNotifications([]);
      setStats({ total: 0, unread: 0 });
      toast.success("All notifications deleted");
    } catch (error) {
      toast.error("Failed to delete notifications");
    }
  };

  const loadMore = () => {
    setPage((prev) => prev + 1);
    fetchNotifications();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Notifications
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Stay updated with your activity
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchNotifications(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-500 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Bell className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.unread}
                  </p>
                  <p className="text-sm text-gray-500">Unread</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500"
              >
                {FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              {stats.unread > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Mark All Read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" text="Loading notifications..." />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  onRefresh={() => fetchNotifications(true)}
                />
              ))}
            </AnimatePresence>

            {/* Load More */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center pt-4"
              >
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm"
          >
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              When you get notifications about likes, comments, followers, and
              more, they'll show up here.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
