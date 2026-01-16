import express from 'express';
import {
    submitReview,
    getReviews,
    requestReview
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateReviewData } from '../middleware/postValidation.js';

const router = express.Router();

router.get('/:postId/reviews', protect, getReviews);
router.post('/:postId/reviews', protect, validateReviewData, submitReview);
router.post('/:postId/request-review', protect, requestReview);

export default router;
