import express from 'express';
import { getProfile, updateProfile, deleteProfileImage, updateProfileImageUrl, upload } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile routes
router.get('/', getProfile);
router.put('/', upload.single('profileImage'), updateProfile);
router.put('/image-url', updateProfileImageUrl);
router.delete('/image', deleteProfileImage);

export default router;
