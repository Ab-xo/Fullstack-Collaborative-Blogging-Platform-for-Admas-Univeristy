/**
 * ============================================================================
 * COLLABORATION ROUTES
 * ============================================================================
 * Routes for co-authoring and collaboration features
 */

import express from 'express';
import {
  inviteCollaborator,
  respondToInvitation,
  removeCollaborator,
  getCollaborators,
  getMyInvitations,
  getCollaborativePosts,
  leaveCollaboration,
  searchUsersToInvite
} from '../controllers/collaborationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateInviteData } from '../middleware/postValidation.js';

const router = express.Router();

// User's collaboration dashboard
router.get('/invitations', protect, getMyInvitations);
router.get('/posts', protect, getCollaborativePosts);
router.get('/search-users', protect, searchUsersToInvite);

// Post-specific collaboration routes
router.get('/posts/:postId/collaborators', protect, getCollaborators);
router.post('/posts/:postId/collaborators/invite', protect, validateInviteData, inviteCollaborator);
router.post('/posts/:postId/collaborators/respond', protect, respondToInvitation);
router.post('/posts/:postId/collaborators/leave', protect, leaveCollaboration);
router.delete('/posts/:postId/collaborators/:userId', protect, removeCollaborator);

export default router;
