import BlogPost from '../models/blogpost/index.js';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import NotificationService from '../services/notificationService.js';
import Follow from '../models/Follow.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import socketService from '../services/socketService.js';
import cacheService, { CacheService } from '../services/cacheService.js';
import { getSettings } from '../middleware/settingsMiddleware.js';

// Configure multer for memory storage (Cloudinary upload)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @desc    Get all posts with enhanced filtering
// @route   GET /api/posts
// @access  Public
export const getAllPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      tag,
      sort = 'recent', // recent, popular, views
      adminView = false // Flag for admin access
    } = req.query;
    
    // Check if user is admin or moderator
    const isAdmin = req.user && req.user.roles && 
      (req.user.roles.includes('admin') || req.user.roles.includes('moderator'));
    
    // Check if admin view is requested
    const isAdminRequest = adminView === 'true' && isAdmin;
    
    // Try cache for public requests (non-admin, published posts only)
    if (!isAdminRequest && !status) {
      const cacheKey = CacheService.keys.posts(page, limit, category);
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return res.status(200).json(cached);
      }
    }
    
    // Build query
    const query = {};
    
    // For admin view, show all posts or filter by status
    // For non-admin users, only show published posts
    if (isAdminRequest) {
      // Admin can see all posts or filter by specific status
      if (status && status !== 'all') {
        query.status = status;
      }
      // If no status filter, show all posts for admin
    } else {
      // Non-admin users only see published posts
      query.status = 'published';
    }
    
    if (category && category !== 'all') query.category = category;
    if (tag) query.tags = tag;

    // Build sort criteria
    let sortCriteria = { publishedAt: -1, createdAt: -1 };
    if (sort === 'popular') {
      // Popular = combination of likes and views
      sortCriteria = { likesCount: -1, views: -1, publishedAt: -1 };
    } else if (sort === 'views' || sort === 'mostViewed') {
      sortCriteria = { views: -1, publishedAt: -1 };
    } else if (sort === 'likes' || sort === 'mostLiked') {
      sortCriteria = { likesCount: -1, publishedAt: -1 };
    } else if (sort === 'latest' || sort === 'recent') {
      sortCriteria = { publishedAt: -1, createdAt: -1 };
    }

    let postsQuery = BlogPost.find(query);
    
    // Skip population in test environment
    if (process.env.NODE_ENV !== 'test') {
      postsQuery = postsQuery.populate('author', 'firstName lastName email profile');
    }
    
    const posts = await postsQuery
      .sort(sortCriteria)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean()
      .exec();

    const count = await BlogPost.countDocuments(query);

    const response = {
      success: true,
      data: {
        posts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(count / limit),
          total: count,
          hasNext: parseInt(page) < Math.ceil(count / limit),
          hasPrev: parseInt(page) > 1
        }
      }
    };

    // Cache public responses
    if (!isAdminRequest && !status) {
      const cacheKey = CacheService.keys.posts(page, limit, category);
      await cacheService.set(cacheKey, response, CacheService.ttl.posts);
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getAllPosts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
export const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by ObjectId first, then by slug
    let post;
    if (mongoose.Types.ObjectId.isValid(id)) {
      post = await BlogPost.findById(id)
        .populate('author', 'firstName lastName email profile')
        .populate('coAuthors.user', 'firstName lastName email profile')
        .populate('coAuthors.addedBy', 'firstName lastName');
    }
    
    // If not found by ID or ID is invalid, try slug
    if (!post) {
      post = await BlogPost.findOne({ slug: id })
        .populate('author', 'firstName lastName email profile')
        .populate('coAuthors.user', 'firstName lastName email profile')
        .populate('coAuthors.addedBy', 'firstName lastName');
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Only increment views if:
    // 1. User is not the author of the post
    // 2. This is a unique view (tracked via cookie)
    // 3. The request has the 'track-view' header (to prevent double counting from React StrictMode)
    const shouldTrackView = req.headers['x-track-view'] === 'true';
    
    if (shouldTrackView) {
      const userId = req.user?.id;
      const isAuthor = userId && post.author._id.toString() === userId;
      
      // Create a unique cookie key for this specific post (use actual post ID)
      const viewCookieKey = `viewed_${post._id.toString()}`;
      const hasViewedBefore = req.cookies?.[viewCookieKey] === 'true';
      
      // Only increment if: not author AND not viewed before
      if (!isAuthor && !hasViewedBefore) {
        // Use findByIdAndUpdate with $inc to ensure atomic increment
        // This prevents race conditions from double-counting
        await BlogPost.findByIdAndUpdate(
          post._id,
          { $inc: { views: 1 } },
          { new: false } // Don't return the updated document
        );
        
        // Set a cookie for this specific post (expires in 24 hours)
        res.cookie(viewCookieKey, 'true', {
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          httpOnly: true,
          sameSite: 'lax'
        });
        
        // Update the post object for the response
        post.views = (post.views || 0) + 1;
      }
    }

    res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching post',
      error: error.message
    });
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, featuredImage, status, skipModeration } = req.body;

    // Get system settings
    const settings = await getSettings();
    const requirePostApproval = settings?.moderation?.requirePostApproval ?? true;
    const enableAIModeration = settings?.moderation?.enableAIModeration ?? true;

    // Import services dynamically to avoid circular dependencies
    const { autoModeratePost } = await import('../services/contentModerationService.js');
    const violationDetectionService = await import('../services/violationDetectionService.js');

    // Run content moderation before creating post (unless explicitly skipped by admin)
    let moderationResult = null;
    let violationReport = null;
    const userRoles = req.user.roles || [req.user.role];
    const isAdmin = userRoles.includes('admin');
    
    // Only run AI moderation if enabled in settings
    if (enableAIModeration && (!skipModeration || !isAdmin)) {
      // Run violation detection (Feature: ai-content-assistant, Requirements: 3.1, 3.3)
      violationReport = await violationDetectionService.default.analyzeForViolations(title, content);
      
      // Also run existing content moderation
      moderationResult = await autoModeratePost({
        _id: 'pending', // Temporary ID for moderation
        title,
        content,
        author: req.user._id
      }, {
        autoReject: false, // Don't auto-reject, let moderators decide
        notifyModerators: violationReport.hasViolations // Only notify if violations found
      });

      // If content is flagged as critical, reject immediately
      if (violationReport.severity === 'critical' || moderationResult.severity === 'critical') {
        return res.status(400).json({
          success: false,
          message: 'Your content has been flagged for policy violations and cannot be published.',
          moderation: {
            flags: violationReport.violations || moderationResult.flags,
            severity: violationReport.severity || moderationResult.severity,
            recommendation: 'Please review and revise your content.'
          }
        });
      }
    }

    // Determine post status based on settings and violations
    let finalStatus = status || 'draft';
    
    // If user wants to publish but post approval is required
    if (status === 'published' && requirePostApproval && !isAdmin) {
      finalStatus = 'pending'; // Force to pending for review
    }
    
    // If violations found, always set to pending
    if (status === 'pending' && violationReport?.hasViolations) {
      finalStatus = 'pending';
    } else if (moderationResult?.recommendation === 'review') {
      finalStatus = 'pending';
    }

    const post = await BlogPost.create({
      title,
      content,
      excerpt,
      category,
      tags,
      featuredImage,
      status: finalStatus,
      author: req.user._id,
      // Attach violation report (Feature: ai-content-assistant, Requirements: 3.3)
      violationReport: violationReport || {
        hasViolations: false,
        isClean: true,
        severity: 'none',
        violations: [],
        analyzedAt: new Date().toISOString()
      }
    });

    const populatedPost = await BlogPost.findById(post._id)
      .populate('author', 'firstName lastName email profile');

    // If post is submitted for review (pending) or flagged by moderation, notify moderators and admins
    if (status === 'pending' || moderationResult?.recommendation === 'review' || violationReport?.hasViolations) {
      try {
        // Find all admins and moderators - check both 'role' (singular) and 'roles' (array) fields
        const moderators = await User.find({ 
          $or: [
            { role: { $in: ['admin', 'moderator'] } },
            { roles: { $in: ['admin', 'moderator'] } }
          ],
          isActive: true 
        }).select('_id');
        
        if (moderators.length > 0) {
          const moderatorIds = moderators.map(m => m._id);
          const authorName = `${req.user.firstName} ${req.user.lastName}`;
          const result = await NotificationService.notifyModeratorsNewPost(post, authorName, moderatorIds);
          console.log(`Notified ${moderatorIds.length} moderators/admins about new pending post`);
        } else {
          console.log('No moderators/admins found to notify about pending post');
        }
      } catch (notifError) {
        console.error('Error notifying moderators:', notifError);
      }
    }

    res.status(201).json({
      success: true,
      message: violationReport?.hasViolations 
        ? 'Post created and flagged for moderator review due to potential violations'
        : moderationResult?.recommendation === 'review' 
          ? 'Post created and sent for review due to content flags' 
          : 'Post created successfully',
      post: populatedPost,
      moderation: moderationResult ? {
        analyzed: true,
        recommendation: moderationResult.recommendation,
        flags: moderationResult.flags?.length || 0
      } : null,
      violationReport: violationReport ? {
        hasViolations: violationReport.hasViolations,
        severity: violationReport.severity,
        violationCount: violationReport.violations?.length || 0
      } : null
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating post',
      error: error.message
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author, co-author (editor), admin, or moderator
    const userId = req.user._id || req.user.id;
    const postAuthorId = post.author._id || post.author;
    
    const isAuthor = postAuthorId.toString() === userId.toString();
    const userRoles = req.user.roles || [];
    const isAdmin = userRoles.includes('admin');
    const isModerator = userRoles.includes('moderator');
    
    // Check if user is a co-author with editor role
    const coAuthorEntry = post.coAuthors?.find(
      ca => ca.user.toString() === userId.toString()
    );
    const isCoAuthor = !!coAuthorEntry;
    const isEditor = coAuthorEntry?.role === 'editor';
    const isContributor = coAuthorEntry?.role === 'contributor';
    
    // Debug logging
    console.log('Update Post Authorization Check:', {
      isAuthor,
      isCoAuthor,
      isEditor,
      isContributor,
      isAdmin,
      isModerator,
      postAuthor: postAuthorId.toString(),
      userId: userId.toString(),
      userRoles,
      reqUserKeys: Object.keys(req.user)
    });
    
    // Moderators can only change status, not other fields
    if (!isAuthor && !isAdmin && !isModerator && !isEditor && !isContributor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post. You must be the author, editor, admin, or moderator.',
        debug: {
          isAuthor,
          isCoAuthor,
          isEditor,
          isAdmin,
          isModerator,
          postAuthor: postAuthorId.toString(),
          userId: userId.toString(),
          userRoles: userRoles
        }
      });
    }
    
    // If moderator, only allow status changes
    if (isModerator && !isAdmin && !isAuthor && !isEditor) {
      if (Object.keys(req.body).some(key => key !== 'status' && key !== 'moderationNotes')) {
        return res.status(403).json({
          success: false,
          message: 'Moderators can only change post status and add moderation notes'
        });
      }
    }
    
    // Contributors can only suggest changes (future feature), not directly edit
    if (isContributor && !isAuthor && !isAdmin && !isEditor) {
      return res.status(403).json({
        success: false,
        message: 'Contributors cannot directly edit posts. Please contact the author.'
      });
    }

    const { title, content, excerpt, category, tags, featuredImage, status, moderationNotes } = req.body;

    console.log('Update request body:', {
      hasTitle: !!title,
      hasContent: !!content,
      hasCategory: !!category,
      hasFeaturedImage: !!featuredImage,
      tagsType: typeof tags,
      tagsIsArray: Array.isArray(tags)
    });

    // Update fields based on permissions
    if (isAuthor || isAdmin || isEditor) {
      if (title) post.title = title;
      if (content) post.content = content;
      if (excerpt !== undefined) post.excerpt = excerpt;
      if (category) post.category = category;
      if (tags !== undefined) post.tags = tags;
      if (featuredImage !== undefined) post.featuredImage = featuredImage;
      
      // Track revision if co-author is editing
      if (isEditor && !isAuthor) {
        if (!post.revisions) post.revisions = [];
        post.revisions.push({
          content: post.content,
          title: post.title,
          editedBy: userId,
          changeNote: req.body.changeNote || 'Content updated by co-author'
        });
      }
    }
    
    // Handle status changes (author, admin, or moderator)
    const previousStatus = post.status;
    if (status && status !== post.status) {
      post.status = status;
      
      // If submitting for review (pending), notify moderators
      if (status === 'pending' && previousStatus !== 'pending') {
        try {
          const moderators = await User.find({ 
            $or: [
              { role: { $in: ['admin', 'moderator'] } },
              { roles: { $in: ['admin', 'moderator'] } }
            ],
            isActive: true 
          }).select('_id');
          
          if (moderators.length > 0) {
            const moderatorIds = moderators.map(m => m._id);
            const authorName = `${req.user.firstName} ${req.user.lastName}`;
            await NotificationService.notifyModeratorsNewPost(post, authorName, moderatorIds);
            console.log(`Notified ${moderatorIds.length} moderators/admins about post submitted for review`);
          }
        } catch (notifError) {
          console.error('Error notifying moderators about pending post:', notifError);
        }
      }
      
      // If approving (publishing), set moderation fields and notify
      if (status === 'published' && (isAdmin || isModerator)) {
        post.moderatedBy = req.user._id;
        post.moderatedAt = new Date();
        post.publishedAt = new Date();
        
        // Notify the author that their post was approved
        try {
          await NotificationService.notifyPostApproved(post, req.user._id);
          console.log('Notified author about post approval');
          
          // Notify followers about the new published post
          const followerIds = await Follow.getFollowerIds(post.author);
          if (followerIds.length > 0) {
            const author = await User.findById(post.author).select('firstName lastName');
            const authorName = author ? `${author.firstName} ${author.lastName}` : 'An author';
            await NotificationService.notifyFollowersNewPost(post.author, authorName, post, followerIds);
            console.log(`Notified ${followerIds.length} followers about new published post`);
          }
        } catch (notifError) {
          console.error('Error sending approval notifications:', notifError);
        }
      }
      
      // If rejecting, set moderation fields and notify
      if (status === 'rejected' && (isAdmin || isModerator)) {
        post.moderatedBy = req.user._id;
        post.moderatedAt = new Date();
        if (moderationNotes) {
          post.moderationNotes = moderationNotes;
        }
        
        // Notify the author that their post was rejected
        try {
          await NotificationService.notifyPostRejected(post, req.user._id, moderationNotes);
          console.log('Notified author about post rejection');
        } catch (notifError) {
          console.error('Error sending rejection notification:', notifError);
        }
      }
    }
    
    // Add moderation notes if provided
    if (moderationNotes && (isAdmin || isModerator)) {
      post.moderationNotes = moderationNotes;
    }

    await post.save();

    const updatedPost = await BlogPost.findById(post._id)
      .populate('author', 'firstName lastName email profile');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating post',
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : undefined
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author, admin, or moderator
    const userId = req.user._id || req.user.id;
    const postAuthorId = post.author._id || post.author;
    const isAuthor = postAuthorId.toString() === userId.toString();
    const userRoles = req.user.roles || [req.user.role] || [];
    const isAdmin = userRoles.includes('admin');
    const isModerator = userRoles.includes('moderator');

    // Authors can delete their own posts, admins and moderators can delete any post
    if (!isAuthor && !isAdmin && !isModerator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Import Comment model for cascade delete
    const Comment = (await import('../models/Comment.js')).default;
    
    // Delete all comments associated with this post (cascade delete)
    await Comment.deleteMany({ post: post._id });

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error.message
    });
  }
};

// @desc    Like post
// @route   POST /api/posts/:id/like
// @access  Private
export const likePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id).populate('author', 'firstName lastName');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already liked (to avoid duplicate notifications)
    const alreadyLiked = post.likes.includes(req.user._id);
    
    await post.addLike(req.user._id);

    // Send notification only if this is a new like
    if (!alreadyLiked) {
      try {
        const likerName = `${req.user.firstName} ${req.user.lastName}`;
        await NotificationService.notifyPostLike(post, req.user._id, likerName);
      } catch (notifError) {
        console.error('Error sending like notification:', notifError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Post liked successfully',
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error liking post',
      error: error.message
    });
  }
};

// @desc    Unlike post
// @route   DELETE /api/posts/:id/like
// @access  Private
export const unlikePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.removeLike(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Post unliked successfully',
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unliking post',
      error: error.message
    });
  }
};

// @desc    Dislike post
// @route   POST /api/posts/:id/dislike
// @access  Private
export const dislikePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id).populate('author', 'firstName lastName');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already disliked (to avoid duplicate notifications)
    const alreadyDisliked = post.dislikes.includes(req.user._id);

    await post.addDislike(req.user._id);

    // Send notification only if this is a new dislike
    if (!alreadyDisliked) {
      try {
        const dislikerName = `${req.user.firstName} ${req.user.lastName}`;
        await NotificationService.notifyPostDislike(post, req.user._id, dislikerName);
      } catch (notifError) {
        console.error('Error sending dislike notification:', notifError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Post disliked successfully',
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error disliking post',
      error: error.message
    });
  }
};

// @desc    Remove dislike from post
// @route   DELETE /api/posts/:id/dislike
// @access  Private
export const undislikePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.removeDislike(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Dislike removed successfully',
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing dislike',
      error: error.message
    });
  }
};

// @desc    Get user's posts
// @route   GET /api/posts/user/my-posts
// @access  Private
export const getUserPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const posts = await BlogPost.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await BlogPost.countDocuments({ author: req.user._id });

    res.status(200).json({
      success: true,
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalPosts: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user posts',
      error: error.message
    });
  }
};

// @desc    Get posts by category
// @route   GET /api/posts/category/:category
// @access  Public
export const getPostsByCategory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { category } = req.params;

    const posts = await BlogPost.find({ category, status: 'published' })
      .populate('author', 'firstName lastName email profile')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await BlogPost.countDocuments({ category, status: 'published' });

    res.status(200).json({
      success: true,
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalPosts: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching posts by category',
      error: error.message
    });
  }
};

// @desc    Search posts with enhanced functionality
// @route   GET /api/posts/search
// @access  Public
export const searchPosts = async (req, res) => {
  try {
    const { q, page = 1, limit = 10, category, tag, sort = 'recent', status } = req.query;

    // Validate search query
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
        field: 'q'
      });
    }

    // Check if user is admin or moderator
    const isAdmin = req.user && req.user.roles && 
      (req.user.roles.includes('admin') || req.user.roles.includes('moderator'));

    // Build search query
    const searchQuery = {
      $or: [
        { title: { $regex: q.trim(), $options: 'i' } },
        { content: { $regex: q.trim(), $options: 'i' } },
        { tags: { $regex: q.trim(), $options: 'i' } },
        { category: { $regex: q.trim(), $options: 'i' } }
      ]
    };

    // For non-admin users, only show published posts
    // For admin users, show posts based on status filter or all if no status specified
    if (!isAdmin) {
      searchQuery.status = 'published';
    } else if (status && status !== 'all') {
      searchQuery.status = status;
    }

    // Add additional filters
    if (category && category !== 'all') searchQuery.category = category;
    if (tag) searchQuery.tags = tag;

    // Build sort criteria (same as getAllPosts)
    let sortCriteria = { publishedAt: -1, createdAt: -1 };
    if (sort === 'popular') {
      sortCriteria = { likesCount: -1, views: -1, publishedAt: -1 };
    } else if (sort === 'views' || sort === 'mostViewed') {
      sortCriteria = { views: -1, publishedAt: -1 };
    } else if (sort === 'likes' || sort === 'mostLiked') {
      sortCriteria = { likesCount: -1, publishedAt: -1 };
    } else if (sort === 'latest' || sort === 'recent') {
      sortCriteria = { publishedAt: -1, createdAt: -1 };
    }

    let searchQueryBuilder = BlogPost.find(searchQuery);
    
    // Skip population in test environment
    if (process.env.NODE_ENV !== 'test') {
      searchQueryBuilder = searchQueryBuilder.populate('author', 'firstName lastName email profile');
    }
    
    let posts = await searchQueryBuilder
      .sort(sortCriteria)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean()
      .exec();

    // Also search by author name (firstName, lastName) for admin users
    if (isAdmin && posts.length < parseInt(limit)) {
      // Find users matching the search query
      const matchingUsers = await User.find({
        $or: [
          { firstName: { $regex: q.trim(), $options: 'i' } },
          { lastName: { $regex: q.trim(), $options: 'i' } },
          { email: { $regex: q.trim(), $options: 'i' } }
        ]
      }).select('_id').lean();

      if (matchingUsers.length > 0) {
        const userIds = matchingUsers.map(u => u._id);
        const authorQuery = {
          author: { $in: userIds },
          _id: { $nin: posts.map(p => p._id) } // Exclude already found posts
        };
        
        if (!isAdmin) {
          authorQuery.status = 'published';
        } else if (status && status !== 'all') {
          authorQuery.status = status;
        }

        let authorPostsQuery = BlogPost.find(authorQuery);
        if (process.env.NODE_ENV !== 'test') {
          authorPostsQuery = authorPostsQuery.populate('author', 'firstName lastName email profile');
        }

        const authorPosts = await authorPostsQuery
          .sort(sortCriteria)
          .limit(parseInt(limit) - posts.length)
          .lean()
          .exec();

        posts = [...posts, ...authorPosts];
      }
    }

    const count = await BlogPost.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      data: {
        posts,
        query: q.trim(),
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(count / limit),
          total: count,
          hasNext: parseInt(page) < Math.ceil(count / limit),
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error in searchPosts:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching posts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ==================== VALIDATION MIDDLEWARE ====================

/**
 * Validation rules for post creation
 */
export const validatePostCreation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['academic', 'research', 'thesis', 'tutorials', 'campus-life', 'events', 'clubs', 'sports', 'technology', 'innovation', 'engineering', 'science', 'culture', 'arts', 'literature', 'career', 'alumni', 'opinion', 'announcements', 'news', 'other'])
    .withMessage('Invalid category'),
  
  body('excerpt')
    .optional()
    .isLength({ max: 300 }).withMessage('Excerpt cannot exceed 300 characters'),
  
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 }).withMessage('Each tag cannot exceed 30 characters'),
  
  body('featuredImage')
    .optional()
    .isURL().withMessage('Featured image must be a valid URL'),
  
  body('status')
    .optional()
    .isIn(['draft', 'pending']).withMessage('Status must be draft or pending')
];

/**
 * Validation rules for post update
 */
export const validatePostUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  
  body('content')
    .optional()
    .trim()
    .isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
  
  body('category')
    .optional()
    .isIn(['academic', 'research', 'thesis', 'tutorials', 'campus-life', 'events', 'clubs', 'sports', 'technology', 'innovation', 'engineering', 'science', 'culture', 'arts', 'literature', 'career', 'alumni', 'opinion', 'announcements', 'news', 'other'])
    .withMessage('Invalid category'),
  
  body('excerpt')
    .optional()
    .isLength({ max: 300 }).withMessage('Excerpt cannot exceed 300 characters'),
  
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  
  body('featuredImage')
    .optional()
    .isURL().withMessage('Featured image must be a valid URL'),
  
  body('status')
    .optional()
    .isIn(['draft', 'pending', 'published', 'rejected', 'archived']).withMessage('Invalid status')
];

/**
 * Middleware to check validation results
 */
export const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// @desc    Get all categories with post counts
// @route   GET /api/posts/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get all tags with post counts
// @route   GET /api/posts/tags
// @access  Public
export const getTags = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const tags = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $project: { tag: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.json({
      success: true,
      data: { tags }
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tags',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};


// @desc    Get flagged posts (posts with violations)
// @route   GET /api/posts/moderation/flagged
// @access  Private (Moderator/Admin)
export const getFlaggedPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      severity, // filter by severity: low, medium, high, critical
      status = 'pending' // filter by post status
    } = req.query;

    // Check if user is admin or moderator
    // Support both 'role' (singular) and 'roles' (array) formats
    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    const isAuthorized = userRoles.some(role => ['admin', 'moderator'].includes(role));
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view flagged posts'
      });
    }

    // Build query for posts with violations
    const query = {
      'violationReport.hasViolations': true
    };

    // Filter by severity if specified
    if (severity && severity !== 'all') {
      query['violationReport.severity'] = severity;
    }

    // Filter by status if specified
    if (status && status !== 'all') {
      query.status = status;
    }

    // Sort by severity priority (critical first) then by creation date
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, none: 0 };
    
    const posts = await BlogPost.find(query)
      .populate('author', 'firstName lastName email profile')
      .sort({ 
        'violationReport.severity': -1, // This won't work directly, we'll sort in memory
        createdAt: -1 
      })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean()
      .exec();

    // Sort by severity in memory (since MongoDB can't sort by custom order)
    posts.sort((a, b) => {
      const severityA = severityOrder[a.violationReport?.severity] || 0;
      const severityB = severityOrder[b.violationReport?.severity] || 0;
      if (severityB !== severityA) return severityB - severityA;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const count = await BlogPost.countDocuments(query);

    // Get severity breakdown
    const severityStats = await BlogPost.aggregate([
      { $match: { 'violationReport.hasViolations': true } },
      { $group: { 
        _id: '$violationReport.severity', 
        count: { $sum: 1 } 
      }},
      { $project: { severity: '$_id', count: 1, _id: 0 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(count / limit),
          total: count,
          hasNext: parseInt(page) < Math.ceil(count / limit),
          hasPrev: parseInt(page) > 1
        },
        stats: {
          total: count,
          bySeverity: severityStats.reduce((acc, s) => {
            acc[s.severity] = s.count;
            return acc;
          }, {})
        }
      }
    });
  } catch (error) {
    console.error('Error fetching flagged posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flagged posts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Approve post (moderator/admin)
// @route   PUT /api/posts/:id/approve
// @access  Private (Moderator/Admin)
export const approvePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is admin or moderator
    if (!req.user.roles.includes('admin') && !req.user.roles.includes('moderator')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve posts'
      });
    }

    // Update post status
    post.status = 'published';
    post.moderatedBy = req.user._id;
    post.moderatedAt = new Date();
    post.publishedAt = new Date();
    
    if (req.body.moderationNotes) {
      post.moderationNotes = req.body.moderationNotes;
    }

    await post.save();

    // Send notification to author
    try {
      await NotificationService.notifyPostApproved(post, req.user._id);
    } catch (notifError) {
      console.error('Error sending approval notification:', notifError);
    }

    // Notify followers about the new published post
    try {
      const followerIds = await Follow.getFollowerIds(post.author);
      if (followerIds.length > 0) {
        const author = await User.findById(post.author).select('firstName lastName');
        const authorName = author ? `${author.firstName} ${author.lastName}` : 'An author';
        await NotificationService.notifyFollowersNewPost(post.author, authorName, post, followerIds);
      }
    } catch (followerNotifError) {
      console.error('Error notifying followers:', followerNotifError);
    }

    // Populate with error handling
    let updatedPost;
    try {
      updatedPost = await BlogPost.findById(post._id)
        .populate('author', 'firstName lastName email profile')
        .populate('moderatedBy', 'firstName lastName email');
    } catch (populateError) {
      console.warn('Error populating post fields:', populateError);
      // If populate fails, return the post without populated fields
      updatedPost = post;
    }

    res.status(200).json({
      success: true,
      message: 'Post approved and published successfully',
      data: { post: updatedPost }
    });
  } catch (error) {
    console.error('Error approving post:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving post',
      error: error.message
    });
  }
};

// @desc    Reject post (moderator/admin)
// @route   PUT /api/posts/:id/reject
// @access  Private (Moderator/Admin)
export const rejectPost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is admin or moderator
    if (!req.user.roles.includes('admin') && !req.user.roles.includes('moderator')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject posts'
      });
    }

    const { moderationNotes } = req.body;

    // Update post status
    post.status = 'rejected';
    post.moderatedBy = req.user._id;
    post.moderatedAt = new Date();
    
    if (moderationNotes) {
      post.moderationNotes = moderationNotes;
    }

    await post.save();

    // Send notification to author
    try {
      await NotificationService.notifyPostRejected(post, req.user._id, moderationNotes);
    } catch (notifError) {
      console.error('Error sending rejection notification:', notifError);
    }

    // Populate with error handling
    let updatedPost;
    try {
      updatedPost = await BlogPost.findById(post._id)
        .populate('author', 'firstName lastName email profile')
        .populate('moderatedBy', 'firstName lastName email');
    } catch (populateError) {
      console.warn('Error populating post fields:', populateError);
      // If populate fails, return the post without populated fields
      updatedPost = post;
    }

    res.status(200).json({
      success: true,
      message: 'Post rejected successfully',
      data: { post: updatedPost }
    });
  } catch (error) {
    console.error('Error rejecting post:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting post',
      error: error.message
    });
  }
};

// @desc    Upload featured image to Cloudinary
// @route   POST /api/posts/upload-featured-image
// @access  Private
export const uploadFeaturedImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload image to Cloudinary using buffer
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'admas-blog/featured-images',
      transformation: [
        { width: 1200, height: 630, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Featured image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    console.error('Featured image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload featured image',
      error: error.message
    });
  }
};
