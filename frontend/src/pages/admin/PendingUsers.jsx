import { useState, useEffect } from "react";
import { adminAPI } from "../../api/admin";
import {
  CheckCircle,
  XCircle,
  Mail,
  GraduationCap,
  Briefcase,
  Users,
  Award,
} from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Avatar from "../../components/common/Avatar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import RejectionReasonModal from "../../components/admin/RejectionReasonModal";
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

const PendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState("all");
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [userToReject, setUserToReject] = useState(null);
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
    fetchPendingUsers();
  }, [page]);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingUsers(page, limit);
      setUsers(response.data || []);
      updatePagination({
        totalPages: response.pagination?.total || 1,
        currentPage: response.pagination?.current || page,
        totalItems: response.pagination?.totalCount || 0,
      });
    } catch (error) {
      console.error("Error fetching pending users:", error);
      toast.error("Failed to load pending users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setActionLoading(true);
      await adminAPI.approveUser(userId);
      toast.success("User approved successfully");
      fetchPendingUsers();
      setDetailsModalOpen(false);
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Failed to approve user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (userId) => {
    setUserToReject(userId);
    setRejectionModalOpen(true);
  };

  const handleRejectConfirm = async (reason) => {
    try {
      setActionLoading(true);
      await adminAPI.rejectUser(userToReject, reason);
      toast.success("User rejected successfully");
      fetchPendingUsers();
      setDetailsModalOpen(false);
      setRejectionModalOpen(false);
      setUserToReject(null);
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error("Failed to reject user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users to approve");
      return;
    }

    try {
      setActionLoading(true);
      await adminAPI.bulkApproveUsers(selectedUsers);
      toast.success(`${selectedUsers.length} users approved successfully`);
      setSelectedUsers([]);
      fetchPendingUsers();
    } catch (error) {
      console.error("Error bulk approving users:", error);
      toast.error("Failed to approve users");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
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
        <LoadingSpinner size="lg" text="Loading pending users..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pending Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and approve new user registrations
          </p>
        </div>
        {selectedUsers.length > 0 && (
          <Button
            variant="primary"
            onClick={handleBulkApprove}
            loading={actionLoading}
          >
            Approve {selectedUsers.length} Selected
          </Button>
        )}
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
          <p className="text-gray-600 dark:text-gray-400">
            No pending users in this category
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
                    {roleUsers.length} pending approval
                  </p>
                </div>
              </div>

              {/* User Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roleUsers.map((user) => (
                  <Card
                    key={user._id}
                    className="p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="space-y-4">
                      {/* User Info */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
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
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => toggleUserSelection(user._id)}
                          className="w-4 h-4 rounded"
                        />
                      </div>

                      {/* User Details */}
                      <div className="space-y-2 text-sm">
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
                        {user.yearOfStudy && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Year:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {user.yearOfStudy}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Applied:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {format(new Date(user.createdAt), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          size="sm"
                          variant="primary"
                          icon={CheckCircle}
                          onClick={() => handleApprove(user._id)}
                          loading={actionLoading}
                          className="flex-1"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon={XCircle}
                          onClick={() => handleRejectClick(user._id)}
                          loading={actionLoading}
                          className="flex-1"
                        >
                          Reject
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

      {/* Rejection Reason Modal */}
      <RejectionReasonModal
        isOpen={rejectionModalOpen}
        onClose={() => {
          setRejectionModalOpen(false);
          setUserToReject(null);
        }}
        onConfirm={handleRejectConfirm}
        loading={actionLoading}
      />
    </div>
  );
};

export default PendingUsers;
