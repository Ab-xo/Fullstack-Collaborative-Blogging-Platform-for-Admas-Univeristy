import { useState } from "react";
import { AlertCircle } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Card from "../common/Card";
import toast from "react-hot-toast";

const REJECTION_REASONS = [
  {
    id: "invalid_id",
    title: "Invalid University ID",
    description: "University ID doesn't match records or is incorrect format",
  },
  {
    id: "incomplete_info",
    title: "Incomplete Information",
    description: "Missing required fields or invalid information provided",
  },
  {
    id: "role_mismatch",
    title: "Role Mismatch",
    description: "Role doesn't match provided credentials or documentation",
  },
  {
    id: "duplicate_account",
    title: "Duplicate Account",
    description: "User already has an active account or duplicate registration",
  },
  {
    id: "suspicious_activity",
    title: "Suspicious Activity",
    description: "Suspicious behavior or potential bot/spam account",
  },
  {
    id: "policy_violation",
    title: "Policy Violation",
    description: "Violates community guidelines or terms of service",
  },
  {
    id: "verification_failed",
    title: "Verification Failed",
    description: "Email verification failed or invalid verification token",
  },
  {
    id: "missing_docs",
    title: "Missing Documentation",
    description:
      "Required documentation (certificate, credentials) not provided",
  },
  {
    id: "other",
    title: "Other Reason",
    description: "Provide custom rejection reason",
  },
];

const RejectionReasonModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [selectedReason, setSelectedReason] = useState(null);
  const [customReason, setCustomReason] = useState("");

  const handleConfirm = () => {
    if (!selectedReason) {
      toast.error("Please select a rejection reason");
      return;
    }

    if (selectedReason === "other" && !customReason.trim()) {
      toast.error("Please provide a custom reason");
      return;
    }

    const reason =
      selectedReason === "other"
        ? customReason
        : REJECTION_REASONS.find((r) => r.id === selectedReason)?.title;

    onConfirm(reason);
    setSelectedReason(null);
    setCustomReason("");
  };

  const handleClose = () => {
    setSelectedReason(null);
    setCustomReason("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reject User Application"
    >
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">
            Select a reason for rejecting this user application. They will
            receive an email notification.
          </p>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {REJECTION_REASONS.map((reason) => (
            <Card
              key={reason.id}
              className={`p-3 cursor-pointer transition-all ${
                selectedReason === reason.id
                  ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
              onClick={() => setSelectedReason(reason.id)}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="rejection_reason"
                  value={reason.id}
                  checked={selectedReason === reason.id}
                  onChange={() => setSelectedReason(reason.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {reason.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {reason.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {selectedReason === "other" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Rejection Reason
            </label>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Explain why you're rejecting this application..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            loading={loading}
            className="flex-1"
          >
            Reject User
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RejectionReasonModal;
