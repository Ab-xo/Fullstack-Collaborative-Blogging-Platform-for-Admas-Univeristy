import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, UserMinus, Loader2 } from "lucide-react";
import { unfollowUser } from "../../api/users";

const FollowedAuthorsSidebar = ({ authors, loading, onUnfollow }) => {
  const [unfollowing, setUnfollowing] = useState(null);

  const handleUnfollow = async (authorId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (unfollowing) return;

    setUnfollowing(authorId);
    try {
      await unfollowUser(authorId);
      if (onUnfollow) onUnfollow();
    } catch (error) {
      console.error("Error unfollowing user:", error);
    } finally {
      setUnfollowing(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-gray-700" />
        <h3 className="font-semibold text-gray-900">Following</h3>
      </div>

      {authors.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm mb-4">
            You're not following anyone yet
          </p>
          <Link
            to="/authors"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Discover Authors
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {authors.map((author) => (
            <div key={author._id} className="flex items-start gap-3 group">
              <Link to={`/profile/${author._id}`} className="flex-shrink-0">
                <img
                  src={author.profile?.avatar || "/default-avatar.png"}
                  alt={`${author.firstName} ${author.lastName}`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link to={`/profile/${author._id}`} className="block">
                  <p className="font-medium text-gray-900 hover:text-blue-600 truncate">
                    {author.firstName} {author.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {author.followerCount || 0}{" "}
                    {author.followerCount === 1 ? "follower" : "followers"}
                  </p>
                </Link>
              </div>

              <button
                onClick={(e) => handleUnfollow(author._id, e)}
                disabled={unfollowing === author._id}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                title="Unfollow"
              >
                {unfollowing === author._id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                ) : (
                  <UserMinus className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Link
          to="/authors"
          className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Discover More Authors
        </Link>
      </div>
    </div>
  );
};

export default FollowedAuthorsSidebar;
