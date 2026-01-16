import express from 'express';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
} from '../controllers/commentController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Comment routes for specific post
router.get('/posts/:postId/comments', optionalAuth, getComments);
router.post('/posts/:postId/comments', protect, createComment);

// Comment-specific routes
router.put('/comments/:id', protect, updateComment);
router.delete('/comments/:id', protect, deleteComment);
router.post('/comments/:id/like', protect, likeComment);
router.delete('/comments/:id/like', protect, unlikeComment);

export default router;
