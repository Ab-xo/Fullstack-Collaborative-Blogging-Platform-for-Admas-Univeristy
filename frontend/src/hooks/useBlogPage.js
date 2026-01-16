import { useState, useEffect, useCallback, useMemo } from 'react';
import { postsAPI } from '../api/posts';
import { useAuth } from './useAuth';
import { useDebounce } from './useDebounce';
import toast from 'react-hot-toast';

/**
 * Custom hook for managing Blog Page state and operations
 * Handles posts fetching, filtering, pagination, likes, and trending content
 */
export const useBlogPage = (initialFilters = {}) => {
  const { user, isAuthenticated } = useAuth();
  
  // Posts state
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Sidebar loading states (independent from main posts)
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    postsPerPage: 9,
    hasNext: false,
    hasPrev: false,
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    category: null,
    tags: [],
    sortBy: 'latest',
    status: null, // For authors only
    ...initialFilters,
  });
  
  // Debounced search
  const debouncedSearch = useDebounce(filters.search, 300);
  
  // Sidebar content
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // User interactions tracking
  const [userLikedPosts, setUserLikedPosts] = useState(new Set());
  const [userFollowedAuthors, setUserFollowedAuthors] = useState(new Set());
  
  // Loading states for specific actions
  const [likingPosts, setLikingPosts] = useState(new Set());

  /**
   * Fetch posts with current filters and pagination
   */
  const fetchPosts = useCallback(async (page = 1) => {
    const startTime = Date.now();
    console.log('[useBlogPage] fetchPosts started', { page, filters });
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: pagination.postsPerPage,
      };
      
      // Map frontend sort options to backend API parameters
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'popular':
            params.sort = 'popular';
            break;
          case 'mostLiked':
            params.sort = 'likes';
            break;
          case 'mostViewed':
            params.sort = 'views';
            break;
          case 'latest':
          default:
            params.sort = 'recent';
            break;
        }
      }
      
      // Add category filter
      if (filters.category && filters.category !== 'all') {
        params.category = filters.category;
      }
      
      // Add tag filter
      if (filters.tags && filters.tags.length > 0) {
        params.tag = filters.tags[0]; // API supports single tag
      }
      
      // Add status filter for authors viewing their own posts
      if (filters.status && isAuthenticated) {
        params.status = filters.status;
      }
      
      let response;
      
      // Use search endpoint if search query exists
      if (debouncedSearch && debouncedSearch.trim()) {
        response = await postsAPI.searchPosts(debouncedSearch.trim(), params);
      } else {
        response = await postsAPI.getPosts(params);
      }
      
      // Handle different response structures
      // API returns: { success: true, data: { posts: [...], pagination: {...} } }
      let postsCount = 0;
      if (response) {
        // Check for success flag or direct data
        const responseData = response.data || response;
        const postsData = responseData.posts || responseData.data?.posts || [];
        const paginationData = responseData.pagination || responseData.data?.pagination || {};
        
        setPosts(Array.isArray(postsData) ? postsData : []);
        postsCount = Array.isArray(postsData) ? postsData.length : 0;
        
        setPagination(prev => ({
          ...prev,
          currentPage: paginationData.current || paginationData.currentPage || page,
          totalPages: paginationData.pages || paginationData.totalPages || 1,
          totalPosts: paginationData.total || paginationData.totalPosts || postsCount,
          hasNext: paginationData.hasNext || false,
          hasPrev: paginationData.hasPrev || false,
        }));
      }
      console.log('[useBlogPage] fetchPosts completed', { duration: Date.now() - startTime, postsCount });
    } catch (err) {
      console.error('[useBlogPage] fetchPosts error', { duration: Date.now() - startTime, error: err.message, isTimeout: err.code === 'ECONNABORTED', response: err.response?.data });
      
      // Provide specific error message for different error types
      let errorMessage = 'Failed to fetch posts';
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'Request timed out. The server is taking too long to respond. Please try again.';
      } else if (err.response?.status === 429) {
        // Rate limit error - provide a more user-friendly message
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (err.response?.data?.message) {
        // Don't show rate limit messages for GET requests
        if (err.response.data.message.includes('post creation limit')) {
          errorMessage = 'Unable to load posts. Please refresh the page.';
        } else {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.category, filters.tags, filters.sortBy, filters.status, pagination.postsPerPage, isAuthenticated]);

  /**
   * Fetch trending posts (top 5 by views)
   * Independent from main posts - failures won't affect main content
   */
  const fetchTrendingPosts = useCallback(async () => {
    const startTime = Date.now();
    console.log('[useBlogPage] fetchTrendingPosts started');
    setTrendingLoading(true);
    try {
      const response = await postsAPI.getPosts({
        limit: 5,
        sort: 'views',
      });
      
      // Handle different response structures
      // API returns: { success: true, data: { posts: [...], pagination: {...} } }
      let count = 0;
      if (response) {
        const responseData = response.data || response;
        const postsData = responseData.posts || responseData.data?.posts || [];
        setTrendingPosts(Array.isArray(postsData) ? postsData : []);
        count = Array.isArray(postsData) ? postsData.length : 0;
        console.log('[useBlogPage] fetchTrendingPosts completed', { duration: Date.now() - startTime, count });
      }
    } catch (err) {
      console.error('[useBlogPage] fetchTrendingPosts error', { duration: Date.now() - startTime, error: err.message, isTimeout: err.code === 'ECONNABORTED' });
      // Set empty array on error - don't block UI
      setTrendingPosts([]);
    } finally {
      setTrendingLoading(false);
    }
  }, []);

  /**
   * Fetch categories with post counts
   * Independent from main posts - failures won't affect main content
   */
  const fetchCategories = useCallback(async () => {
    const startTime = Date.now();
    console.log('[useBlogPage] fetchCategories started');
    setCategoriesLoading(true);
    try {
      const response = await postsAPI.getCategories();
      
      // Handle different response structures
      // API returns: { success: true, data: { categories: [...] } }
      let count = 0;
      if (response) {
        // Handle nested data structure from API
        const responseData = response.data || response;
        const categoriesData = responseData.categories || responseData.data?.categories || responseData || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        count = Array.isArray(categoriesData) ? categoriesData.length : 0;
        console.log('[useBlogPage] fetchCategories completed', { duration: Date.now() - startTime, count, categoriesData });
      }
    } catch (err) {
      console.error('[useBlogPage] fetchCategories error', { duration: Date.now() - startTime, error: err.message, isTimeout: err.code === 'ECONNABORTED' });
      // Set empty array on error to prevent UI issues - don't block UI
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  /**
   * Like a post with optimistic update
   */
  const likePost = useCallback(async (postId) => {
    if (!isAuthenticated) {
      return { success: false, requiresAuth: true };
    }
    
    if (likingPosts.has(postId)) {
      return { success: false, message: 'Already processing' };
    }
    
    // Optimistic update
    const wasLiked = userLikedPosts.has(postId);
    
    setLikingPosts(prev => new Set([...prev, postId]));
    setUserLikedPosts(prev => {
      const newSet = new Set(prev);
      if (wasLiked) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
    
    // Update post like count optimistically
    setPosts(prev => prev.map(post => {
      if (post._id === postId) {
        return {
          ...post,
          likesCount: (post.likesCount || 0) + (wasLiked ? -1 : 1),
        };
      }
      return post;
    }));
    
    try {
      if (wasLiked) {
        await postsAPI.unlikePost(postId);
      } else {
        await postsAPI.likePost(postId);
      }
      return { success: true, liked: !wasLiked };
    } catch (err) {
      // Rollback on error
      setUserLikedPosts(prev => {
        const newSet = new Set(prev);
        if (wasLiked) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });
      
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            likesCount: (post.likesCount || 0) + (wasLiked ? 1 : -1),
          };
        }
        return post;
      }));
      
      toast.error('Failed to update like');
      return { success: false, error: err.message };
    } finally {
      setLikingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  }, [isAuthenticated, userLikedPosts, likingPosts]);

  /**
   * Unlike a post (alias for likePost toggle)
   */
  const unlikePost = useCallback((postId) => {
    return likePost(postId);
  }, [likePost]);

  /**
   * Delete a post
   */
  const deletePost = useCallback(async (postId) => {
    if (!isAuthenticated) {
      return { success: false, requiresAuth: true };
    }
    
    try {
      await postsAPI.deletePost(postId);
      
      // Remove from local state
      setPosts(prev => prev.filter(post => post._id !== postId));
      setPagination(prev => ({
        ...prev,
        totalPosts: Math.max(0, prev.totalPosts - 1),
      }));
      
      toast.success('Post deleted successfully');
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete post');
      return { success: false, error: err.message };
    }
  }, [isAuthenticated]);

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: null,
      tags: [],
      sortBy: 'latest',
      status: null,
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  /**
   * Go to specific page
   */
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchPosts(page);
    }
  }, [fetchPosts, pagination.totalPages]);

  /**
   * Check if current user is the author of a post
   */
  const isPostAuthor = useCallback((post) => {
    if (!user || !post?.author) return false;
    const authorId = post.author._id || post.author;
    return user._id === authorId || user.id === authorId;
  }, [user]);

  /**
   * Get user role for display purposes
   */
  const userRole = useMemo(() => {
    if (!isAuthenticated || !user) return 'guest';
    // Check if user has any posts (simplified author check)
    return 'reader'; // Will be enhanced with actual role check
  }, [isAuthenticated, user]);

  // Initial data fetch with cleanup
  useEffect(() => {
    const abortController = new AbortController();
    
    // Fetch all data
    fetchPosts(1);
    fetchTrendingPosts();
    fetchCategories();
    
    // Cleanup function to cancel requests on unmount
    return () => {
      abortController.abort();
      console.log('[useBlogPage] Component unmounted, requests cancelled');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when debounced search or filters change
  useEffect(() => {
    fetchPosts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.category, filters.tags, filters.sortBy, filters.status]);

  return {
    // State
    posts,
    loading,
    error,
    pagination,
    filters,
    trendingPosts,
    categories,
    userLikedPosts,
    userFollowedAuthors,
    
    // Loading states
    trendingLoading,
    categoriesLoading,
    
    // User info
    user,
    isAuthenticated,
    userRole,
    
    // Actions
    fetchPosts,
    fetchTrendingPosts,
    fetchCategories,
    likePost,
    unlikePost,
    deletePost,
    updateFilters,
    clearFilters,
    goToPage,
    
    // Helpers
    isPostAuthor,
    isLiking: (postId) => likingPosts.has(postId),
    isLiked: (postId) => userLikedPosts.has(postId),
  };
};

export default useBlogPage;
