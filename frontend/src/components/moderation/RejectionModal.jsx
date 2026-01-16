import { useState, useEffect } from "react";
import { X, AlertCircle, MessageSquare, CheckCircle } from "lucide-react";
import Button from "../common/Button";

const RejectionModal = ({ isOpen, onClose, onConfirm, postTitle }) => {
  const [reason, setReason] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const CONFIRM_WORD = "REJECT";

  // Common rejection templates
  const rejectionTemplates = [
    {
      id: "quality",
      label: "Content Quality",
      reason:
        "The content needs improvement in terms of clarity, structure, or depth. Please revise and resubmit.",
    },
    {
      id: "grammar",
      label: "Grammar & Spelling",
      reason:
        "The post contains multiple grammar and spelling errors. Please proofread and correct before resubmitting.",
    },
    {
      id: "inappropriate",
      label: "Inappropriate Content",
      reason:
        "The content contains inappropriate material that does not align with university guidelines.",
    },
    {
      id: "plagiarism",
      label: "Plagiarism Concern",
      reason:
        "The content appears to contain plagiarized material. Please ensure all content is original or properly cited.",
    },
    {
      id: "incomplete",
      label: "Incomplete",
      reason:
        "The post appears incomplete or lacks sufficient detail. Please expand on your ideas.",
    },
    {
      id: "offtopic",
      label: "Off-Topic",
      reason:
        "The content does not align with the selected category or platform guidelines.",
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.id);
    setReason(template.reason);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reason.trim() && confirmText === CONFIRM_WORD) {
      onConfirm(reason);
      handleClose();
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setReason("");
      setSelectedTemplate("");
      setConfirmText("");
      onClose();
    }, 200);
  };

  const isConfirmValid = reason.trim() && confirmText === CONFIRM_WORD;

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all duration-300 flex flex-col ${
          isAnimating ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Reject Post
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Provide feedback to help the author improve
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 p-6">
            {/* Post Title */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Post Title:
              </p>
              <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                {postTitle}
              </p>
            </div>

            {/* Quick Templates */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Quick Templates (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {rejectionTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-3 text-left text-sm rounded-lg border-2 transition-all ${
                      selectedTemplate === template.id
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Input */}
            <div className="mb-6">
              <label
                htmlFor="rejection-reason"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  id="rejection-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide detailed feedback to help the author improve their post..."
                  rows={6}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Be constructive and specific. This feedback will be visible to
                the author.
              </p>
            </div>

            {/* Guidelines */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                💡 Rejection Guidelines
              </p>
              <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                <li>• Be specific about what needs improvement</li>
                <li>• Provide actionable feedback</li>
                <li>• Maintain a professional and respectful tone</li>
                <li>• Reference specific sections if possible</li>
              </ul>
            </div>

            {/* Confirmation Input */}
            <div className="mb-6">
              <label
                htmlFor="confirm-reject"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Type{" "}
                <span className="font-bold text-red-600 dark:text-red-400">
                  {CONFIRM_WORD}
                </span>{" "}
                to confirm rejection <span className="text-red-500">*</span>
              </label>
              <input
                id="confirm-reject"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder={`Type ${CONFIRM_WORD} here`}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                  confirmText && confirmText !== CONFIRM_WORD
                    ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-red-500"
                }`}
                autoComplete="off"
              />
              {confirmText && confirmText !== CONFIRM_WORD && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Please type "{CONFIRM_WORD}" exactly to confirm
                </p>
              )}
              {confirmText && confirmText === CONFIRM_WORD && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Confirmation verified! You can now reject the post.
                </p>
              )}
              {!confirmText && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  ⚠️ This action requires confirmation. Type {CONFIRM_WORD} to
                  enable the reject button.
                </p>
              )}
            </div>
          </div>

          {/* Actions - Fixed at bottom */}
          <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                disabled={!isConfirmValid}
                icon={AlertCircle}
                className={
                  !isConfirmValid ? "opacity-50 cursor-not-allowed" : ""
                }
              >
                {!isConfirmValid ? "Complete Form to Reject" : "Reject Post"}
              </Button>
            </div>

            {/* Status Indicator */}
            {!isConfirmValid && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {!reason.trim() &&
                    !confirmText &&
                    "Please provide a rejection reason and type REJECT to confirm"}
                  {!reason.trim() &&
                    confirmText &&
                    "Please provide a rejection reason"}
                  {reason.trim() &&
                    !confirmText &&
                    "Please type REJECT in the confirmation field"}
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectionModal;
