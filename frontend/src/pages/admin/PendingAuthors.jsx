import React, { useState, useEffect } from "react";
import {
  Check,
  X,
  User,
  Shield,
  RefreshCw,
  Mail,
  Calendar,
  Building,
  IdCard,
} from "lucide-react";
import { toast } from "react-hot-toast";
import adminService from "../../services/adminService";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

const PendingAuthors = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchPendingAuthors = async () => {
    setLoading(true);
    try {
      const response = await adminService.getPendingAuthors();
      console.log("Pending authors response:", response);
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch pending applications");
      console.error("Error fetching pending authors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAuthors();
  }, []);

  const handleApprove = async (user) => {
    if (
      !window.confirm(
        `Are you sure you want to approve ${user.firstName} as an Author?`
      )
    )
      return;

    setProcessing(user._id);
    try {
      await adminService.approveAuthor(user._id);
      toast.success(`${user.firstName} is now an Author!`);
      setUsers(users.filter((u) => u._id !== user._id));
    } catch (error) {
      toast.error("Failed to approve user");
      console.error("Error approving author:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (user) => {
    const reason = window.prompt(
      `Enter rejection reason for ${user.firstName}:`,
      "Your application did not meet our requirements at this time."
    );
    if (reason === null) return;

    setProcessing(user._id);
    try {
      await adminService.rejectAuthor(user._id, reason);
      toast.success("Application rejected. User remains a Reader.");
      setUsers(users.filter((u) => u._id !== user._id));
    } catch (error) {
      toast.error("Failed to reject application");
      console.error("Error rejecting author:", error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Author Requests
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Review applications from users who want to become Authors.
            </p>
          </div>
          <button
            onClick={fetchPendingAuthors}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <Shield className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              No Pending Requests
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              All caught up! No one is waiting to be an author.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                      {user.firstName?.[0] || "?"}
                      {user.lastName?.[0] || "?"}
                    </div>
                    <div className="text-white">
                      <h3 className="font-semibold text-lg">
                        {user.firstName || "Unknown"} {user.lastName || "User"}
                      </h3>
                      <span className="text-xs bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full font-medium">
                        Pending Approval
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {user.email}
                    </span>
                  </div>

                  {user.roleApplication && (
                    <div className="flex items-center gap-3 text-sm">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300 capitalize">
                        {user.roleApplication}
                      </span>
                    </div>
                  )}

                  {user.universityId && (
                    <div className="flex items-center gap-3 text-sm">
                      <IdCard className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {user.universityId}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Applied:{" "}
                      {user.authorApplicationDate
                        ? new Date(
                            user.authorApplicationDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleReject(user)}
                      disabled={processing === user._id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(user)}
                      disabled={processing === user._id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition-colors disabled:opacity-50"
                    >
                      <Check className="w-5 h-5" />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Debug Info */}
        {!loading && users.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
            Found {users.length} pending author request(s)
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PendingAuthors;
