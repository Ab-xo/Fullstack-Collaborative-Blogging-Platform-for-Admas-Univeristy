import { useState, useEffect } from "react";
import { adminAPI } from "../../api/admin";
import {
  RotateCcw,
  Trash2,
  GraduationCap,
  Briefcase,
  Users,
  Award,
  AlertCircle,
} from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Avatar from "../../components/common/Avatar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import DeleteConfirmationModal from "../../components/admin/DeleteConfirmationModal";
import { usePagination } from "../../hooks/usePagination";
import toast from "react-hot-toast";
import { format } from "date-fns";

const roleIcons = {
  student: GraduationCap,
  faculty: Briefcase,
  alumni: Award,
  staff: Users,
};

const roleColors = {
  student: "blue",
  faculty: "purple",
  alumni: "green",
  staff: "orange",
};

const RejectedUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("all");
  const [reapproveModalOpen, setReapproveModalOpen] = useState(false);
  const [userToReapprove, setUserToReapprove] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const {
    page,
    limit,
    totalPages,
    updatePagination,
    nextPage,
    previousPage,
    hasPrevious,
    hasMore,
  } = usePagination();

  useEffect(() => {
    fetchRejectedUsers();
  }, [page]);

  const fetchRejectedUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers(page, limit, {
        status: "rejected",
      });
      setUsers(response.data || []);
      updatePagination({
        totalPages: response.pagination?.total || 1,
        currentPage: response.pagination?.current || page,
        totalItems: response.pagination?.totalCount || 0,
      });
    } catch (error) {
      console.error("Error fetching rejected users:", error);
      toast.error("Failed to load rejected users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReapproveClick = (userId) => {
    setUserToReapprove(userId);
    setReapproveModalOpen(true);
  };

  const handleReapproveConfirm = async () => {
    try {
      setActionLoading(true);
      await adminAPI.approveUser(userToReapprove, {
        reviewNotes: "Reapproved after review",
      });
      toast.success("User reapproved successfully");
      fetchRejectedUsers();
      setReapproveModalOpen(false);
      setUserToReapprove(null);
    } catch (error) {
      console.error("Error reapproving user:", error);
      toast.error("Failed to reapprove user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setActionLoading(true);
      await adminAPI.deleteUser(userToDelete);

      // Beautiful toast notification
      toast.success(
        (t) => (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="font-semibold text-white">
                User Deleted Permanently
              </p>
              <p className="text-sm text-gray-200 mt-1">
                The user account has been completely removed from the system
              </p>
            </div>
          </div>
        ),
        {
          duration: 4000,
          style: {
            background: "#ef4444",
            color: "#fff",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          },
        }
      );

      fetchRejectedUsers();
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  // Group users by role
  const groupedUsers = users.reduce((acc, user) => {
    const role = user.roleApplication || "other";
    if (!acc[role]) acc[role] = [];
    acc[role].push(user);
    return acc;
  }, {});

  const filteredGroups =
    selectedRole === "all"
      ? groupedUsers
      : { [selectedRole]: groupedUsers[selectedRole] || [] };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading rejected users..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Rejected Users
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Review and manage rejected user applications
        </p>
      </div>

      {/* Role Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedRole === "all" ? "primary" : "secondary"}
          onClick={() => setSelectedRole("all")}
          size="sm"
        >
          All Roles
        </Button>
        {Object.entries(roleIcons).map(([role, Icon]) => (
          <Button
            key={role}
            variant={selectedRole === role ? "primary" : "secondary"}
            onClick={() => setSelectedRole(role)}
            size="sm"
            icon={Icon}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Button>
        ))}
      </div>

      {/* Role-based Groups */}
      {Object.entries(filteredGroups).length === 0 ? (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No rejected users in this category
          </p>
        </Card>
      ) : (
        Object.entries(filteredGroups).map(([role, roleUsers]) => {
          if (roleUsers.length === 0) return null;

          const RoleIcon = roleIcons[role];
          const roleColor = roleColors[role];

          return (
            <div key={role} className="space-y-4">
              {/* Role Header */}
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 bg-${roleColor}-100 dark:bg-${roleColor}-900/30 rounded-lg`}
                >
                  <RoleIcon
                    className={`w-6 h-6 text-${roleColor}-600 dark:text-${roleColor}-400`}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {role.charAt(0).toUpperCase() + role.slice(1)}s
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {roleUsers.length} rejected applications
                  </p>
                </div>
              </div>

              {/* User Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roleUsers.map((user) => (
                  <Card
                    key={user._id}
                    className="p-4 hover:shadow-lg transition-shadow border-l-4 border-red-500"
                  >
                    <div className="space-y-4">
                      {/* User Info */}
                      <div className="flex items-start gap-3">
                        <Avatar
                          src={user.profile?.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                          <Badge variant="danger" className="mt-1">
                            Rejected
                          </Badge>
                        </div>
                      </div>

                      {/* User Details */}
                      <div className="space-y-2 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            University ID:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {user.universityId}
                          </span>
                        </div>
                        {user.department && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Department:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {user.department}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Rejected:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {format(new Date(user.reviewedAt), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </div>

                      {/* Rejection Reason */}
                      {user.reviewNotes && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                          <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
                            Rejection Reason:
                          </p>
                          <p className="text-sm text-red-600 dark:text-red-300">
                            {user.reviewNotes}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          size="sm"
                          variant="primary"
                          icon={RotateCcw}
                          onClick={() => handleReapproveClick(user._id)}
                          loading={actionLoading}
                          className="flex-1"
                        >
                          Reapprove
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon={Trash2}
                          onClick={() => handleDeleteClick(user._id)}
                          loading={actionLoading}
                          className="flex-1"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
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
          <Button variant="secondary" onClick={nextPage} disabled={!hasMore}>
            Next
          </Button>
        </div>
      )}

      {/* Reapprove Confirmation Modal */}
      <Modal
        isOpen={reapproveModalOpen}
        onClose={() => {
          setReapproveModalOpen(false);
          setUserToReapprove(null);
        }}
        title="Reapprove User"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Are you sure you want to reapprove this user? They will be able to
              login and access the platform.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={() => {
                setReapproveModalOpen(false);
                setUserToReapprove(null);
              }}
              disabled={actionLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleReapproveConfirm}
              loading={actionLoading}
              className="flex-1"
            >
              Reapprove User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={actionLoading}
        userName={
          users.find((u) => u._id === userToDelete)
            ? `${users.find((u) => u._id === userToDelete).firstName} ${
                users.find((u) => u._id === userToDelete).lastName
              }`
            : "this user"
        }
      />
    </div>
  );
};

export default RejectedUsers;
