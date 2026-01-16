import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import verificationService from '../services/verificationService.js';

const router = express.Router();

/**
 * @route   GET /api/admin/verifications/pending
 * @desc    Get all pending alumni verifications
 * @access  Private/Admin
 */
router.get('/pending', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const pendingVerifications = await verificationService.getPendingVerifications();

  res.status(200).json({
    success: true,
    count: pendingVerifications.length,
    verifications: pendingVerifications
  });
}));

/**
 * @route   GET /api/admin/verifications/count
 * @desc    Get count of pending verifications
 * @access  Private/Admin
 */
router.get('/count', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const count = await verificationService.getPendingCount();

  res.status(200).json({
    success: true,
    count
  });
}));

/**
 * @route   GET /api/admin/verifications/:userId
 * @desc    Get verification status for a specific user
 * @access  Private/Admin
 */
router.get('/:userId', protect, authorize('admin'), asyncHandler(async (req, res) => {
  try {
    const status = await verificationService.getVerificationStatus(req.params.userId);

    res.status(200).json({
      success: true,
      ...status
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    throw error;
  }
}));

/**
 * @route   PUT /api/admin/verifications/:userId/approve
 * @desc    Approve an alumni verification
 * @access  Private/Admin
 */
router.put('/:userId/approve', protect, authorize('admin'), asyncHandler(async (req, res) => {
  try {
    const user = await verificationService.approveVerification(
      req.params.userId,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: `Alumni verification approved. University ID: ${user.universityId}`,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        universityId: user.universityId,
        verificationStatus: user.verificationStatus
      }
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    if (error.message.includes('not an alumni') || error.message.includes('already verified')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    throw error;
  }
}));

/**
 * @route   PUT /api/admin/verifications/:userId/reject
 * @desc    Reject an alumni verification
 * @access  Private/Admin
 */
router.put('/:userId/reject', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason || reason.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required'
    });
  }

  try {
    const user = await verificationService.rejectVerification(
      req.params.userId,
      req.user._id,
      reason
    );

    res.status(200).json({
      success: true,
      message: 'Alumni verification rejected',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        verificationStatus: user.verificationStatus
      }
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    if (error.message.includes('not an alumni')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    throw error;
  }
}));

export default router;
