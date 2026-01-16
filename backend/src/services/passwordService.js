import User from '../models/User.js';
import PasswordReset from '../models/PasswordReset.js';
import emailService from './emailService.js';
import { generateResetUrl } from '../utils/helpers.js';

class PasswordService {
  async requestPasswordReset(email) {
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      return { success: true };
    }

    // Check if user has too many recent reset attempts
    const recentAttempts = await PasswordReset.countDocuments({
      email,
      createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
    });

    if (recentAttempts >= 3) {
      return { 
        success: false, 
        error: 'Too many reset attempts. Please try again later.' 
      };
    }

    // Create reset token
    const resetRecord = await PasswordReset.createResetToken(email);
    
    // Generate reset URL
    const resetUrl = generateResetUrl(resetRecord.token, email);

    // Send email
    const emailResult = await emailService.sendPasswordResetEmail(user, resetRecord.token, resetUrl);

    if (!emailResult.success) {
      console.log(`📧 Password reset token for ${email}: ${resetRecord.token}`);
      console.log(`📧 Reset URL: ${resetUrl}`);
    }

    return { success: true };
  }

  async resetPassword(token, newPassword, confirmPassword) {
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return { 
        success: false, 
        error: 'Passwords do not match' 
      };
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return { 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      };
    }

    // Validate token
    const resetRecord = await PasswordReset.validateToken(token);
    if (!resetRecord) {
      return { 
        success: false, 
        error: 'Invalid or expired reset token' 
      };
    }

    // Find user
    const user = await User.findByEmail(resetRecord.email);
    if (!user) {
      return { 
        success: false, 
        error: 'User not found' 
      };
    }

    // Check if new password is same as old password
    const isSamePassword = await user.isPasswordSame(newPassword);
    if (isSamePassword) {
      return { 
        success: false, 
        error: 'New password cannot be the same as old password' 
      };
    }

    // Update password
    await user.updatePassword(newPassword);

    // Mark token as used
    await PasswordReset.markAsUsed(token);

    // Send success email
    await emailService.sendPasswordResetSuccessEmail(user);

    return { success: true };
  }

  async validateResetToken(token) {
    const resetRecord = await PasswordReset.validateToken(token);
    if (!resetRecord) {
      return { valid: false, error: 'Invalid or expired reset token' };
    }

    return { valid: true, email: resetRecord.email };
  }

  async cleanupExpiredTokens() {
    return await PasswordReset.cleanupExpired();
  }
}

export default new PasswordService();