/**
 * ============================================================================
 * ALL USERS PAGE (Admin) - With Slide Panel
 * ============================================================================
 * User management with slide-in panel for user details
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { adminAPI } from "../../api/admin";
import {
  Search,
  UserCheck,
  UserX,
  Shield,
  X,
  RefreshCw,
  Mail,
  Calendar,
  Building,
  GraduationCap,
  ChevronRight,
  User,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import RoleManagementModal from "../../components/admin/RoleManagementModal";
import Avatar from "../../components/common/Avatar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import toast from "react-hot-toast";
import { format } from "date-fns";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 15;

  useEffect(() => {
    fetchUsers();
  }, [page, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (searchQuery) filters.search = searchQuery;

      const response = await adminAPI.getAllUsers(page, limit, filters);
      setUsers(response.data || []);
      setTotalPages(response.pagination?.total || 1);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setTimeout(() => setSelectedUser(null), 300);
  };

  const handleSuspend = async (userId) => {
    if (!window.confirm("Are you sure you want to suspend this user?")) return;
    try {
      await adminAPI.suspendUser(userId);
      toast.success("User suspended");
      fetchUsers();
      if (selectedUser?._id === userId) {
        setSelectedUser({ ...selectedUser, status: "suspended" });
      }
    } catch (error) {
      toast.error("Failed to suspend user");
    }
  };

  const handleActivate = async (userId) => {
    try {
      await adminAPI.activateUser(userId);
      toast.success("User activated");
      fetchUsers();
      if (selectedUser?._id === userId) {
        setSelectedUser({ ...selectedUser, status: "active", isActive: true });
      }
    } catch (error) {
      toast.error("Failed to activate user");
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      active: {
        color: "bg-green-100 text-green-700",
        icon: CheckCircle,
        label: "Active",
      },
      approved: {
        color: "bg-green-100 text-green-700",
        icon: CheckCircle,
        label: "Active",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-700",
        icon: Clock,
        label: "Pending",
      },
      suspended: {
        color: "bg-red-100 text-red-700",
        icon: XCircle,
        label: "Suspended",
      },
      rejected: {
        color: "bg-gray-100 text-gray-700",
        icon: AlertCircle,
        label: "Rejected",
      },
    };
    return configs[status] || configs.pending;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-purple-100 text-purple-700",
      moderator: "bg-blue-100 text-blue-700",
      author: "bg-green-100 text-green-700",
      reader: "bg-gray-100 text-gray-700",
    };
    return colors[role] || colors.reader;
  };

  const tabs = [
    { id: "all", label: "All Users" },
    { id: "active", label: "Active" },
    { id: "pending", label: "Pending" },
    { id: "suspended", label: "Suspended" },
  ];

  return (
    <DashboardLayout userRole="admin">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 -m-6 p-6 relative">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  User Management
                </h1>
                <p className="text-sm text-gray-500">
                  {users.length} users found
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-500"
              />
            </form>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Users className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-lg font-medium">No users found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {users.map((user) => {
                  const statusConfig = getStatusConfig(user.status);
                  const isSelected = selectedUser?._id === user._id;

                  return (
                    <tr
                      key={user._id}
                      onClick={() => handleViewUser(user)}
                      className={`cursor-pointer transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                        isSelected ? "bg-blue-50 dark:bg-blue-900/30" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.profile?.avatar}
                            alt={user.fullName}
                            fallback={user.fullName || user.email}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.fullName ||
                                user.firstName + " " + user.lastName}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-[200px]">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {user.role || user.roleApplication || "reader"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-all"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Slide-in Side Panel */}
        <AnimatePresence>
          {panelOpen && selectedUser && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closePanel}
                className="fixed inset-0 bg-black/30 z-40"
              />

              {/* Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col"
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={selectedUser.profile?.avatar}
                      alt={selectedUser.fullName}
                      fallback={selectedUser.fullName || selectedUser.email}
                      size="lg"
                      className="border-2 border-white/30"
                    />
                    <div>
                      <h3 className="font-semibold text-white text-lg">
                        {selectedUser.fullName ||
                          selectedUser.firstName + " " + selectedUser.lastName}
                      </h3>
                      <p className="text-blue-100 text-sm">
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closePanel}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Status & Role */}
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        getStatusConfig(selectedUser.status).color
                      }`}
                    >
                      {getStatusConfig(selectedUser.status).label}
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getRoleColor(
                        selectedUser.role
                      )}`}
                    >
                      {selectedUser.role || "reader"}
                    </span>
                  </div>

                  {/* User Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedUser.email}
                        </p>
                      </div>
                    </div>

                    {selectedUser.department && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <Building className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Department</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedUser.department}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedUser.roleApplication && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <GraduationCap className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Affiliation</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {selectedUser.roleApplication}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Joined</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {format(
                            new Date(selectedUser.createdAt),
                            "MMMM d, yyyy"
                          )}
                        </p>
                      </div>
                    </div>

                    {selectedUser.universityId && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">University ID</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedUser.universityId}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setShowRoleModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                    >
                      <Shield className="w-4 h-4" />
                      Manage Roles
                    </button>

                    {selectedUser.status === "suspended" ? (
                      <button
                        onClick={() => handleActivate(selectedUser._id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all font-medium"
                      >
                        <UserCheck className="w-4 h-4" />
                        Activate User
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSuspend(selectedUser._id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-medium"
                      >
                        <UserX className="w-4 h-4" />
                        Suspend User
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Role Management Modal */}
        {showRoleModal && selectedUser && (
          <RoleManagementModal
            user={selectedUser}
            onClose={() => setShowRoleModal(false)}
            onUpdate={() => {
              fetchUsers();
              setShowRoleModal(false);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AllUsers;
