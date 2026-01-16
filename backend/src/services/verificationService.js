import User from '../models/User.js';
import { generateId } from './idService.js';
import NotificationService from './notificationService.js';

/**
 * Verification Service
 * 
 * Handles alumni verification workflow including:
 * - Getting pending verifications
 * - Approving/rejecting verifications
 * - Managing verification status
 */

// Verification status constants
export const VERIFICATION_STATUS = {
  PENDING: 'pending_verification',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  NOT_REQUIRED: 'not_required'
};

/**
 * Get all pending alumni verifications
 * @returns {Promise<User[]>}
 */
export const getPendingVerifications = async () => {
  const pendingUsers = await User.find({
    roleApplication: 'alumni',
    verificationStatus: VERIFICATION_STATUS.PENDING
  })
  .select('firstName lastName email graduationYear verificationDocument createdAt universityId')
  .sort({ createdAt: 1 }); // Oldest first
  
  return pendingUsers;
};

/**
 * Get verification status for a user
 * @param {string} userId - User ID
 * @returns {Promise<{status: string, details: object}>}
 */
export const getVerificationStatus = async (userId) => {
  const user = await User.findById(userId)
    .select('verificationStatus verificationDocument roleApplication');
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return {
    status: user.verificationStatus || VERIFICATION_STATUS.NOT_REQUIRED,
    details: {
      roleApplication: user.roleApplication,
      document: user.verificationDocument,
      requiresVerification: user.roleApplication === 'alumni'
    }
  };
};


/**
 * Approve an alumni verification
 * @param {string} userId - User ID to approve
 * @param {string} adminId - Admin performing the approval
 * @returns {Promise<User>}
 */
export const approveVerification = async (userId, adminId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (user.roleApplication !== 'alumni') {
    throw new Error('User is not an alumni and does not require verification');
  }
  
  if (user.verificationStatus === VERIFICATION_STATUS.APPROVED) {
    throw new Error('User is already verified');
  }
  
  // Generate ADME ID for the alumni
  const graduationYear = parseInt(user.graduationYear) || new Date().getFullYear();
  const idResult = await generateId('alumni', graduationYear);
  
  // Update user with approval
  user.verificationStatus = VERIFICATION_STATUS.APPROVED;
  user.universityId = idResult.id;
  user.idSequence = idResult.sequence;
  user.idYear = idResult.year;
  user.status = 'approved';
  user.isActive = true;
  
  // Update verification document metadata
  if (user.verificationDocument) {
    user.verificationDocument.reviewedAt = new Date();
    user.verificationDocument.reviewedBy = adminId;
  } else {
    user.verificationDocument = {
      reviewedAt: new Date(),
      reviewedBy: adminId
    };
  }
  
  await user.save();
  
  // Send notification to user
  try {
    await NotificationService.createNotification({
      recipient: userId,
      type: 'account_approved',
      title: 'Account Verified',
      message: `Your alumni status has been verified. Your university ID is ${idResult.id}.`,
      data: { universityId: idResult.id }
    });
  } catch (err) {
    console.error('Failed to send approval notification:', err.message);
  }
  
  return user;
};

/**
 * Reject an alumni verification
 * @param {string} userId - User ID to reject
 * @param {string} adminId - Admin performing the rejection
 * @param {string} reason - Reason for rejection
 * @returns {Promise<User>}
 */
export const rejectVerification = async (userId, adminId, reason) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (user.roleApplication !== 'alumni') {
    throw new Error('User is not an alumni');
  }
  
  // Update user with rejection
  user.verificationStatus = VERIFICATION_STATUS.REJECTED;
  user.status = 'rejected';
  
  // Update verification document metadata
  if (user.verificationDocument) {
    user.verificationDocument.reviewedAt = new Date();
    user.verificationDocument.reviewedBy = adminId;
    user.verificationDocument.rejectionReason = reason;
  } else {
    user.verificationDocument = {
      reviewedAt: new Date(),
      reviewedBy: adminId,
      rejectionReason: reason
    };
  }
  
  await user.save();
  
  // Send notification to user
  try {
    await NotificationService.createNotification({
      recipient: userId,
      type: 'account_rejected',
      title: 'Verification Rejected',
      message: `Your alumni verification was rejected. Reason: ${reason}`,
      data: { reason }
    });
  } catch (err) {
    console.error('Failed to send rejection notification:', err.message);
  }
  
  return user;
};

/**
 * Get count of pending verifications
 * @returns {Promise<number>}
 */
export const getPendingCount = async () => {
  return User.countDocuments({
    roleApplication: 'alumni',
    verificationStatus: VERIFICATION_STATUS.PENDING
  });
};

/**
 * Set initial verification status based on affiliation
 * @param {string} affiliationType - User's affiliation type
 * @returns {string} Initial verification status
 */
export const getInitialVerificationStatus = (affiliationType) => {
  if (affiliationType === 'alumni') {
    return VERIFICATION_STATUS.PENDING;
  }
  return VERIFICATION_STATUS.NOT_REQUIRED;
};

export default {
  getPendingVerifications,
  getVerificationStatus,
  approveVerification,
  rejectVerification,
  getPendingCount,
  getInitialVerificationStatus,
  VERIFICATION_STATUS
};
