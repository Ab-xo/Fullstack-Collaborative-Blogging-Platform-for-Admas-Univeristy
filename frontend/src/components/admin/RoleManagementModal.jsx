import { useState } from "react";
import { X, Shield, User, Eye, FileText } from "lucide-react";
import Button from "../common/Button";
import toast from "react-hot-toast";
import { adminAPI } from "../../api/admin";

const AVAILABLE_ROLES = [
  {
    value: "reader",
    label: "Reader",
    description: "Can view and interact with published content",
    icon: Eye,
    color: "text-gray-600",
  },
  {
    value: "author",
    label: "Author",
    description: "Can create and manage own blog posts",
    icon: FileText,
    color: "text-blue-600",
  },
  {
    value: "moderator",
    label: "Moderator",
    description: "Can review and moderate all content",
    icon: Shield,
    color: "text-purple-600",
  },
  {
    value: "admin",
    label: "Administrator",
    description: "Full system access and user management",
    icon: User,
    color: "text-red-600",
  },
];

const RoleManagementModal = ({ user, onClose, onUpdate }) => {
  const [selectedRoles, setSelectedRoles] = useState(user.roles || ["reader"]);
  const [loading, setLoading] = useState(false);

  const toggleRole = (role) => {
    if (selectedRoles.includes(role)) {
      // Don't allow removing all roles
      if (selectedRoles.length === 1) {
        toast.error("User must have at least one role");
        return;
      }
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await adminAPI.updateUserRoles(user._id, selectedRoles);
      toast.success("User roles updated successfully");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating roles:", error);
      toast.error(error.response?.data?.message || "Failed to update roles");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Manage User Roles
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {user.fullName} ({user.email})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select one or more roles for this user. Each role grants specific
            permissions.
          </p>

          <div className="space-y-3">
            {AVAILABLE_ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRoles.includes(role.value);

              return (
                <button
                  key={role.value}
                  onClick={() => toggleRole(role.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? "bg-blue-100 dark:bg-blue-900/40"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isSelected
                            ? "text-blue-600 dark:text-blue-400"
                            : role.color
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {role.label}
                        </h3>
                        {isSelected && (
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {role.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Current Selection Summary */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selected Roles ({selectedRoles.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedRoles.map((role) => {
                const roleInfo = AVAILABLE_ROLES.find((r) => r.value === role);
                return (
                  <span
                    key={role}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full"
                  >
                    {roleInfo?.label || role}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={loading}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleManagementModal;
