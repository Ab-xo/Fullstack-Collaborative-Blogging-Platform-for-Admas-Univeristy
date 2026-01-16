import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStatus
} from '../controllers/followController.js';

const router = express.Router();

// Follow/unfollow a user (requires authentication)
router.post('/:userId/follow', protect, followUser);
router.delete('/:userId/follow', protect, unfollowUser);

// Get follow status (requires authentication)
router.get('/:userId/follow/status', protect, getFollowStatus);

// Get followers and following (public)
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

export default router;
