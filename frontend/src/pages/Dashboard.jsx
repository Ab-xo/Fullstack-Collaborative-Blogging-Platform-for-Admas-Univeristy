/**
 * ============================================================================
 * USER DASHBOARD PAGE
 * ============================================================================
 * The main dashboard for authenticated users (Authors/Writers).
 */

import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { usersAPI } from "../api/users";
import { followAPI } from "../api/follow";
import {
  AlertCircle,
  CheckCircle2,
  PenLine,
  Eye,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  TrendingUp,
  Home,
  Settings,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Calendar,
  Users,
  LogOut,
  Menu,
  X,
  Zap,
  Target,
  Award,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Mail,
  Lock,
  User,
  Globe,
  Moon,
  Sun,
  Feather,
} from "lucide-react";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Skeleton from "../components/common/Skeleton";
import AnalyticsDashboard from "../components/analytics/AnalyticsDashboard";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const userRoles = user?.roles || [user?.role] || [];
  const canCreatePosts = userRoles.some((role) =>
    ["admin", "moderator", "author"].includes(role)
  );

  const [stats, setStats] = useState({
    postsCount: 0,
    publishedCount: 0,
    draftCount: 0,
    pendingCount: 0,
    totalViews: 0,
    totalLikes: 0,
    totalDislikes: 0,
    totalComments: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followCounts, setFollowCounts] = useState({
    followersCount: 0,
    followingCount: 0,
  });
  const [followLoading, setFollowLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, postsResponse] = await Promise.all([
        usersAPI.getDashboardStats().catch(() => ({ stats: {} })),
        usersAPI.getUserPosts({ limit: 10 }).catch(() => ({ posts: [] })),
      ]);

      setStats({
        postsCount: statsResponse?.stats?.postsCount || 0,
        publishedCount: statsResponse?.stats?.publishedCount || 0,
        draftCount: statsResponse?.stats?.draftCount || 0,
        pendingCount: statsResponse?.stats?.pendingCount || 0,
        totalViews: statsResponse?.stats?.totalViews || 0,
        totalLikes: statsResponse?.stats?.totalLikes || 0,
        totalDislikes: statsResponse?.stats?.totalDislikes || 0,
        totalComments: statsResponse?.stats?.totalComments || 0,
      });
      setRecentPosts(postsResponse?.posts || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowData = async () => {
    if (!user?._id) return;
    try {
      setFollowLoading(true);
      const [followersRes, followingRes] = await Promise.all([
        followAPI.getFollowers(user._id).catch((err) => {
          console.error("Error fetching followers:", err);
          return { followers: [], total: 0 };
        }),
        followAPI.getFollowing(user._id).catch((err) => {
          console.error("Error fetching following:", err);
          return { following: [], total: 0 };
        }),
      ]);

      // Handle different response structures
      const followersData = followersRes?.data || followersRes;
      const followingData = followingRes?.data || followingRes;

      setFollowers(followersData?.followers || []);
      setFollowing(followingData?.following || []);
      setFollowCounts({
        followersCount:
          followersData?.total || followersData?.followers?.length || 0,
        followingCount:
          followingData?.total || followingData?.following?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching follow data:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendingVerification(true);
      await usersAPI.resendEmailVerification();
      toast.success("Verification email sent!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send verification email"
      );
    } finally {
      setResendingVerification(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    toast.success("All notifications marked as read");
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);
  useEffect(() => {
    if (user?._id) fetchFollowData();
  }, [user?._id]);

  // Fetch follow data when switching to followers tab
  useEffect(() => {
    if (
      activeTab === "followers" &&
      user?._id &&
      followers.length === 0 &&
      following.length === 0 &&
      !followLoading
    ) {
      fetchFollowData();
    }
  }, [activeTab]);

  // Redirect admins/moderators
  if (user?.roles?.includes("admin")) return <Navigate to="/admin" replace />;
  if (user?.roles?.includes("moderator"))
    return <Navigate to="/moderator" replace />;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <aside className="w-64 h-screen glass-sidebar border-r border-gray-200 dark:border-gray-700 p-4 space-y-4 hidden lg:block">
          <Skeleton height="40px" className="mb-8" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height="40px" />
          ))}
        </aside>
        <main className="flex-1 p-8 space-y-8">
          <header className="flex justify-between items-center mb-8">
            <Skeleton width="200px" height="32px" />
            <div className="flex gap-4">
              <Skeleton width="100px" height="40px" />
              <Skeleton width="100px" height="40px" />
            </div>
          </header>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height="100px" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2" height="300px" />
            <Skeleton height="300px" />
          </div>
        </main>
      </div>
    );
  }

  const navItems = [
    { icon: Home, label: "Overview", value: "overview" },
    {
      icon: FileText,
      label: "My Posts",
      value: "posts",
      count: stats.postsCount,
    },
    { icon: BarChart3, label: "Analytics", value: "analytics" },
    { icon: Calendar, label: "Calendar", value: "calendar" },
    {
      icon: Users,
      label: "Followers",
      value: "followers",
      count: followCounts.followersCount,
    },
    { icon: Settings, label: "Settings", value: "settings" },
  ];

  // ============ OVERVIEW PANEL ============
  const OverviewPanel = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            title: "Total Posts",
            value: stats.postsCount,
            icon: FileText,
            color: "from-blue-500 to-blue-600",
          },
          {
            title: "Published",
            value: stats.publishedCount,
            icon: CheckCircle2,
            color: "from-green-500 to-green-600",
          },
          {
            title: "Total Views",
            value: stats.totalViews.toLocaleString(),
            icon: Eye,
            color: "from-purple-500 to-purple-600",
          },
          {
            title: "Total Likes",
            value: stats.totalLikes.toLocaleString(),
            icon: ThumbsUp,
            color: "from-pink-500 to-pink-600",
          },
          {
            title: "Total Dislikes",
            value: (stats.totalDislikes || 0).toLocaleString(),
            icon: ThumbsDown,
            color: "from-orange-500 to-orange-600",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white shadow-lg card-hover cursor-default`}
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm opacity-90">{stat.title}</p>
              <stat.icon className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Stats & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              {
                label: "Drafts",
                value: stats.draftCount,
                color: "text-yellow-600",
              },
              {
                label: "Avg. Views",
                value:
                  stats.postsCount > 0
                    ? Math.round(stats.totalViews / stats.postsCount)
                    : 0,
                color: "text-blue-600",
              },
              {
                label: "Engagement",
                value: `${(
                  (stats.totalLikes / Math.max(stats.totalViews, 1)) *
                  100
                ).toFixed(1)}%`,
                color: "text-green-600",
              },
              {
                label: "Approval",
                value: `${(
                  ((stats.totalLikes || 0) /
                    Math.max(
                      (stats.totalLikes || 0) + (stats.totalDislikes || 0),
                      1
                    )) *
                  100
                ).toFixed(0)}%`,
                color: "text-purple-600",
              },
              {
                label: "Published",
                value: `${(
                  (stats.publishedCount / Math.max(stats.postsCount, 1)) *
                  100
                ).toFixed(0)}%`,
                color: "text-purple-600",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center"
              >
                <p className={`text-xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            {canCreatePosts && (
              <Link
                to="/posts/create"
                className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 transition-colors group"
              >
                <div className="p-2 bg-blue-500 rounded-lg">
                  <PenLine className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  Create Post
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            <button
              onClick={() => setActiveTab("posts")}
              className="w-full flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 transition-colors group"
            >
              <div className="p-2 bg-purple-500 rounded-lg">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white text-sm">
                My Posts
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className="w-full flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 transition-colors group"
            >
              <div className="p-2 bg-green-500 rounded-lg">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white text-sm">
                Analytics
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Posts & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Recent Posts
            </h3>
            <button
              onClick={() => setActiveTab("posts")}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentPosts.length > 0 ? (
              recentPosts.slice(0, 3).map((post) => (
                <Link
                  key={post._id}
                  to={`/posts/${post._id}`}
                  className="block hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {post.likesCount || 0}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No posts yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5" />
            <h3 className="font-bold">Your Progress</h3>
          </div>
          <div className="space-y-3">
            {[
              { title: "First Post", progress: stats.postsCount > 0 ? 100 : 0 },
              {
                title: "100 Views",
                progress: Math.min((stats.totalViews / 100) * 100, 100),
              },
              {
                title: "10 Likes",
                progress: Math.min((stats.totalLikes / 10) * 100, 100),
              },
            ].map((a, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{a.title}</span>
                  <span>{a.progress.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: `${a.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ============ MY POSTS PANEL ============
  const PostsPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          My Posts
        </h2>
        <Link
          to="/my-posts"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          View Full Page <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentPosts.length > 0 ? (
            recentPosts.map((post) => (
              <div
                key={post._id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {post.featuredImage && (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {post.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {post.excerpt || "No excerpt"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium flex-shrink-0 ${
                          post.status === "published"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : post.status === "pending"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Eye className="w-4 h-4" />
                        {post.views || 0}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                        {post.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <ThumbsDown className="w-4 h-4 text-orange-500" />
                        {post.dislikesCount || 0}
                      </span>
                      <div className="ml-auto flex items-center gap-2">
                        <Link
                          to={`/posts/${post._id}/edit`}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </Link>
                        <Link
                          to={`/posts/${post._id}`}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {canCreatePosts
                  ? "No posts yet"
                  : "You haven't created any posts"}
              </p>
              {canCreatePosts && (
                <Link to="/posts/create">
                  <Button variant="primary">
                    <PenLine className="w-4 h-4 mr-2" />
                    Create Your First Post
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ============ ANALYTICS PANEL ============
  const AnalyticsPanel = () => (
    <AnalyticsDashboard stats={stats} recentPosts={recentPosts} />
  );

  // ============ CALENDAR PANEL ============
  const CalendarPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Content Calendar
        </h2>
        <Button variant="primary" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Schedule Post
        </Button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Upcoming Events
        </h3>
        <div className="space-y-3">
          {[
            {
              id: 1,
              title: "Publish Tech Article",
              date: "2024-12-10",
              type: "publish",
            },
            {
              id: 2,
              title: "Draft Review",
              date: "2024-12-12",
              type: "review",
            },
            {
              id: 3,
              title: "Content Planning",
              date: "2024-12-15",
              type: "planning",
            },
          ].map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  event.type === "publish"
                    ? "bg-green-500"
                    : event.type === "review"
                    ? "bg-yellow-500"
                    : "bg-blue-500"
                }`}
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {event.title}
                </p>
                <p className="text-sm text-gray-500">{event.date}</p>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  event.type === "publish"
                    ? "bg-green-100 text-green-700"
                    : event.type === "review"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {event.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ============ FOLLOWERS PANEL ============
  const FollowersPanel = () => {
    // Show loading state while fetching follow data
    if (followLoading) {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Followers & Following
          </h2>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading followers...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Followers & Following
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-5 text-white">
            <Users className="w-8 h-8 mb-2" />
            <p className="text-3xl font-bold">{followCounts.followersCount}</p>
            <p className="text-white/80">Followers</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-5 text-white">
            <UserPlus className="w-8 h-8 mb-2" />
            <p className="text-3xl font-bold">{followCounts.followingCount}</p>
            <p className="text-white/80">Following</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Your Followers
            </h3>
            {followers && followers.length > 0 ? (
              <div className="space-y-3">
                {followers.slice(0, 5).map((follower, index) => (
                  <div
                    key={follower?._id || `follower-${index}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-semibold">
                      {follower?.firstName?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {follower?.firstName || "Unknown"}{" "}
                        {follower?.lastName || ""}
                      </p>
                      <p className="text-sm text-gray-500">
                        {follower?.email || ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No followers yet</p>
                <p className="text-sm mt-1">
                  Share your posts to gain followers!
                </p>
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              People You Follow
            </h3>
            {following && following.length > 0 ? (
              <div className="space-y-3">
                {following.slice(0, 5).map((followedUser, index) => (
                  <div
                    key={followedUser?._id || `following-${index}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-semibold">
                      {followedUser?.firstName?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {followedUser?.firstName || "Unknown"}{" "}
                        {followedUser?.lastName || ""}
                      </p>
                      <p className="text-sm text-gray-500">
                        {followedUser?.email || ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Not following anyone yet</p>
                <p className="text-sm mt-1">Discover authors to follow!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============ SETTINGS PANEL ============
  const SettingsPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Settings
        </h2>
        <Link
          to="/settings"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          Full Settings <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <div className="space-y-4">
          <Link
            to="/settings"
            className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg hover:shadow-md transition-all"
          >
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                All Settings
              </p>
              <p className="text-sm text-gray-500">
                Profile, security, notifications & more
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
          <Link
            to="/profile/edit"
            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                Edit Profile
              </p>
              <p className="text-sm text-gray-500">
                Update your personal information
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
          <Link
            to="/notifications"
            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Bell className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                Notifications
              </p>
              <p className="text-sm text-gray-500">
                Manage notification preferences
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <LogOut className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-red-600">Logout</p>
              <p className="text-sm text-red-500">Sign out of your account</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // ============ RENDER ACTIVE PANEL ============
  const renderPanel = () => {
    switch (activeTab) {
      case "posts":
        return <PostsPanel />;
      case "analytics":
        return <AnalyticsPanel />;
      case "calendar":
        return <CalendarPanel />;
      case "followers":
        return <FollowersPanel />;
      case "settings":
        return <SettingsPanel />;
      default:
        return <OverviewPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 left-0 z-40 h-screen glass-sidebar border-r border-gray-200 dark:border-gray-700 shadow-xl transition-all duration-500 ease-in-out ${
            sidebarOpen ? "w-64" : "w-20"
          } ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Logo */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-primary-foreground">
                <Feather className="h-4 w-4 text-white" />
              </div>
              {sidebarOpen && (
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Admas Blog</span>
                  <span className="text-xs text-muted-foreground">
                    Author Panel
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => setActiveTab(item.value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  activeTab === item.value
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="font-medium">{item.label}</span>
                    {item.count !== undefined && (
                      <span
                        className={`ml-auto px-2 py-0.5 text-xs rounded-full ${
                          activeTab === item.value
                            ? "bg-blue-100 dark:bg-blue-800"
                            : "bg-gray-200 dark:bg-gray-600"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Top Bar */}
          <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Welcome, {user?.firstName}!
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-sm w-32"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Eye className="w-4 h-4" />
                  <span>{stats.totalViews} views</span>
                </div>
                {canCreatePosts && (
                  <Link
                    to="/posts/create"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PenLine className="w-4 h-4" />
                    <span className="hidden sm:inline">New Post</span>
                  </Link>
                )}
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">{renderPanel()}</div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
