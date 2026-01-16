import express from 'express';
import {
  getAllPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  dislikePost,
  undislikePost,
  getUserPosts,
  getPostsByCategory,
  searchPosts,
  getCategories,
  getTags,
  approvePost,
  rejectPost,
  uploadFeaturedImage,
  upload,
  getFlaggedPosts
} from '../controllers/postController.js';
import { protect, optionalAuth, isAuthor } from '../middleware/authMiddleware.js';
import {
  validatePostData,
  validatePostUpdateData,
  validateSearchParams,
  validatePaginationParams,
  validateFilterParams,
  validateObjectId,
  validateCategoryParam,
  validateUserPostsParams,
  validateTagsParams
} from '../middleware/postValidation.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (no auth required)
// ============================================
router.get('/', optionalAuth, validatePaginationParams, validateFilterParams, getAllPosts);
router.get('/search', optionalAuth, validateSearchParams, searchPosts);
router.get('/categories', getCategories);
router.get('/tags', validateTagsParams, getTags);
router.get('/category/:category', validateCategoryParam, validatePaginationParams, getPostsByCategory);

// ============================================
// PROTECTED ROUTES (auth required)
// ============================================

// Moderation routes - MUST come before /:id to avoid route conflicts
router.get('/moderation/flagged', protect, getFlaggedPosts);

// Featured image upload
router.post('/upload-featured-image', protect, upload.single('featuredImage'), uploadFeaturedImage);

// Approve/Reject routes
router.put('/:id/approve', protect, validateObjectId('id'), approvePost);
router.put('/:id/reject', protect, validateObjectId('id'), rejectPost);

// User posts route
router.get('/user/:userId', protect, validateUserPostsParams, getUserPosts);

// Post CRUD operations
router.post('/', protect, isAuthor, validatePostData, createPost);
router.put('/:id', protect, validateObjectId('id'), validatePostUpdateData, updatePost);
router.delete('/:id', protect, validateObjectId('id'), deletePost);
router.post('/:id/like', protect, validateObjectId('id'), likePost);
router.delete('/:id/like', protect, validateObjectId('id'), unlikePost);
router.post('/:id/dislike', protect, validateObjectId('id'), dislikePost);
router.delete('/:id/dislike', protect, validateObjectId('id'), undislikePost);

// ============================================
// SINGLE POST ROUTE - PUBLIC (must be LAST to avoid conflicts)
// ============================================
router.get('/:id', validateObjectId('id'), getPost);

export default router;
