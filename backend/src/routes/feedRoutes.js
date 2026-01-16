import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getFollowingFeed,
  getFollowedAuthors,
  getSuggestedAuthors
} from '../controllers/feedController.js';

const router = express.Router();

// All feed routes require authentication
router.get('/following', protect, getFollowingFeed);
router.get('/following/authors', protect, getFollowedAuthors);
router.get('/suggestions', protect, getSuggestedAuthors);

export default router;
