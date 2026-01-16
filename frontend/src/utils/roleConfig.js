/**
 * Role-Based View Configuration
 * 
 * Defines permissions and UI visibility for different user roles:
 * - Guest: Unauthenticated visitors
 * - Reader: Authenticated users who consume content
 * - Author: Users who create and manage their own posts
 */

/**
 * Role configuration definitions
 */
const ROLE_CONFIGS = {
  guest: {
    role: 'guest',
    canLike: false,
    canComment: false,
    canFollow: false,
    canShare: true, // External share only
    canSearch: true,
    canFilter: true,
    showStatusBadges: false,
    showEditDelete: false,
    showAnalytics: false,
    showCreateButton: false,
    visibleStatuses: ['published'],
    showFollowButton: false,
    showSignupPrompts: true,
  },
  reader: {
    role: 'reader',
    canLike: true,
    canComment: true,
    canFollow: true,
    canShare: true,
    canSearch: true,
    canFilter: true,
    showStatusBadges: false,
    showEditDelete: false,
    showAnalytics: false,
    showCreateButton: false,
    visibleStatuses: ['published'],
    showFollowButton: true,
    showSignupPrompts: false,
  },
  author: {
    role: 'author',
    canLike: true,
    canComment: true,
    canFollow: true,
    canShare: true,
    canSearch: true,
    canFilter: true,
    showStatusBadges: true, // For own posts
    showEditDelete: true, // For own posts
    showAnalytics: true, // For own posts
    showCreateButton: true,
    visibleStatuses: ['draft', 'pending', 'published', 'rejected'], // For own posts
    showFollowButton: true,
    showSignupPrompts: false,
  },
};

/**
 * Determine user role based on authentication state and user data
 * 
 * @param {object|null} user - The user object from auth context
 * @param {boolean} isAuthenticated - Whether the user is authenticated
 * @returns {string} - The user role ('guest', 'reader', or 'author')
 */
export const determineUserRole = (user, isAuthenticated = false) => {
  if (!isAuthenticated || !user) {
    return 'guest';
  }
  
  // Check if user has author-related roles
  const userRoles = user.roles || [];
  if (userRoles.includes('admin') || userRoles.includes('moderator') || userRoles.includes('author')) {
    return 'author';
  }
  
  // Default authenticated user is a reader
  return 'reader';
};

/**
 * Get role-based view configuration for a user
 * 
 * @param {object|null} user - The user object from auth context
 * @param {boolean} isAuthenticated - Whether the user is authenticated
 * @returns {object} - The role configuration object
 */
export const getRoleViewConfig = (user, isAuthenticated = false) => {
  const role = determineUserRole(user, isAuthenticated);
  return ROLE_CONFIGS[role] || ROLE_CONFIGS.guest;
};

/**
 * Check if a user can perform a specific action
 * 
 * @param {object|null} user - The user object
 * @param {boolean} isAuthenticated - Whether authenticated
 * @param {string} action - The action to check ('like', 'comment', 'follow', 'share', 'edit', 'delete')
 * @returns {boolean} - Whether the action is allowed
 */
export const canPerformAction = (user, isAuthenticated, action) => {
  const config = getRoleViewConfig(user, isAuthenticated);
  
  switch (action) {
    case 'like':
      return config.canLike;
    case 'comment':
      return config.canComment;
    case 'follow':
      return config.canFollow;
    case 'share':
      return config.canShare;
    case 'edit':
    case 'delete':
      return config.showEditDelete;
    case 'create':
      return config.showCreateButton;
    default:
      return false;
  }
};

/**
 * Check if user should see signup prompts for an action
 * 
 * @param {object|null} user - The user object
 * @param {boolean} isAuthenticated - Whether authenticated
 * @returns {boolean} - Whether to show signup prompts
 */
export const shouldShowSignupPrompt = (user, isAuthenticated) => {
  const config = getRoleViewConfig(user, isAuthenticated);
  return config.showSignupPrompts;
};

/**
 * Get visible post statuses for a user
 * 
 * @param {object|null} user - The user object
 * @param {boolean} isAuthenticated - Whether authenticated
 * @returns {string[]} - Array of visible status strings
 */
export const getVisibleStatuses = (user, isAuthenticated) => {
  const config = getRoleViewConfig(user, isAuthenticated);
  return config.visibleStatuses;
};

/**
 * Check if a post should be visible to a user based on status
 * 
 * @param {object} post - The post object
 * @param {object|null} user - The user object
 * @param {boolean} isAuthenticated - Whether authenticated
 * @returns {boolean} - Whether the post should be visible
 */
export const isPostVisibleToUser = (post, user, isAuthenticated) => {
  if (!post) return false;
  
  const visibleStatuses = getVisibleStatuses(user, isAuthenticated);
  const postStatus = post.status || 'published';
  
  // Published posts are visible to everyone
  if (postStatus === 'published') {
    return true;
  }
  
  // For non-published posts, check if user is the author
  if (isAuthenticated && user) {
    const authorId = post.author?._id || post.author;
    const userId = user._id || user.id;
    
    if (authorId === userId) {
      return visibleStatuses.includes(postStatus);
    }
  }
  
  return false;
};

/**
 * Check if user is the author of a post
 * 
 * @param {object} post - The post object
 * @param {object|null} user - The user object
 * @returns {boolean} - Whether the user is the post author
 */
export const isPostAuthor = (post, user) => {
  if (!post || !user) return false;
  
  const authorId = post.author?._id || post.author;
  const userId = user._id || user.id;
  
  return authorId === userId;
};

/**
 * Get post card configuration based on user role and ownership
 * 
 * @param {object} post - The post object
 * @param {object|null} user - The user object
 * @param {boolean} isAuthenticated - Whether authenticated
 * @returns {object} - Configuration for rendering the post card
 */
export const getPostCardConfig = (post, user, isAuthenticated) => {
  const roleConfig = getRoleViewConfig(user, isAuthenticated);
  const isOwner = isPostAuthor(post, user);
  
  return {
    ...roleConfig,
    isOwner,
    showEditButton: roleConfig.showEditDelete && isOwner,
    showDeleteButton: roleConfig.showEditDelete && isOwner,
    showStatusBadge: roleConfig.showStatusBadges && isOwner,
    showPostAnalytics: roleConfig.showAnalytics && isOwner,
    highlightAsOwn: isOwner,
  };
};

export default {
  determineUserRole,
  getRoleViewConfig,
  canPerformAction,
  shouldShowSignupPrompt,
  getVisibleStatuses,
  isPostVisibleToUser,
  isPostAuthor,
  getPostCardConfig,
  ROLE_CONFIGS,
};
