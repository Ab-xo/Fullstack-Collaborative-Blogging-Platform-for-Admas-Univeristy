/**
 * Roles & Permissions - With User Role Assignment
 */

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Users,
  Crown,
  Edit3,
  Eye,
  Check,
  X,
  ChevronDown,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  Lock,
  Info,
  Search,
  UserCog,
  RefreshCw,
  KeyRound,
  UserCheck,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { adminAPI } from "../../api/admin";
import Avatar from "../../components/common/Avatar";
import toast from "react-hot-toast";

// Permission categories
const permissionCategories = [
  {
    id: "content",
    name: "Content",
    icon: FileText,
    permissions: [
      { id: "content.create", name: "Create Posts" },
      { id: "content.edit", name: "Edit Own Posts" },
      { id: "content.delete", name: "Delete Own Posts" },
      { id: "content.delete.all", name: "Delete Any Posts" },
      { id: "content.publish", name: "Publish Posts" },
      { id: "content.moderate", name: "Moderate Content" },
    ],
  },
  {
    id: "users",
    name: "Users",
    icon: Users,
    permissions: [
      { id: "users.view", name: "View Users" },
      { id: "users.create", name: "Create Users" },
      { id: "users.edit", name: "Edit Users" },
      { id: "users.delete", name: "Delete Users" },
      { id: "users.roles", name: "Manage Roles" },
    ],
  },
  {
    id: "comments",
    name: "Comments",
    icon: MessageSquare,
    permissions: [
      { id: "comments.create", name: "Create Comments" },
      { id: "comments.edit", name: "Edit Comments" },
      { id: "comments.delete", name: "Delete Comments" },
      { id: "comments.moderate", name: "Moderate Comments" },
    ],
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: BarChart3,
    permissions: [
      { id: "analytics.view", name: "View Analytics" },
      { id: "analytics.export", name: "Export Data" },
    ],
  },
  {
    id: "system",
    name: "System",
    icon: Settings,
    permissions: [
      { id: "system.settings", name: "Manage Settings" },
      { id: "system.logs", name: "View Logs" },
    ],
  },
];

// Role definitions
const roleDefinitions = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full system access with all permissions",
    color: "#EF4444",
    icon: Crown,
    permissions: permissionCategories.flatMap((c) =>
      c.permissions.map((p) => p.id)
    ),
  },
  {
    id: "moderator",
    name: "Moderator",
    description: "Content moderation and user management",
    color: "#8B5CF6",
    icon: ShieldCheck,
    permissions: [
      "content.edit",
      "content.delete",
      "content.delete.all",
      "content.moderate",
      "users.view",
      "comments.edit",
      "comments.delete",
      "comments.moderate",
      "analytics.view",
    ],
  },
  {
    id: "author",
    name: "Author",
    description: "Create and manage own content",
    color: "#3B82F6",
    icon: Edit3,
    permissions: [
      "content.create",
      "content.edit",
      "content.delete",
      "comments.create",
      "comments.edit",
      "analytics.view",
    ],
  },
  {
    id: "reader",
    name: "Reader",
    description: "View content and comment",
    color: "#10B981",
    icon: Eye,
    permissions: ["comments.create"],
  },
];

const RolesPermissions = () => {
  const [activeTab, setActiveTab] = useState("roles");
  const [selectedRole, setSelectedRole] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(
    permissionCategories.map((c) => c.id)
  );

  // User assignment state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingUser, setUpdatingUser] = useState(null);

  useEffect(() => {
    if (activeTab === "assign") {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await adminAPI.getAllUsers(1, 50);
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingUser(userId);
      await adminAPI.updateUserRoles(userId, [newRole]);
      toast.success("Role updated successfully");
      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    } finally {
      setUpdatingUser(null);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleColor = (role) => {
    const def = roleDefinitions.find((r) => r.id === role);
    return def?.color || "#6B7280";
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Roles & Permissions
              </h1>
              <p className="text-sm text-gray-500">
                Manage roles and assign them to users
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "roles"
                ? "border-violet-600 text-violet-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              Role Permissions
            </div>
          </button>
          <button
            onClick={() => setActiveTab("assign")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "assign"
                ? "border-violet-600 text-violet-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Assign Roles to Users
            </div>
          </button>
        </div>

        {activeTab === "roles" ? (
          // ROLES TAB
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Roles List */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    System Roles
                  </h2>
                </div>
                <div className="p-3 space-y-2">
                  {roleDefinitions.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole?.id === role.id;

                    return (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role)}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-500"
                            : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${role.color}20` }}
                          >
                            <Icon
                              className="w-4 h-4"
                              style={{ color: role.color }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white text-sm">
                                {role.name}
                              </span>
                              <Lock className="w-3 h-3 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {role.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Permissions Panel */}
            <div className="lg:col-span-2">
              {selectedRole ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div
                    className="p-4 border-b border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: `${selectedRole.color}10` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${selectedRole.color}20` }}
                      >
                        {(() => {
                          const Icon = selectedRole.icon;
                          return (
                            <Icon
                              className="w-5 h-5"
                              style={{ color: selectedRole.color }}
                            />
                          );
                        })()}
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">
                          {selectedRole.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {selectedRole.permissions.length} permissions
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                    {permissionCategories.map((category) => {
                      const CategoryIcon = category.icon;
                      const isExpanded = expandedCategories.includes(
                        category.id
                      );
                      const enabledCount = category.permissions.filter((p) =>
                        selectedRole.permissions.includes(p.id)
                      ).length;

                      return (
                        <div
                          key={category.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <div className="flex items-center gap-2">
                              <CategoryIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-white text-sm">
                                {category.name}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                                {enabledCount}/{category.permissions.length}
                              </span>
                            </div>
                            <ChevronDown
                              className={`w-4 h-4 text-gray-400 transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {isExpanded && (
                            <div className="p-3 space-y-2 bg-white dark:bg-gray-800">
                              {category.permissions.map((permission) => {
                                const isEnabled =
                                  selectedRole.permissions.includes(
                                    permission.id
                                  );

                                return (
                                  <div
                                    key={permission.id}
                                    className={`flex items-center justify-between p-2 rounded-lg ${
                                      isEnabled
                                        ? "bg-green-50 dark:bg-green-900/20"
                                        : "bg-gray-50 dark:bg-gray-700"
                                    }`}
                                  >
                                    <span
                                      className={`text-sm ${
                                        isEnabled
                                          ? "text-green-700 dark:text-green-400"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {permission.name}
                                    </span>
                                    <div
                                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                        isEnabled
                                          ? "bg-green-500 text-white"
                                          : "bg-gray-300 dark:bg-gray-600"
                                      }`}
                                    >
                                      {isEnabled ? (
                                        <Check className="w-3 h-3" />
                                      ) : (
                                        <X className="w-3 h-3 text-gray-500" />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <KeyRound className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    Select a Role
                  </h3>
                  <p className="text-sm text-gray-500">
                    Choose a role to view its permissions
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // ASSIGN ROLES TAB
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Search & Refresh */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Users Table */}
            {loadingUsers ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-2" />
                <p className="text-gray-500">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Current Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Change Role
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={user.profile?.avatar}
                              alt={user.fullName}
                              fallback={user.fullName || user.email}
                              size="sm"
                            />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {user.fullName ||
                                  `${user.firstName} ${user.lastName}`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${getRoleColor(user.role)}20`,
                              color: getRoleColor(user.role),
                            }}
                          >
                            {user.role || "reader"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={user.role || "reader"}
                            onChange={(e) =>
                              handleRoleChange(user._id, e.target.value)
                            }
                            disabled={updatingUser === user._id}
                            className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                          >
                            <option value="reader">Reader</option>
                            <option value="author">Author</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Administrator</option>
                          </select>
                          {updatingUser === user._id && (
                            <RefreshCw className="inline-block w-4 h-4 ml-2 animate-spin text-indigo-500" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Info */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Role Assignment
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Select a new role from the dropdown to change a user's
                    permissions. Changes take effect immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RolesPermissions;
