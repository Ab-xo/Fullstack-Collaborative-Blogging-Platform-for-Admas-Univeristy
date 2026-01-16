import { useState, useCallback, memo, useRef } from "react";
import {
  MessageCircle,
  Send,
  Reply,
  Heart,
  MoreVertical,
  Trash2,
  Edit2,
  Check,
  X,
  Award,
} from "lucide-react";
import Avatar from "../common/Avatar";
import Button from "../common/Button";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// Separate CommentItem component to prevent re-renders
const CommentItem = memo(
  ({
    comment,
    isReply,
    user,
    postAuthorId,
    isReplying,
    onStartReply,
    onCancelReply,
    onSubmitReply,
    onEdit,
    onDelete,
    onLike,
    editingCommentId,
    onSaveEdit,
    onCancelEdit,
    submitting,
  }) => {
    const isCommentAuthor =
      user?.id === comment.author?._id || user?._id === comment.author?._id;
    const isPostAuthor =
      comment.author?._id === postAuthorId ||
      comment.author?._id?.toString() === postAuthorId?.toString();
    const isEditing = editingCommentId === comment._id;
    const [showActions, setShowActions] = useState(false);

    // Use refs for uncontrolled inputs to prevent cursor jumping
    const replyInputRef = useRef(null);
    const editInputRef = useRef(null);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`${isReply ? "ml-12" : ""}`}
      >
        <div className="flex gap-3 group">
          <Avatar
            src={comment.author?.profile?.avatar}
            alt={`${comment.author?.firstName} ${comment.author?.lastName}`}
            fallback={comment.author?.firstName?.[0] || "A"}
            size="md"
          />

          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 relative">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {comment.author?.firstName} {comment.author?.lastName}
                  </span>
                  {isPostAuthor && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium rounded-full">
                      <Award className="w-3 h-3" />
                      Author
                    </span>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                {isCommentAuthor && (
                  <div className="relative">
                    <button
                      onClick={() => setShowActions(!showActions)}
                      className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>

                    {showActions && (
                      <div className="absolute right-0 top-8 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10 min-w-[120px]">
                        <button
                          onClick={() => {
                            onEdit(comment._id);
                            setShowActions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onDelete(comment._id);
                            setShowActions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    ref={editInputRef}
                    defaultValue={comment.content}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows="3"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        onSaveEdit(comment._id, editInputRef.current?.value)
                      }
                      className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Save
                    </button>
                    <button
                      onClick={onCancelEdit}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}
            </div>

            {!isEditing && (
              <div className="flex items-center gap-4 mt-2 ml-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onLike(comment._id)}
                  className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <motion.div
                    animate={
                      comment.isLiked
                        ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }
                        : {}
                    }
                    transition={{ duration: 0.4 }}
                  >
                    <Heart
                      className={`w-3 h-3 ${
                        comment.isLiked ? "fill-current text-red-600" : ""
                      }`}
                    />
                  </motion.div>
                  <motion.span
                    animate={comment.isLiked ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {comment.likesCount || 0}
                  </motion.span>
                </motion.button>

                {!isReply && (
                  <motion.button
                    whileHover={{ scale: 1.1, x: 2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onStartReply(comment._id)}
                    className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <Reply className="w-3 h-3" />
                    Reply
                  </motion.button>
                )}
              </div>
            )}

            {isReplying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="flex gap-2">
                  <Avatar
                    src={user?.profile?.avatar}
                    alt={`${user?.firstName} ${user?.lastName}`}
                    fallback={user?.firstName?.[0] || "U"}
                    size="sm"
                  />
                  <div className="flex-1">
                    <textarea
                      ref={replyInputRef}
                      placeholder="Write a reply..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      rows="2"
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() =>
                          onSubmitReply(
                            comment._id,
                            replyInputRef.current?.value
                          )
                        }
                        disabled={submitting}
                        className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        Reply
                      </button>
                      <button
                        onClick={onCancelReply}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-4">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply._id}
                    comment={reply}
                    isReply={true}
                    user={user}
                    postAuthorId={postAuthorId}
                    isReplying={false}
                    onStartReply={() => {}}
                    onCancelReply={() => {}}
                    onSubmitReply={() => {}}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onLike={onLike}
                    editingCommentId={editingCommentId}
                    onSaveEdit={onSaveEdit}
                    onCancelEdit={onCancelEdit}
                    submitting={submitting}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

CommentItem.displayName = "CommentItem";

const CommentSection = ({
  postId,
  postAuthorId,
  comments = [],
  user,
  isAuthenticated,
  onAddComment,
  onDeleteComment,
  onEditComment,
  onLikeComment,
  onLoginPrompt,
}) => {
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Use refs for uncontrolled inputs to prevent cursor jumping
  const mainCommentRef = useRef(null);

  const handleSubmitComment = useCallback(
    async (e) => {
      e.preventDefault();

      if (!isAuthenticated) {
        onLoginPrompt?.();
        return;
      }

      const commentText = mainCommentRef.current?.value || "";
      if (!commentText.trim()) {
        toast.error("Please write a comment");
        return;
      }

      setSubmitting(true);
      try {
        await onAddComment?.(commentText);
        if (mainCommentRef.current) {
          mainCommentRef.current.value = "";
        }
        toast.success("Comment posted!");
      } catch (error) {
        toast.error("Failed to post comment");
      } finally {
        setSubmitting(false);
      }
    },
    [isAuthenticated, onAddComment, onLoginPrompt]
  );

  const handleSubmitReply = useCallback(
    async (parentId, replyText) => {
      if (!replyText || !replyText.trim()) {
        toast.error("Please write a reply");
        return;
      }

      setSubmitting(true);
      try {
        await onAddComment?.(replyText, parentId);
        setReplyingTo(null);
        toast.success("Reply posted!");
      } catch (error) {
        toast.error("Failed to post reply");
      } finally {
        setSubmitting(false);
      }
    },
    [onAddComment]
  );

  const handleStartReply = useCallback(
    (commentId) => {
      if (!isAuthenticated) {
        onLoginPrompt?.();
        return;
      }
      setReplyingTo(commentId);
    },
    [isAuthenticated, onLoginPrompt]
  );

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleStartEdit = useCallback((commentId) => {
    setEditingComment(commentId);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingComment(null);
  }, []);

  const handleSaveEdit = useCallback(
    async (commentId, editText) => {
      if (!editText || !editText.trim()) {
        toast.error("Comment cannot be empty");
        return;
      }

      try {
        await onEditComment?.(commentId, editText);
        setEditingComment(null);
        toast.success("Comment updated!");
      } catch (error) {
        toast.error("Failed to update comment");
      }
    },
    [onEditComment]
  );

  const handleDelete = useCallback(
    async (commentId) => {
      if (window.confirm("Are you sure you want to delete this comment?")) {
        try {
          await onDeleteComment?.(commentId);
          toast.success("Comment deleted");
        } catch (error) {
          toast.error("Failed to delete comment");
        }
      }
    },
    [onDeleteComment]
  );

  return (
    <div className="py-8 pb-24">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-6 h-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h2>
      </div>

      <div className="mb-10">
        {isAuthenticated ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmitComment} className="flex gap-4">
              <Avatar
                src={user?.profile?.avatar}
                alt={`${user?.firstName} ${user?.lastName}`}
                fallback={user?.firstName?.[0] || "U"}
                size="md"
              />
              <div className="flex-1 space-y-3">
                <textarea
                  ref={mainCommentRef}
                  placeholder="Share your thoughts..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  rows="4"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    icon={Send}
                  >
                    {submitting ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-2xl p-6 text-center border border-primary-200 dark:border-primary-800">
            <MessageCircle className="w-12 h-12 text-primary-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Join the conversation
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Sign in to share your thoughts and engage with the community
            </p>
            <Button variant="primary" onClick={onLoginPrompt}>
              Sign In to Comment
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-8">
        <AnimatePresence>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                isReply={false}
                user={user}
                postAuthorId={postAuthorId}
                isReplying={replyingTo === comment._id}
                onStartReply={handleStartReply}
                onCancelReply={handleCancelReply}
                onSubmitReply={handleSubmitReply}
                onEdit={handleStartEdit}
                onDelete={handleDelete}
                onLike={onLikeComment}
                editingCommentId={editingComment}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                submitting={submitting}
              />
            ))
          ) : (
            <div className="text-center py-16">
              <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommentSection;
