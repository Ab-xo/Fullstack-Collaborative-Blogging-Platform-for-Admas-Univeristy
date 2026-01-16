import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Search,
  Filter,
  Calendar,
  User,
  Shield,
  FileText,
  Settings,
  LogIn,
  LogOut,
  UserCheck,
  UserX,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Monitor,
  Download,
  X,
} from "lucide-react";
import { format } from "date-fns";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { adminAPI } from "../../api/admin";
import toast from "react-hot-toast";

const ACTION_ICONS = {
  user_registered: UserCheck,
  user_approved: UserCheck,
  user_rejected: UserX,
  user_suspended: UserX,
  user_activated: UserCheck,
  user_deleted: UserX,
  role_updated: Shield,
  login: LogIn,
  logout: LogOut,
  password_changed: Shield,
  email_verified: UserCheck,
  password_reset_requested: Shield,
  password_reset: Shield,
  profile_updated: User,
  avatar_uploaded: User,
  account_deleted: UserX,
  settings_updated: Settings,
  post_created: FileText,
  post_updated: FileText,
  post_deleted: FileText,
  post_approved: FileText,
  post_rejected: FileText,
  comment_created: FileText,
  comment_deleted: FileText,
};

const ACTION_COLORS = {
  user_registered:
    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  user_approved:
    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  user_rejected: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  user_suspended:
    "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  user_activated:
    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  user_deleted: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  role_updated:
    "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  login: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  logout: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  password_changed:
    "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  email_verified:
    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  settings_updated:
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  default: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
};

const RESOURCE_TYPES = [
  { value: "", label: "All Types" },
  { value: "user", label: "User" },
  { value: "auth", label: "Authentication" },
  { value: "profile", label: "Profile" },
  { value: "post", label: "Post" },
  { value: "comment", label: "Comment" },
  { value: "system", label: "System" },
  { value: "settings", label: "Settings" },
];

const ACTIONS = [
  { value: "", label: "All Actions" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "user_registered", label: "User Registered" },
  { value: "user_approved", label: "User Approved" },
  { value: "user_rejected", label: "User Rejected" },
  { value: "user_suspended", label: "User Suspended" },
  { value: "role_updated", label: "Role Updated" },
  { value: "password_changed", label: "Password Changed" },
  { value: "profile_updated", label: "Profile Updated" },
  { value: "settings_updated", label: "Settings Updated" },
];

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalCount: 0,
  });
  const [filters, setFilters] = useState({
    action: "",
    resourceType: "",
    search: "",
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );
      const [logsResponse, statsResponse] = await Promise.all([
        adminAPI.getAuditLogs(pagination.current, 20, activeFilters),
        adminAPI.getAuditLogStats(30),
      ]);
      setLogs(logsResponse.logs || []);
      setPagination(logsResponse.pagination || pagination);
      setStats(statsResponse.stats || null);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      action: "",
      resourceType: "",
      search: "",
      startDate: "",
      endDate: "",
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const getActionIcon = (action) => {
    const Icon = ACTION_ICONS[action] || Activity;
    return Icon;
  };

  const getActionColor = (action) => {
    return ACTION_COLORS[action] || ACTION_COLORS.default;
  };

  const formatActionName = (action) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Audit Logs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track system events and user actions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-700"
                  : "bg-white border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={() => {
                const csvContent = logs
                  .map(
                    (log) =>
                      `${log.action},${log.performedBy?.email || "Unknown"},${
                        log.ipAddress || "Unknown"
                      },${log.timestamp}`
                  )
                  .join("\n");
                const blob = new Blob(
                  [`Action,User,IP,Timestamp\n${csvContent}`],
                  { type: "text/csv" }
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `audit-logs-${format(
                  new Date(),
                  "yyyy-MM-dd"
                )}.csv`;
                a.click();
                toast.success("Audit logs exported");
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Filter */}
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange("action", e.target.value)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {ACTIONS.map((action) => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </select>

              {/* Resource Type Filter */}
              <select
                value={filters.resourceType}
                onChange={(e) =>
                  handleFilterChange("resourceType", e.target.value)
                }
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {RESOURCE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              {/* Date Range */}
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Clear all filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Logs
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {pagination.totalCount.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <LogIn className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Logins (30d)
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats?.activityByType
                    ?.find((a) => a._id === "login")
                    ?.count?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Registrations (30d)
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats?.activityByType
                    ?.find((a) => a._id === "user_registered")
                    ?.count?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Admin Actions (30d)
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {(
                    stats?.activityByType
                      ?.filter((a) =>
                        [
                          "user_approved",
                          "user_rejected",
                          "role_updated",
                          "settings_updated",
                        ].includes(a._id)
                      )
                      .reduce((sum, a) => sum + a.count, 0) || 0
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No audit logs found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => {
                    const ActionIcon = getActionIcon(log.action);
                    return (
                      <motion.tr
                        key={log._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${getActionColor(
                                log.action
                              )}`}
                            >
                              <ActionIcon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatActionName(log.action)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {log.performedBy?.firstName}{" "}
                                {log.performedBy?.lastName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {log.performedBy?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                            {log.metadata?.description ||
                              log.description ||
                              "-"}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Globe className="w-4 h-4" />
                            {log.ipAddress || "Unknown"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            {log.timestamp
                              ? format(
                                  new Date(log.timestamp),
                                  "MMM d, yyyy HH:mm"
                                )
                              : "-"}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(pagination.current - 1) * 20 + 1} to{" "}
                {Math.min(pagination.current * 20, pagination.totalCount)} of{" "}
                {pagination.totalCount} logs
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      current: prev.current - 1,
                    }))
                  }
                  disabled={pagination.current === 1}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {pagination.current} of {pagination.total}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      current: prev.current + 1,
                    }))
                  }
                  disabled={pagination.current === pagination.total}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;
