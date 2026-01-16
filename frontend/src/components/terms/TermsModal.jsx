/**
 * TermsModal - Modal component displaying full terms content
 */
import React, { useState, useEffect } from "react";
import { X, Loader2, FileText, Shield, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import api from "../../services/api";

const typeConfig = {
  tos: {
    title: "Terms of Service",
    icon: FileText,
    color: "text-blue-600",
  },
  privacy: {
    title: "Privacy Policy",
    icon: Shield,
    color: "text-green-600",
  },
  "content-guidelines": {
    title: "Content Guidelines",
    icon: BookOpen,
    color: "text-purple-600",
  },
};

const TermsModal = ({
  isOpen,
  onClose,
  type = "tos",
  onAccept,
  showAcceptButton = false,
}) => {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const config = typeConfig[type] || typeConfig.tos;
  const Icon = config.icon;

  useEffect(() => {
    if (isOpen && type) {
      fetchTerms();
    }
  }, [isOpen, type]);

  const fetchTerms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/terms/${type}`);
      if (response.data.success) {
        setTerms(response.data.data);
      } else {
        setError("Failed to load terms");
      }
    } catch (err) {
      console.error("Error fetching terms:", err);
      setError("Failed to load terms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (onAccept && terms) {
      onAccept(type, terms.version);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-3xl max-h-[85vh] mx-4 glass rounded-2xl shadow-2xl flex flex-col border border-white/20 dark:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.color}`} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {config.title}
            </h2>
            {terms && (
              <span className="text-sm font-normal text-gray-500">
                v{terms.version}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchTerms}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50"
              >
                Try Again
              </button>
            </div>
          ) : terms ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{terms.content}</ReactMarkdown>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
          {terms && (
            <p className="text-xs text-gray-500">
              Last updated: {new Date(terms.effectiveDate).toLocaleDateString()}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
            {showAcceptButton && terms && (
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                I Accept
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
