import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Shield,
  Mail,
  Bell,
  Database,
  Save,
  RefreshCw,
  Globe,
  Users,
  FileText,
  Clock,
  Lock,
  Eye,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { adminAPI } from "../../api/admin";
import toast from "react-hot-toast";

const SettingToggle = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="text-sm font-medium text-gray-900 dark:text-white">
        {label}
      </p>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </p>
      )}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

const SettingSection = ({ icon: Icon, title, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
    </div>
    <div className="px-6 py-4 divide-y divide-gray-100 dark:divide-gray-700">
      {children}
    </div>
  </div>
);

const SystemSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "moderation", label: "Moderation", icon: Shield },
    { id: "email", label: "Email", icon: Mail },
    { id: "security", label: "Security", icon: Lock },
    { id: "audit", label: "Audit", icon: Database },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSystemSettings();
      setSettings(response.settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminAPI.updateSystemSettings(settings);
      toast.success("Settings saved successfully");
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              System Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configure platform settings and preferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>

        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200 flex-1">
              You have unsaved changes. Click "Save Changes" to apply them.
            </p>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1 flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* General Settings */}
            {activeTab === "general" && (
              <>
                <SettingSection icon={Globe} title="General Settings">
                  <div className="py-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings?.general?.siteName || ""}
                      onChange={(e) =>
                        updateSetting("general", "siteName", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <SettingToggle
                    enabled={settings?.general?.maintenanceMode}
                    onChange={(v) =>
                      updateSetting("general", "maintenanceMode", v)
                    }
                    label="Maintenance Mode"
                    description="Temporarily disable access to the platform"
                  />
                  <SettingToggle
                    enabled={settings?.general?.allowRegistration}
                    onChange={(v) =>
                      updateSetting("general", "allowRegistration", v)
                    }
                    label="Allow Registration"
                    description="Allow new users to register"
                  />
                  <SettingToggle
                    enabled={settings?.general?.requireEmailVerification}
                    onChange={(v) =>
                      updateSetting("general", "requireEmailVerification", v)
                    }
                    label="Require Email Verification"
                    description="Users must verify email before accessing platform"
                  />
                </SettingSection>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700 p-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">
                        About General Settings
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        These settings control the basic behavior of your
                        platform. Maintenance mode will prevent all users except
                        admins from accessing the site.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Moderation Settings */}
            {activeTab === "moderation" && (
              <>
                <SettingSection icon={Shield} title="Moderation Settings">
                  <SettingToggle
                    enabled={settings?.moderation?.autoApproveVerifiedUsers}
                    onChange={(v) =>
                      updateSetting("moderation", "autoApproveVerifiedUsers", v)
                    }
                    label="Auto-Approve Verified Users"
                    description="Automatically approve users with verified emails"
                  />
                  <SettingToggle
                    enabled={settings?.moderation?.requirePostApproval}
                    onChange={(v) =>
                      updateSetting("moderation", "requirePostApproval", v)
                    }
                    label="Require Post Approval"
                    description="Posts must be approved before publishing"
                  />
                  <SettingToggle
                    enabled={settings?.moderation?.enableAIModeration}
                    onChange={(v) =>
                      updateSetting("moderation", "enableAIModeration", v)
                    }
                    label="Enable AI Moderation"
                    description="Use AI to detect content violations"
                  />
                  <div className="py-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Posts Per Day
                    </label>
                    <input
                      type="number"
                      value={settings?.moderation?.maxPostsPerDay || 10}
                      onChange={(e) =>
                        updateSetting(
                          "moderation",
                          "maxPostsPerDay",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </SettingSection>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700 p-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-900 dark:text-purple-100">
                        Content Moderation
                      </h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                        AI moderation uses machine learning to detect policy
                        violations. Posts flagged by AI will be queued for human
                        review.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Email Settings */}
            {activeTab === "email" && (
              <>
                <SettingSection icon={Mail} title="Email Settings">
                  <div className="py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          settings?.email?.smtpConfigured
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        SMTP{" "}
                        {settings?.email?.smtpConfigured
                          ? "Configured"
                          : "Not Configured"}
                      </span>
                    </div>
                  </div>
                  <div className="py-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={settings?.email?.fromEmail || ""}
                      onChange={(e) =>
                        updateSetting("email", "fromEmail", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <SettingToggle
                    enabled={settings?.email?.sendWelcomeEmail}
                    onChange={(v) =>
                      updateSetting("email", "sendWelcomeEmail", v)
                    }
                    label="Send Welcome Email"
                    description="Send email when users register"
                  />
                  <SettingToggle
                    enabled={settings?.email?.sendApprovalEmail}
                    onChange={(v) =>
                      updateSetting("email", "sendApprovalEmail", v)
                    }
                    label="Send Approval Email"
                    description="Notify users when account is approved"
                  />
                </SettingSection>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700 p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 dark:text-green-100">
                        Email Configuration
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        {settings?.email?.smtpConfigured
                          ? "SMTP is properly configured. Emails will be sent to users."
                          : "SMTP is not configured. Please set up SMTP in your environment variables."}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <>
                <SettingSection icon={Lock} title="Security Settings">
                  <div className="py-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Session Timeout (hours)
                    </label>
                    <input
                      type="number"
                      value={settings?.security?.sessionTimeout || 24}
                      onChange={(e) =>
                        updateSetting(
                          "security",
                          "sessionTimeout",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="py-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={settings?.security?.maxLoginAttempts || 5}
                      onChange={(e) =>
                        updateSetting(
                          "security",
                          "maxLoginAttempts",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <SettingToggle
                    enabled={settings?.security?.requireStrongPassword}
                    onChange={(v) =>
                      updateSetting("security", "requireStrongPassword", v)
                    }
                    label="Require Strong Password"
                    description="Enforce password complexity requirements"
                  />
                </SettingSection>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-700 p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-900 dark:text-orange-100">
                        Security Best Practices
                      </h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                        We recommend keeping strong password requirements
                        enabled and setting reasonable session timeouts for
                        better security.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Audit Settings */}
            {activeTab === "audit" && (
              <>
                <SettingSection icon={Database} title="Audit Settings">
                  <SettingToggle
                    enabled={settings?.audit?.enabled}
                    onChange={(v) => updateSetting("audit", "enabled", v)}
                    label="Enable Audit Logging"
                    description="Track system events and user actions"
                  />
                  <div className="py-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Log Retention (days)
                    </label>
                    <input
                      type="number"
                      value={settings?.audit?.retentionDays || 90}
                      onChange={(e) =>
                        updateSetting(
                          "audit",
                          "retentionDays",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <SettingToggle
                    enabled={settings?.audit?.logLoginAttempts}
                    onChange={(v) =>
                      updateSetting("audit", "logLoginAttempts", v)
                    }
                    label="Log Login Attempts"
                    description="Record all login attempts"
                  />
                  <SettingToggle
                    enabled={settings?.audit?.logAdminActions}
                    onChange={(v) =>
                      updateSetting("audit", "logAdminActions", v)
                    }
                    label="Log Admin Actions"
                    description="Record administrative actions"
                  />
                </SettingSection>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700 p-6">
                  <div className="flex items-start gap-3">
                    <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-indigo-900 dark:text-indigo-100">
                        Audit Log Retention
                      </h4>
                      <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                        Logs older than the retention period will be
                        automatically deleted. Consider compliance requirements
                        when setting this value.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default SystemSettings;
