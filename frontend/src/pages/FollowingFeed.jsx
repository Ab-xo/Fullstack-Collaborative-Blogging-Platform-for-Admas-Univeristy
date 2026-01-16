import { useState, useEffect, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getFollowingFeed, getFollowedAuthors } from "../api/feed";
import FeedPostCard from "../components/feed/FeedPostCard";
import FollowedAuthorsSidebar from "../components/feed/FollowedAuthorsSidebar";
import FeedFilters from "../components/feed/FeedFilters";
import { Loader2, Users } from "lucide-react";

const FollowingFeed = () => {
  const [filters, setFilters] = useState({
    category: null,
    sortBy: "newest",
  });
  const [followedAuthors, setFollowedAuthors] = useState([]);
  const [loadingAuthors, setLoadingAuthors] = useState(true);

  // Fetch followed authors
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await getFollowedAuthors();
        setFollowedAuthors(response.data || []);
      } catch (error) {
        console.error("Error fetching followed authors:", error);
      } finally {
        setLoadingAuthors(false);
      }
    };

    fetchAuthors();
  }, []);

  // Infinite query for feed posts
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["followingFeed", filters],
    queryFn: ({ pageParam = 1 }) =>
      getFollowingFeed({
        page: pageParam,
        limit: 10,
        ...filters,
      }),
    getNextPageParam: (lastPage) => {
      // lastPage is the API response: { success, data: { posts, pagination, followingCount } }
      const pagination = lastPage?.data?.pagination;
      return pagination?.hasMore ? pagination.currentPage + 1 : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handle scroll for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500
      ) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ category: null, sortBy: "newest" });
  }, []);

  const handleAuthorUnfollow = useCallback(() => {
    // Refetch both authors list and feed
    refetch();
    const fetchAuthors = async () => {
      try {
        const response = await getFollowedAuthors();
        setFollowedAuthors(response.data || []);
      } catch (error) {
        console.error("Error refetching authors:", error);
      }
    };
    fetchAuthors();
  }, [refetch]);

  // Flatten all pages of posts
  // Backend returns: { success: true, data: { posts, pagination, followingCount } }
  // API client returns response.data, so page = { success: true, data: {...} }
  const allPosts = data?.pages.flatMap((page) => page?.data?.posts || []) || [];
  const followingCount = data?.pages[0]?.data?.followingCount || 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your feed...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Error Loading Feed
            </h2>
            <p className="text-red-600 mb-4">
              {error?.message || "Something went wrong"}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state - not following anyone
  if (followingCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your Feed is Empty
            </h2>
            <p className="text-gray-600 mb-6">
              Start following authors to see their latest posts here
            </p>
            <a
              href="/authors"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Discover Authors
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Following Feed
          </h1>
          <p className="text-gray-600">
            Latest posts from {followingCount}{" "}
            {followingCount === 1 ? "author" : "authors"} you follow
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <FeedFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />

            {/* Posts */}
            <div className="space-y-6">
              {allPosts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-600">
                    No posts match your current filters. Try adjusting your
                    filters or check back later.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                allPosts.map((post) => (
                  <FeedPostCard key={post._id} post={post} onUpdate={refetch} />
                ))
              )}

              {/* Loading more indicator */}
              {isFetchingNextPage && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              )}

              {/* End of feed indicator */}
              {!hasNextPage && allPosts.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  You've reached the end of your feed
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FollowedAuthorsSidebar
              authors={followedAuthors}
              loading={loadingAuthors}
              onUnfollow={handleAuthorUnfollow}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowingFeed;
