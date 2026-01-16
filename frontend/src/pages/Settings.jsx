/**
 * ============================================================================
 * SETTINGS PAGE
 * ============================================================================
 * Comprehensive settings page for authors to manage their account
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { usersAPI } from "../api/users";
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Trash2,
  Camera,
  Save,
  Eye,
  EyeOff,
  ChevronRight,
  AlertTriangle,
  Check,
  X,
  Globe,
  Moon,
  Sun,
  Palette,
  FileText,
  Settings as SettingsIcon,
  LogOut,
  Loader2,
  CheckCircle,
  Link as LinkIcon,
  Twitter,
  Facebook,
  Linkedin,
  Github,
  Instagram,
} from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    website: "",
    location: "",
    phone: "",
    socialLinks: {
      twitter: "",
      facebook: "",
      linkedin: "",
      github: "",
      instagram: "",
    },
  });

  // Password state
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    newFollowerAlert: true,
    commentAlert: true,
    likeAlert: false,
    profileVisibility: "public",
    showEmail: false,
    theme: "system",
    language: "en",
  });

  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getProfile();
      const userData = response.user || response.data?.user || response;

      setProfile({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        bio: userData.profile?.bio || userData.bio || "",
        website: userData.profile?.website || "",
        location: userData.profile?.location || "",
        phone: userData.phone || "",
        socialLinks: {
          twitter: userData.profile?.socialLinks?.twitter || "",
          facebook: userData.profile?.socialLinks?.facebook || "",
          linkedin: userData.profile?.socialLinks?.linkedin || "",
          github: userData.profile?.socialLinks?.github || "",
          instagram: userData.profile?.socialLinks?.instagram || "",
        },
      });

      if (userData.preferences) {
        setPreferences((prev) => ({ ...prev, ...userData.preferences }));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    try {
      setUploadingAvatar(true);
      const response = await usersAPI.uploadAvatar(file);
      if (response.success) {
        toast.success("Avatar updated!");
        if (updateUser)
          updateUser({
            ...user,
            profile: { ...user?.profile, avatar: response.data?.url },
          });
      }
    } catch (error) {
      toast.error("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await usersAPI.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio,
        website: profile.website,
        location: profile.location,
        phone: profile.phone,
        socialLinks: profile.socialLinks,
      });
      toast.success("Profile updated successfully!");
      if (updateUser)
        updateUser({
          ...user,
          firstName: profile.firstName,
          lastName: profile.lastName,
        });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwords.new.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setSaving(true);
      await usersAPI.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      toast.success("Password changed successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      await usersAPI.updatePreferences(preferences);
      toast.success("Preferences saved!");
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    try {
      setSaving(true);
      await usersAPI.deleteAccount(passwords.current);
      toast.success("Account deleted");
      await logout();
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      setSaving(false);
      setShowDeleteModal(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const sections = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      description: "Personal information",
    },
    {
      id: "account",
      label: "Account",
      icon: Lock,
      description: "Password & security",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "Email & alerts",
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: Shield,
      description: "Visibility settings",
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      description: "Theme & display",
    },
    {
      id: "danger",
      label: "Danger Zone",
      icon: AlertTriangle,
      description: "Delete account",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-blue-600" />
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2 space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === section.id
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <section.icon
                    className={`w-5 h-5 ${
                      section.id === "danger" ? "text-red-500" : ""
                    }`}
                  />
                  <div className="text-left">
                    <p
                      className={`font-medium ${
                        section.id === "danger"
                          ? "text-red-600 dark:text-red-400"
                          : ""
                      }`}
                    >
                      {section.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {section.description}
                    </p>
                  </div>
                </button>
              ))}

              <hr className="my-2 border-gray-200 dark:border-gray-700" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Profile Section */}
            {activeSection === "profile" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Profile Information
                </h2>

                {/* Profile Preview */}
                <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                      {user?.profile?.avatar ? (
                        <img
                          src={user.profile.avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        profile.firstName?.charAt(0) || "U"
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    <p className="text-gray-500">{profile.email}</p>
                    {profile.bio && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Mail className="w-5 h-5" />
                    <span>{profile.email}</span>
                  </div>
                  {profile.website && (
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <Globe className="w-5 h-5" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <User className="w-5 h-5" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>

                {/* Edit Profile Link */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Edit Your Profile
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Update your avatar, name, bio, and social links
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/profile/edit")}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Account Section */}
            {activeSection === "account" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Account Security
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwords.current}
                        onChange={(e) =>
                          setPasswords({
                            ...passwords,
                            current: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            current: !showPasswords.current,
                          })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwords.new}
                        onChange={(e) =>
                          setPasswords({ ...passwords, new: e.target.value })
                        }
                        className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            new: !showPasswords.new,
                          })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 8 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwords.confirm}
                        onChange={(e) =>
                          setPasswords({
                            ...passwords,
                            confirm: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            confirm: !showPasswords.confirm,
                          })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {passwords.new && passwords.confirm && (
                      <p
                        className={`text-xs mt-1 ${
                          passwords.new === passwords.confirm
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {passwords.new === passwords.confirm
                          ? "✓ Passwords match"
                          : "✗ Passwords don't match"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleChangePassword}
                    disabled={
                      saving ||
                      !passwords.current ||
                      !passwords.new ||
                      !passwords.confirm
                    }
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                    Change Password
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === "notifications" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Notification Preferences
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Email Notifications
                        </p>
                        <p className="text-sm text-gray-500">
                          Receive notifications via email
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.emailNotifications}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            emailNotifications: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Push Notifications
                        </p>
                        <p className="text-sm text-gray-500">
                          Receive push notifications in browser
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.pushNotifications}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            pushNotifications: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white pt-4">
                    Alert Types
                  </h3>

                  {[
                    {
                      key: "weeklyDigest",
                      label: "Weekly Digest",
                      desc: "Summary of your weekly activity",
                      icon: FileText,
                    },
                    {
                      key: "newFollowerAlert",
                      label: "New Followers",
                      desc: "When someone follows you",
                      icon: User,
                    },
                    {
                      key: "commentAlert",
                      label: "Comments",
                      desc: "When someone comments on your post",
                      icon: Bell,
                    },
                    {
                      key: "likeAlert",
                      label: "Likes",
                      desc: "When someone likes your post",
                      icon: CheckCircle,
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.label}
                          </p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences[item.key]}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSavePreferences}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === "privacy" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Privacy Settings
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Profile Visibility
                    </label>
                    <div className="space-y-3">
                      {[
                        {
                          value: "public",
                          label: "Public",
                          desc: "Anyone can see your profile",
                        },
                        {
                          value: "followers",
                          label: "Followers Only",
                          desc: "Only your followers can see your profile",
                        },
                        {
                          value: "private",
                          label: "Private",
                          desc: "Only you can see your profile",
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                            preferences.profileVisibility === option.value
                              ? "bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500"
                              : "bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="visibility"
                            value={option.value}
                            checked={
                              preferences.profileVisibility === option.value
                            }
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                profileVisibility: e.target.value,
                              })
                            }
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              preferences.profileVisibility === option.value
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {preferences.profileVisibility === option.value && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {option.label}
                            </p>
                            <p className="text-sm text-gray-500">
                              {option.desc}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Show Email on Profile
                        </p>
                        <p className="text-sm text-gray-500">
                          Allow others to see your email address
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.showEmail}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            showEmail: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSavePreferences}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Save Privacy Settings
                  </button>
                </div>
              </div>
            )}

            {/* Appearance Section */}
            {activeSection === "appearance" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Appearance
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: "light", label: "Light", icon: Sun },
                        { value: "dark", label: "Dark", icon: Moon },
                        {
                          value: "system",
                          label: "System",
                          icon: SettingsIcon,
                        },
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() =>
                            setPreferences({
                              ...preferences,
                              theme: theme.value,
                            })
                          }
                          className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all ${
                            preferences.theme === theme.value
                              ? "bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500"
                              : "bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-300"
                          }`}
                        >
                          <theme.icon
                            className={`w-8 h-8 ${
                              preferences.theme === theme.value
                                ? "text-blue-500"
                                : "text-gray-500"
                            }`}
                          />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {theme.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={preferences.language}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          language: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="am">Amharic</option>
                      <option value="or">Oromiffa</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSavePreferences}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Save Appearance
                  </button>
                </div>
              </div>
            )}

            {/* Danger Zone Section */}
            {activeSection === "danger" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-2 border-red-200 dark:border-red-900">
                <h2 className="text-xl font-bold text-red-600 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  Danger Zone
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  These actions are irreversible. Please proceed with caution.
                </p>

                <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                    Delete Account
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                    Once you delete your account, all your data including posts,
                    comments, and profile information will be permanently
                    removed. This action cannot be undone.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete My Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Delete Account
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will permanently delete your account and all associated data.
              Type <strong>DELETE</strong> to confirm.
            </p>

            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg mb-4 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm("");
                }}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== "DELETE" || saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
