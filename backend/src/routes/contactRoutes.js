import express from 'express';
import {
  submitContactForm,
  getContactMessages,
  getContactMessage,
  updateContactStatus,
  replyToContact,
  deleteContactMessage
} from '../controllers/contactController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - submit contact form
router.post('/', submitContactForm);

// Admin routes - require authentication and admin role
router.use(protect);
router.use(isAdmin);

router.get('/', getContactMessages);
router.get('/:id', getContactMessage);
router.put('/:id/status', updateContactStatus);
router.post('/:id/reply', replyToContact);
router.delete('/:id', deleteContactMessage);

export default router;
