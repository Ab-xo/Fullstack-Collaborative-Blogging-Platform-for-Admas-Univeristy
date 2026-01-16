/**
 * ============================================================================
 * COLLABORATOR MANAGER COMPONENT
 * ============================================================================
 * Manage collaborators on a blog post - invite, remove, view
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Search,
  X,
  Crown,
  Edit3,
  Eye,
  Trash2,
  Send,
  Check,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { collaborationAPI } from "../../api/collaboration";

const ROLES = [
  {
    id: "editor",
    label: "Editor",
    description: "Can edit content",
    icon: Edit3,
  },
  {
    id: "contributor",
    label: "Contributor",
    description: "Can suggest changes",
    icon: Users,
  },
  {
    id: "reviewer",
    label: "Reviewer",
    description: "Can review and comment",
    icon: Eye,
  },
];

const CollaboratorManager = ({ postId, isAuthor = false, onUpdate }) => {
  const [collaborators, setCollaborators] = useState({
    author: null,
    coAuthors: [],
    pendingInvites: [],
  });
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("contributor");
  const [inviteMessage, setInviteMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (postId) fetchCollaborators();
  }, [postId]);

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      const response = await collaborationAPI.getCollaborators(postId);
      setCollaborators(response.data.data);
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      console.log("Searching for users:", query, "postId:", postId);
      const response = await collaborationAPI.searchUsers(query, postId);
      console.log("Search response:", response.data);
      setSearchResults(response.data.data);
    } catch (error) {
      console.error("Error searching users:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to search users");
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = async () => {
    if (!selectedUser) return;

    try {
      setSending(true);
      await collaborationAPI.inviteCollaborator(
        postId,
        selectedUser._id,
        selectedRole,
        inviteMessage
      );
      toast.success("Invitation sent!");
      setShowInviteModal(false);
      setSelectedUser(null);
      setSearchQuery("");
      setInviteMessage("");
      fetchCollaborators();
      onUpdate?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send invitation");
    } finally {
      setSending(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm("Remove this collaborator?")) return;

    try {
      await collaborationAPI.removeCollaborator(postId, userId);
      toast.success("Collaborator removed");
      fetchCollaborators();
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to remove collaborator");
    }
  };

  const getRoleIcon = (role) => {
    const roleConfig = ROLES.find((r) => r.id === role);
    return roleConfig?.icon || Users;
  };

  const getRoleLabel = (role) => {
    const roleConfig = ROLES.find((r) => r.id === role);
    return roleConfig?.label || role;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Collaborators
          </h3>
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
            {1 + (collaborators.coAuthors?.length || 0)}
          </span>
        </div>
        {isAuthor && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Invite
          </button>
        )}
      </div>

      {/* Author */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold">
            {collaborators.author?.firstName?.charAt(0) || "?"}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {collaborators.author?.firstName}{" "}
                {collaborators.author?.lastName}
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                <Crown className="w-3 h-3" />
                Author
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {collaborators.author?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Co-Authors */}
      {collaborators.coAuthors?.length > 0 && (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {collaborators.coAuthors.map((coAuthor) => {
            const RoleIcon = getRoleIcon(coAuthor.role);
            return (
              <div
                key={coAuthor.user._id}
                className="p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-semibold">
                  {coAuthor.user?.firstName?.charAt(0) || "?"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {coAuthor.user?.firstName} {coAuthor.user?.lastName}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      <RoleIcon className="w-3 h-3" />
                      {getRoleLabel(coAuthor.role)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {coAuthor.user?.email}
                  </p>
                </div>
                {isAuthor && (
                  <button
                    onClick={() => handleRemove(coAuthor.user._id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    title="Remove collaborator"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pending Invites */}
      {isAuthor && collaborators.pendingInvites?.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
            <span className="text-xs font-medium text-gray-500 uppercase">
              Pending Invitations
            </span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {collaborators.pendingInvites.map((invite) => (
              <div
                key={invite.user._id}
                className="p-4 flex items-center gap-3 bg-yellow-50/50 dark:bg-yellow-900/10"
              >
                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 font-semibold">
                  {invite.user?.firstName?.charAt(0) || "?"}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {invite.user?.firstName} {invite.user?.lastName}
                  </span>
                  <p className="text-sm text-yellow-600">
                    Invitation pending...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {collaborators.coAuthors?.length === 0 &&
        collaborators.pendingInvites?.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No collaborators yet</p>
            {isAuthor && (
              <p className="text-sm">
                Invite others to collaborate on this post
              </p>
            )}
          </div>
        )}

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInviteModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Invite Collaborator
                  </h3>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-4 space-y-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Search User
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Search Results */}
                    {searchQuery.length >= 2 && (
                      <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                        {searching ? (
                          <div className="p-4 text-center">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-500" />
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No users found
                          </div>
                        ) : (
                          searchResults.map((user) => (
                            <button
                              key={user._id}
                              onClick={() => {
                                setSelectedUser(user);
                                setSearchQuery("");
                                setSearchResults([]);
                              }}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-left"
                            >
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                                {user.firstName?.charAt(0) || "?"}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {user.email}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected User */}
                  {selectedUser && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {selectedUser.firstName?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedUser.firstName} {selectedUser.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedUser.email}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
                      >
                        <X className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  )}

                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {ROLES.map((role) => {
                        const Icon = role.icon;
                        return (
                          <button
                            key={role.id}
                            onClick={() => setSelectedRole(role.id)}
                            className={`p-3 rounded-lg border-2 transition-all text-center ${
                              selectedRole === role.id
                                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                            }`}
                          >
                            <Icon
                              className={`w-5 h-5 mx-auto mb-1 ${
                                selectedRole === role.id
                                  ? "text-blue-600"
                                  : "text-gray-400"
                              }`}
                            />
                            <p
                              className={`text-sm font-medium ${
                                selectedRole === role.id
                                  ? "text-blue-600"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {role.label}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message (optional)
                    </label>
                    <textarea
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      placeholder="Add a personal message..."
                      rows={2}
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInvite}
                    disabled={!selectedUser || sending}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send Invitation
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollaboratorManager;
