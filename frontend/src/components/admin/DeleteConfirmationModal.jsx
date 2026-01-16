import { AlertTriangle } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  userName,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete User Permanently">
      <div className="space-y-4">
        {/* Warning Icon and Message */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900 dark:text-red-200 mb-1">
              This action cannot be undone
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              You are about to permanently delete the user account for{" "}
              <span className="font-medium">{userName}</span>. This will remove
              all associated data from the system.
            </p>
          </div>
        </div>

        {/* Confirmation Text */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            This user will be:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <span className="text-red-500">•</span> Permanently removed from
              the database
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-500">•</span> Unable to access the
              platform
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-500">•</span> All their data will be
              deleted
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            className="flex-1"
          >
            Delete Permanently
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
