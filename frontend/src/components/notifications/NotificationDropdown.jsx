import { useState, useEffect, useRef } from "react";
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
  X,
  Check,
  Trash2,
  Settings,
  Loader2,
} from "lucide-react";
import { notificationsAPI } from "../../api/notifications";
import { collaborationAPI } from "../../api/collaboration";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

const NOTIFICATION_ICONS = {
  like: {
    icon: Heart,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
  dislike: {
    icon: ThumbsDown,
    color: "text-orange-500",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
  comment: {
    icon: MessageCircle,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  reply: {
    icon: MessageCircle,
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  follow: {
    icon: UserPlus,
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  post_approved: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  post_rejected: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
  post_published: {
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  pending_review: {
    icon: FileText,
    color: "text-yellow-500",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  new_user: {
    icon: UserPlus,
    color: "text-indigo-500",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
  },
  account_approved: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  account_rejected: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
  content_report: {
    icon: Bell,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
  collaboration_invite: {
    icon: UserPlus,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  collaboration_accepted: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  collaboration_declined: {
    icon: XCircle,
    color: "text-orange-500",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
  collaboration_removed: {
    icon: Bell,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
  collaboration_left: {
    icon: UserPlus,
    color: "text-gray-500",
    bg: "bg-gray-100 dark:bg-gray-700",
  },
  system: {
    icon: Bell,
    color: "text-gray-500",
    bg: "bg-gray-100 dark:bg-gray-700",
  },
  welcome: {
    icon: Bell,
    color: "text-yellow-500",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
  },
};

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  onRefresh,
}) => {
  const iconConfig =
    NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.system;
  const Icon = iconConfig.icon;
  const [responding, setResponding] = useState(false);

  const isCollaborationInvite = notification.type === "collaboration_invite";

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

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
        !notification.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${iconConfig.bg}`}>
          <Icon className={`w-4 h-4 ${iconConfig.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <Link
            to={notification.link || "#"}
            onClick={() =>
              !notification.read &&
              !isCollaborationInvite &&
              onMarkAsRead(notification._id)
            }
            className="block"
          >
            <p
              className={`text-sm ${
                !notification.read ? "font-semibold" : ""
              } text-gray-900 dark:text-white`}
            >
              {notification.title}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">
              {notification.message}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </p>
          </Link>

          {/* Collaboration Invite Actions */}
          {isCollaborationInvite && !notification.read && (
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => handleCollaborationResponse(true)}
                disabled={responding}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {responding ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                Accept
              </button>
              <button
                onClick={() => handleCollaborationResponse(false)}
                disabled={responding}
                className="flex items-center gap-1 px-2.5 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 transition-colors"
              >
                <X className="w-3 h-3" />
                Decline
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!notification.read && !isCollaborationInvite && (
            <button
              onClick={() => onMarkAsRead(notification._id)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Mark as read"
            >
              <Check className="w-3 h-3 text-gray-500" />
            </button>
          )}
          <button
            onClick={() => onDelete(notification._id)}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
            title="Delete"
          >
            <X className="w-3 h-3 text-gray-500 hover:text-red-500" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getNotifications({ limit: 10 });
      setNotifications(response.data?.notifications || []);
      setUnreadCount(response.data?.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count periodically
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
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
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Mark all read
                  </button>
                )}
                <Link
                  to="/settings/notifications"
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                </Link>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : notifications.length > 0 ? (
                <AnimatePresence>
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                      onRefresh={fetchNotifications}
                    />
                  ))}
                </AnimatePresence>
              ) : (
                <div className="p-8 text-center">
                  <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No notifications yet
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                <Link
                  to="/notifications"
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  onClick={() => setIsOpen(false)}
                >
                  View all notifications
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
