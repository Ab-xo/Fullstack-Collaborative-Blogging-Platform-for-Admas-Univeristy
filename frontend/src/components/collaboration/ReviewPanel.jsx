import { useState, useEffect } from "react";
import { MessageSquare, CheckCircle, AlertCircle, Send, X } from "lucide-react";
import apiClient from "../../api/client";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const ReviewPanel = ({ postId, isAuthor, currentStatus, onStatusUpdate }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [reviewStatus, setReviewStatus] = useState("comment_only");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [postId]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/reviews/${postId}/reviews`);
      if (response.data.success) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await apiClient.post(`/reviews/${postId}/reviews`, {
        content: newReview,
        status: reviewStatus,
      });

      if (response.data.success) {
        toast.success("Review submitted successfully");
        setNewReview("");
        setReviewStatus("comment_only");
        fetchReviews();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestReview = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.post(
        `/reviews/${postId}/request-review`
      );
      if (response.data.success) {
        toast.success("Review requested from collaborators");
        if (onStatusUpdate) onStatusUpdate("under_review");
      }
    } catch (error) {
      toast.error("Error requesting review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "changes_requested":
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "changes_requested":
        return "Changes Requested";
      default:
        return "Comment Only";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            Peer Review
          </h3>
        </div>
        {isAuthor &&
          currentStatus !== "under_review" &&
          currentStatus !== "published" && (
            <button
              onClick={handleRequestReview}
              disabled={isSubmitting}
              className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Request Peer Review
            </button>
          )}
      </div>

      <div className="p-4">
        {/* Reviews List */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <div
                key={review._id}
                className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        review.reviewer?.profile?.avatar ||
                        `https://ui-avatars.com/api/?name=${review.reviewer?.firstName}+${review.reviewer?.lastName}`
                      }
                      alt=""
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {review.reviewer?.firstName} {review.reviewer?.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                    {getStatusIcon(review.status)}
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
                      {getStatusLabel(review.status)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {review.content}
                </p>
                <div className="mt-2 text-[10px] text-gray-400">
                  {formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 italic text-sm">
              No reviews yet. Be the first to provide feedback!
            </div>
          )}
        </div>

        {/* New Review Form - Only for non-authors or collaborators */}
        {!isAuthor && (
          <form onSubmit={handleSubmitReview} className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReviewStatus("comment_only")}
                className={`flex-1 py-2 text-xs rounded-lg border transition-all ${
                  reviewStatus === "comment_only"
                    ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                Comment
              </button>
              <button
                type="button"
                onClick={() => setReviewStatus("changes_requested")}
                className={`flex-1 py-2 text-xs rounded-lg border transition-all ${
                  reviewStatus === "changes_requested"
                    ? "border-amber-600 bg-amber-50 text-amber-600 dark:bg-amber-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                Request Changes
              </button>
              <button
                type="button"
                onClick={() => setReviewStatus("approved")}
                className={`flex-1 py-2 text-xs rounded-lg border transition-all ${
                  reviewStatus === "approved"
                    ? "border-green-600 bg-green-50 text-green-600 dark:bg-green-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                Approve
              </button>
            </div>

            <div className="relative">
              <textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Write your feedback..."
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newReview.trim()}
                className="absolute bottom-2 right-2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                title="Submit Review"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewPanel;
