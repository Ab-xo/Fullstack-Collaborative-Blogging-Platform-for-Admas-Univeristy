import AuditLog from '../models/AuditLog.js';
import { getSettings } from '../middleware/settingsMiddleware.js';

/**
 * Service for handling audit log operations
 */
class AuditLogService {
  /**
   * Check if audit logging is enabled
   */
  static async isAuditEnabled() {
    try {
      const settings = await getSettings();
      return settings?.audit?.enabled !== false; // Default to true
    } catch (error) {
      return true; // Default to enabled on error
    }
  }

  /**
   * Log user action with comprehensive error handling
   */
  static async logAction(action, resourceType, resourceId, performedBy, metadata = {}, req = null) {
    try {
      // Check if audit logging is enabled
      const isEnabled = await this.isAuditEnabled();
      if (!isEnabled) {
        return null;
      }

      const auditData = {
        action,
        resourceType,
        resourceId,
        performedBy,
        metadata: new Map(Object.entries(metadata))
      };

      // Add request information if available
      if (req) {
        auditData.ipAddress = req.ip ||
          req.connection?.remoteAddress ||
          req.socket?.remoteAddress ||
          'Unknown';

        auditData.userAgent = req.get('User-Agent') || 'Unknown';
      }

      const auditLog = await AuditLog.logAction(auditData);

      console.log(`📝 Audit log created: ${action} by ${performedBy}`);
      return auditLog;
    } catch (error) {
      console.error('❌ Error creating audit log:', error);
      // Don't throw error to avoid breaking the main operation
      return null;
    }
  }

  /**
   * Log user registration
   */
  static async logUserRegistration(userId, req = null) {
    return await this.logAction(
      'user_registered',
      'user',
      userId,
      userId,
      {
        description: 'User registered for the platform',
        userType: 'new'
      },
      req
    );
  }

  /**
   * Log user approval
   */
  static async logUserApproval(userId, adminId, roles, req = null) {
    return await this.logAction(
      'user_approved',
      'user',
      userId,
      adminId,
      {
        description: 'User account approved by admin',
        assignedRoles: roles,
        approvedBy: adminId
      },
      req
    );
  }

  /**
   * Log user rejection
   */
  static async logUserRejection(userId, adminId, reason, req = null) {
    return await this.logAction(
      'user_rejected',
      'user',
      userId,
      adminId,
      {
        description: 'User account rejected by admin',
        reason: reason || 'No reason provided',
        rejectedBy: adminId
      },
      req
    );
  }

  /**
   * Log user login
   */
  static async logUserLogin(userId, req = null) {
    return await this.logAction(
      'login',
      'auth',
      userId,
      userId,
      {
        description: 'User logged in successfully',
        loginMethod: 'email_password'
      },
      req
    );
  }

  /**
   * Log user logout
   */
  static async logUserLogout(userId, req = null) {
    return await this.logAction(
      'logout',
      'auth',
      userId,
      userId,
      { description: 'User logged out' },
      req
    );
  }

  /**
   * Log email verification
   */
  static async logEmailVerification(userId, req = null) {
    return await this.logAction(
      'email_verified',
      'auth',
      userId,
      userId,
      { description: 'User verified their email address' },
      req
    );
  }

  /**
   * Log password reset request
   */
  static async logPasswordResetRequest(userId, req = null) {
    return await this.logAction(
      'password_reset_requested',
      'auth',
      userId,
      userId,
      { description: 'User requested password reset' },
      req
    );
  }

  /**
   * Log password reset
   */
  static async logPasswordReset(userId, req = null) {
    return await this.logAction(
      'password_reset',
      'auth',
      userId,
      userId,
      { description: 'User successfully reset their password' },
      req
    );
  }

  /**
   * Log password change
   */
  static async logPasswordChange(userId, req = null) {
    return await this.logAction(
      'password_changed',
      'auth',
      userId,
      userId,
      { description: 'User changed their password' },
      req
    );
  }

  /**
   * Log profile update
   */
  static async logProfileUpdate(userId, updates, req = null) {
    return await this.logAction(
      'profile_updated',
      'profile',
      userId,
      userId,
      {
        description: 'User updated their profile',
        updatedFields: Object.keys(updates)
      },
      req
    );
  }

  /**
   * Log avatar upload
   */
  static async logAvatarUpload(userId, req = null) {
    return await this.logAction(
      'avatar_uploaded',
      'profile',
      userId,
      userId,
      { description: 'User uploaded a new avatar' },
      req
    );
  }

  /**
   * Log AI Suggestion
   */
  static async logAISuggestion(userId, category, req = null) {
    return await this.logAction(
      'ai_suggestion_requested',
      'ai',
      userId,
      userId,
      { description: `AI suggestion requested for category: ${category}`, category },
      req
    );
  }

  /**
   * Log AI Grammar Check
   */
  static async logAIGrammarCheck(userId, req = null) {
    return await this.logAction(
      'ai_grammar_check',
      'ai',
      userId,
      userId,
      { description: 'AI grammar check performed' },
      req
    );
  }

  /**
   * Log AI Chat Interaction
   */
  static async logAIChatInteraction(userId, req = null) {
    return await this.logAction(
      'ai_chat_interaction',
      'ai',
      userId,
      userId,
      { description: 'AI chat assistant interaction' },
      req
    );
  }

  /**
   * Log Review Submission
   */
  static async logPostReview(postId, userId, status, req = null) {
    return await this.logAction(
      'post_reviewed',
      'review',
      postId,
      userId,
      { description: `Review submitted with status: ${status}`, status },
      req
    );
  }

  /**
   * Log Review Request
   */
  static async logReviewRequest(postId, userId, req = null) {
    return await this.logAction(
      'review_requested',
      'review',
      postId,
      userId,
      { description: 'Peer review requested for post' },
      req
    );
  }

  /**
   * Log Collaboration Invite
   */
  static async logCollaborationInvite(postId, invitedBy, invitedUser, role, req = null) {
    return await this.logAction(
      'collaboration_invited',
      'collaboration',
      postId,
      invitedBy,
      {
        description: `User ${invitedUser} invited as ${role}`,
        invitedUser,
        role
      },
      req
    );
  }

  /**
   * Log user deletion
   */
  static async logUserDeletion(userId, adminId, req = null) {
    return await this.logAction(
      'user_deleted',
      'user',
      userId,
      adminId,
      {
        description: 'User account deleted by admin',
        deletedBy: adminId
      },
      req
    );
  }

  /**
   * Log failed action
   */
  static async logFailedAction(action, resourceType, resourceId, performedBy, error, req = null) {
    return await this.logAction(
      action,
      resourceType,
      resourceId,
      performedBy,
      {
        description: `Action failed: ${action}`,
        error: {
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        success: false
      },
      req
    );
  }

  /**
   * Get user activity
   */
  static async getUserActivity(userId, limit = 50) {
    try {
      return await AuditLog.getUserActivity(userId, limit);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  }

  /**
   * Get recent system activity
   */
  static async getRecentActivity(days = 7, limit = 100) {
    try {
      return await AuditLog.getRecentActivity(days, limit);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  /**
   * Get system statistics
   */
  static async getSystemStats(days = 30) {
    try {
      const result = await AuditLog.getSystemStats(days);
      return result[0] || {};
    } catch (error) {
      console.error('Error fetching system stats:', error);
      return {};
    }
  }

  /**
   * Log Collaboration Response
   */
  static async logCollaborationResponse(postId, userId, status, req = null) {
    const action = status === 'accepted' ? 'collaboration_accepted' : 'collaboration_declined';
    return await this.logAction(
      action,
      'collaboration',
      postId,
      userId,
      { description: `Collaboration invitation ${status}`, status },
      req
    );
  }

  /**
   * Log Collaboration Left
   */
  static async logCollaborationLeft(postId, userId, req = null) {
    return await this.logAction(
      'collaboration_left',
      'collaboration',
      postId,
      userId,
      { description: 'User left the collaboration' },
      req
    );
  }

  /**
   * Clean up old logs
   */
  static async cleanupOldLogs(daysToKeep = 90) {
    try {
      return await AuditLog.cleanupOldLogs(daysToKeep);
    } catch (error) {
      console.error('Error cleaning up old logs:', error);
      return { deletedCount: 0 };
    }
  }

  /**
   * Log Program Created
   */
  static async logProgramCreated(programId, userId, name, req = null) {
    return await this.logAction(
      'program_created',
      'program',
      programId,
      userId,
      { description: `Academic Program created: ${name}`, name },
      req
    );
  }

  /**
   * Log Program Updated
   */
  static async logProgramUpdated(programId, userId, name, req = null) {
    return await this.logAction(
      'program_updated',
      'program',
      programId,
      userId,
      { description: `Academic Program updated: ${name}`, name },
      req
    );
  }

  /**
   * Log Program Deleted
   */
  static async logProgramDeleted(programId, userId, name, req = null) {
    return await this.logAction(
      'program_deleted',
      'program',
      programId,
      userId,
      { description: `Academic Program deleted: ${name}`, name },
      req
    );
  }

  /**
   * Log Programs Reordered
   */
  static async logProgramsReordered(userId, count, req = null) {
    return await this.logAction(
      'program_reordered',
      'system',
      userId, // Use userId as placeholder resourceId for system level reorder
      userId,
      { description: `Reordered ${count} programs`, count },
      req
    );
  }

  /**
   * Search audit logs
   */
  static async searchLogs(query = {}, page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        AuditLog.find(query)
          .populate('performedBy', 'firstName lastName email roles profile.avatar')
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        AuditLog.countDocuments(query)
      ]);

      return {
        logs,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: logs.length,
          totalCount: total
        }
      };
    } catch (error) {
      console.error('Error searching audit logs:', error);
      return { logs: [], pagination: { current: page, total: 0, count: 0, totalCount: 0 } };
    }
  }
}

export default AuditLogService;