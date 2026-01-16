/**
 * ============================================================================
 * COLLABORATION INVITATIONS COMPONENT
 * ============================================================================
 * View and respond to collaboration invitations
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Check,
  X,
  Clock,
  FileText,
  Loader2,
  UserPlus,
  Edit3,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { collaborationAPI } from "../../api/collaboration";

const CollaborationInvitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await collaborationAPI.getMyInvitations();
      setInvitations(response.data.data);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (postId, accept) => {
    try {
      setResponding(postId);
      await collaborationAPI.respondToInvitation(postId, accept);
      toast.success(
        accept ? "You are now a collaborator!" : "Invitation declined"
      );
      fetchInvitations();
    } catch (error) {
      toast.error("Failed to respond to invitation");
    } finally {
      setResponding(null);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "editor":
        return Edit3;
      case "reviewer":
        return Eye;
      default:
        return Users;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "editor":
        return "Editor";
      case "reviewer":
        return "Reviewer";
      default:
        return "Contributor";
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          No Invitations
        </h3>
        <p className="text-gray-500">
          You don't have any pending collaboration invitations
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Collaboration Invitations
          </h3>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
            {invitations.length}
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        <AnimatePresence>
          {invitations.map((invite) => {
            const RoleIcon = getRoleIcon(invite.role);
            return (
              <motion.div
                key={invite.postId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="p-4"
              >
                <div className="flex items-start gap-4">
                  {/* Post Image */}
                  <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                    {invite.featuredImage ? (
                      <img
                        src={invite.featuredImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/posts/${invite.postSlug || invite.postId}`}
                      className="font-medium text-gray-900 dark:text-white hover:text-blue-600 transition-colors line-clamp-1"
                    >
                      {invite.postTitle}
                    </Link>

                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <span>
                        From {invite.author?.firstName}{" "}
                        {invite.author?.lastName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(invite.invitedAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        <RoleIcon className="w-3 h-3" />
                        {getRoleLabel(invite.role)}
                      </span>
                    </div>

                    {invite.message && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                        "{invite.message}"
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleRespond(invite.postId, true)}
                        disabled={responding === invite.postId}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all text-sm font-medium"
                      >
                        {responding === invite.postId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespond(invite.postId, false)}
                        disabled={responding === invite.postId}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-all text-sm font-medium"
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CollaborationInvitations;
