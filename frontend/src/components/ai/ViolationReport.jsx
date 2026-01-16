/**
 * ============================================================================
 * VIOLATION REPORT COMPONENT
 * ============================================================================
 * Displays AI-generated violation reports for moderators.
 * Shows severity badges, violation types, and excerpts.
 *
 * Feature: ai-content-assistant
 * Requirements: 3.4, 3.5, 4.1
 *
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import { motion } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  XCircle,
  CheckCircle,
  Clock,
  Eye,
} from "lucide-react";

/**
 * Get severity badge styling
 */
const getSeverityConfig = (severity) => {
  switch (severity) {
    case "critical":
      return {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        borderColor: "border-red-300 dark:border-red-700",
        icon: XCircle,
        label: "Critical",
      };
    case "high":
      return {
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        borderColor: "border-orange-300 dark:border-orange-700",
        icon: AlertCircle,
        label: "High",
      };
    case "medium":
      return {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        borderColor: "border-yellow-300 dark:border-yellow-700",
        icon: AlertTriangle,
        label: "Medium",
      };
    case "low":
      return {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        borderColor: "border-blue-300 dark:border-blue-700",
        icon: Eye,
        label: "Low",
      };
    default:
      return {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        borderColor: "border-green-300 dark:border-green-700",
        icon: CheckCircle,
        label: "Clean",
      };
  }
};

/**
 * Get violation type display name
 */
const getViolationTypeName = (type) => {
  const typeNames = {
    hate_speech: "Hate Speech",
    spam: "Spam",
    inappropriate_content: "Inappropriate Content",
    personal_attacks: "Personal Attacks",
    plagiarism: "Plagiarism",
    profanity: "Profanity",
    harassment: "Harassment",
    violence: "Violence",
    misleading_information: "Misleading Information",
  };
  return typeNames[type] || type;
};

/**
 * Violation Report Component
 */
const ViolationReport = ({ report, compact = false }) => {
  if (!report) {
    return null;
  }

  const { hasViolations, isClean, severity, violations, analyzedAt } = report;
  const severityConfig = getSeverityConfig(severity);
  const SeverityIcon = severityConfig.icon;

  // Compact view for list items
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isClean ? (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${severityConfig.color}`}
          >
            <ShieldCheck className="w-3 h-3" />
            Clean
          </span>
        ) : (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${severityConfig.color}`}
          >
            <SeverityIcon className="w-3 h-3" />
            {severityConfig.label}
          </span>
        )}
        {violations?.length > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({violations.length} issue{violations.length !== 1 ? "s" : ""})
          </span>
        )}
      </div>
    );
  }

  // Full view for detail pages
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border ${severityConfig.borderColor} overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`px-4 py-3 ${
          isClean
            ? "bg-green-50 dark:bg-green-900/20"
            : "bg-gray-50 dark:bg-gray-800/50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isClean ? (
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div
                className={`p-2 rounded-lg ${severityConfig.color.replace(
                  "text-",
                  "bg-"
                )}`}
              >
                <ShieldAlert className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {isClean ? "Content Analysis: Clean" : "Violation Report"}
              </h3>
              {analyzedAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  Analyzed {new Date(analyzedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full ${severityConfig.color}`}
          >
            <SeverityIcon className="w-4 h-4" />
            {severityConfig.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isClean ? (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-300">
                No violations detected
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                This content appears to comply with community guidelines. Ready
                for quick approval.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The following potential violations were detected in this content:
            </p>

            {/* Violations List */}
            <div className="space-y-3">
              {violations?.map((violation, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded bg-red-100 dark:bg-red-900/30">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {getViolationTypeName(violation.type)}
                        </span>
                        {violation.location && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                            {violation.location}
                          </span>
                        )}
                      </div>
                      {violation.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {violation.description}
                        </p>
                      )}
                      {violation.excerpt && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-2 border-red-400">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Flagged content:
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300 font-mono">
                            "{violation.excerpt}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendation */}
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>Recommendation:</strong> Please review the flagged
                content carefully before approving. Consider requesting the
                author to revise if violations are confirmed.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ViolationReport;
