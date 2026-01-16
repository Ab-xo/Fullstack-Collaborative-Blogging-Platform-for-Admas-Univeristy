/**
 * ============================================================================
 * USER ACTIVITY PAGE - Monitor User Behavior and Activity
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  FileText,
  MessageSquare,
  Heart,
  Eye,
  AlertTriangle,
  Shield,
  TrendingUp,
  Clock,
  UserPlus,
  Edit,
  Trash2,
  Flag,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const UserActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState("all");
  const [timeRange, setTimeRange] = useState("24h");

  const activitiesPerPage = 20;

  // Mock activity data
  const mockActivities = [
    {
      _id: "1",
      type: "post_created",
      user: { firstName: "John", lastName: "Doe" },
      details: { postTitle: "Introduction to AI" },
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      _id: "2",
      type: "comment_added",
      user: { firstName: "Jane", lastName: "Smith" },
      details: { postTitle: "Web Development Tips", comment: "Great article!" },
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      _id: "3",
      type: "post_liked",
      user: { firstName: "Bob", lastName: "Wilson" },
      details: { postTitle: "Machine Learning Basics" },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      _id: "4",
      type: "user_registered",
      user: { firstName: "Alice", lastName: "Brown" },
      details: { role: "author" },
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      _id: "5",
      type: "post_reported",
      user: { firstName: "Charlie", lastName: "Davis" },
      details: { postTitle: "Controversial Topic", reason: "misinformation" },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      _id: "6",
      type: "post_edited",
      user: { firstName: "Eve", lastName: "Miller" },
      details: { postTitle: "Updated Research Paper" },
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  ];

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      let filtered = [...mockActivities];
      if (filterType !== "all") {
        filtered = filtered.filter((a) => a.type === filterType);
      }

      setActivities(filtered);
      setTotalPages(Math.ceil(filtered.length / activitiesPerPage));
    } catch (error) {
      toast.error("Failed to load activities");
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, timeRange]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getActivityIcon = (type) => {
    const icons = {
      post_created: {
        icon: FileText,
        color: "text-blue-500",
        bg: "bg-blue-100 dark:bg-blue-900/30",
      },
      comment_added: {
        icon: MessageSquare,
        color: "text-green-500",
        bg: "bg-green-100 dark:bg-green-900/30",
      },
      post_liked: {
        icon: Heart,
        color: "text-pink-500",
        bg: "bg-pink-100 dark:bg-pink-900/30",
      },
      user_registered: {
        icon: UserPlus,
        color: "text-purple-500",
        bg: "bg-purple-100 dark:bg-purple-900/30",
      },
      post_reported: {
        icon: Flag,
        color: "text-red-500",
        bg: "bg-red-100 dark:bg-red-900/30",
      },
      post_edited: {
        icon: Edit,
        color: "text-amber-500",
        bg: "bg-amber-100 dark:bg-amber-900/30",
      },
      post_deleted: {
        icon: Trash2,
        color: "text-gray-500",
        bg: "bg-gray-100 dark:bg-gray-700",
      },
    };
    return (
      icons[type] || {
        icon: Activity,
        color: "text-gray-500",
        bg: "bg-gray-100 dark:bg-gray-700",
      }
    );
  };

  const getActivityText = (activity) => {
    const texts = {
      post_created: `created a new post "${activity.details?.postTitle}"`,
      comment_added: `commented on "${activity.details?.postTitle}"`,
      post_liked: `liked "${activity.details?.postTitle}"`,
      user_registered: `registered as ${activity.details?.role}`,
      post_reported: `reported "${activity.details?.postTitle}" for ${activity.details?.reason}`,
      post_edited: `edited "${activity.details?.postTitle}"`,
    };
    return texts[activity.type] || "performed an action";
  };

  const getAuthorName = (user) => {
    if (!user) return "Unknown";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown";
  };

  const filteredActivities = activities.filter(
    (activity) =>
      getAuthorName(activity.user)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      activity.details?.postTitle
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Stats
  const stats = {
    total: activities.length,
    posts: activities.filter((a) => a.type.includes("post")).length,
    comments: activities.filter((a) => a.type === "comment_added").length,
    reports: activities.filter((a) => a.type === "post_reported").length,
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
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
                User Activity
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Monitor user behavior and platform activity
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchActivities}
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
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.posts}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Posts
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.comments}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Comments
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
                  {stats.reports}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Reports
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
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
            >
              <option value="all">All Activities</option>
              <option value="post_created">Posts Created</option>
              <option value="comment_added">Comments</option>
              <option value="post_liked">Likes</option>
              <option value="post_reported">Reports</option>
              <option value="user_registered">Registrations</option>
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </motion.div>

        {/* Activity Feed */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center"
          >
            <Activity className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No activity found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "No activities match your search."
                : "No recent activity to display."}
            </p>
          </motion.div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredActivities.map((activity, index) => {
                const iconData = getActivityIcon(activity.type);
                const IconComponent = iconData.icon;
                return (
                  <motion.div
                    key={activity._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${iconData.bg}`}>
                        <IconComponent
                          className={`w-5 h-5 ${iconData.color}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-white">
                          <span className="font-semibold">
                            {getAuthorName(activity.user)}
                          </span>{" "}
                          {getActivityText(activity)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
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
      </div>
    </DashboardLayout>
  );
};

export default UserActivity;
