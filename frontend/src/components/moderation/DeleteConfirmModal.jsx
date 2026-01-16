import { useState, useEffect } from "react";
import { X, AlertTriangle, Trash2, Info } from "lucide-react";
import Button from "../common/Button";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, post }) => {
  const [confirmText, setConfirmText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [understand, setUnderstand] = useState(false);

  const CONFIRM_WORD = "DELETE";

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (confirmText === CONFIRM_WORD && understand) {
      onConfirm();
      handleClose();
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setConfirmText("");
      setUnderstand(false);
      onClose();
    }, 200);
  };

  if (!isOpen || !post) return null;

  const isConfirmValid = confirmText === CONFIRM_WORD && understand;

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
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Delete Post Permanently
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                This action cannot be undone
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
            {/* Post Details */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                {post.featuredImage && (
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Post Title:
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">
                    {post.title}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>👁️ {post.views || 0} views</span>
                    <span>❤️ {post.likesCount || 0} likes</span>
                    <span>💬 {post.commentsCount || 0} comments</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
                    ⚠️ Warning: Permanent Deletion
                  </p>
                  <ul className="text-sm text-red-800 dark:text-red-400 space-y-1">
                    <li>
                      • This post will be permanently deleted from the database
                    </li>
                    <li>
                      • All associated comments ({post.commentsCount || 0}) will
                      be removed
                    </li>
                    <li>• All likes ({post.likesCount || 0}) will be lost</li>
                    <li>
                      • The author will not be able to recover this content
                    </li>
                    <li>• This action cannot be undone or reversed</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Impact Summary */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                    Deletion Impact
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-blue-600 dark:text-blue-400 font-semibold">
                        {post.commentsCount || 0}
                      </p>
                      <p className="text-blue-800 dark:text-blue-400">
                        Comments Lost
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-600 dark:text-blue-400 font-semibold">
                        {post.likesCount || 0}
                      </p>
                      <p className="text-blue-800 dark:text-blue-400">
                        Likes Lost
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-600 dark:text-blue-400 font-semibold">
                        {post.views || 0}
                      </p>
                      <p className="text-blue-800 dark:text-blue-400">
                        Views Lost
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={understand}
                  onChange={(e) => setUnderstand(e.target.checked)}
                  className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  I understand that this action is permanent and cannot be
                  undone. All associated data will be permanently deleted.
                </span>
              </label>
            </div>

            {/* Confirmation Input */}
            <div className="mb-6">
              <label
                htmlFor="confirm-delete"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Type{" "}
                <span className="font-bold text-red-600 dark:text-red-400">
                  {CONFIRM_WORD}
                </span>{" "}
                to confirm deletion
              </label>
              <input
                id="confirm-delete"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder={`Type ${CONFIRM_WORD} here`}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                  confirmText && confirmText !== CONFIRM_WORD
                    ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-red-500"
                }`}
                autoComplete="off"
              />
              {confirmText && confirmText !== CONFIRM_WORD && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  Please type "{CONFIRM_WORD}" exactly to confirm
                </p>
              )}
            </div>

            {/* Alternative Actions */}
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-300 mb-2">
                💡 Consider These Alternatives
              </p>
              <ul className="text-sm text-yellow-800 dark:text-yellow-400 space-y-1">
                <li>
                  • <strong>Reject</strong> the post instead to allow author
                  revision
                </li>
                <li>
                  • <strong>Archive</strong> the post to hide it without
                  deletion (if available)
                </li>
                <li>
                  • <strong>Contact</strong> the author to discuss concerns
                  first
                </li>
              </ul>
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
                icon={Trash2}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
