/**
 * User Validation Service
 * Provides validation checks for user registration and approval
 */

export const validateUserForApproval = async (user) => {
  const validationResults = [];

  // Check 1: University ID validation
  const idValidation = user.validateUniversityId();
  if (!idValidation.valid) {
    validationResults.push({
      type: "invalid_id",
      message: idValidation.reason,
      severity: "error"
    });
  }

  // Check 2: Required fields validation
  const fieldsValidation = user.validateRequiredFields();
  if (!fieldsValidation.valid) {
    validationResults.push({
      type: "incomplete_info",
      message: fieldsValidation.reason,
      severity: "error"
    });
  }

  // Check 3: Role-specific credentials
  const roleValidation = user.validateRoleCredentials();
  if (!roleValidation.valid) {
    validationResults.push({
      type: "role_mismatch",
      message: roleValidation.reason,
      severity: "error"
    });
  }

  // Check 4: Duplicate account
  const duplicateValidation = await user.checkDuplicateAccount();
  if (!duplicateValidation.valid) {
    validationResults.push({
      type: "duplicate_account",
      message: duplicateValidation.reason,
      severity: "error"
    });
  }

  // Check 5: Email verification
  if (!user.isEmailVerified) {
    validationResults.push({
      type: "verification_failed",
      message: "Email not verified",
      severity: "warning"
    });
  }

  // Check 6: Suspicious patterns
  const suspiciousCheck = checkSuspiciousPatterns(user);
  if (suspiciousCheck.suspicious) {
    validationResults.push({
      type: "suspicious_activity",
      message: suspiciousCheck.reason,
      severity: "warning"
    });
  }

  return {
    isValid: validationResults.filter(r => r.severity === "error").length === 0,
    validationResults,
    canApprove: validationResults.filter(r => r.severity === "error").length === 0,
    warnings: validationResults.filter(r => r.severity === "warning")
  };
};

/**
 * Check for suspicious patterns in user data
 */
const checkSuspiciousPatterns = (user) => {
  // Check for spam-like names
  const spamPatterns = /[0-9]{5,}|admin|test|spam|bot/i;
  if (spamPatterns.test(user.firstName) || spamPatterns.test(user.lastName)) {
    return {
      suspicious: true,
      reason: "Suspicious name pattern detected"
    };
  }

  // Check for multiple registrations from same IP (would need to be tracked)
  // This is a placeholder for future implementation

  return { suspicious: false };
};

/**
 * Get rejection reason details
 */
export const getRejectionReasonDetails = (reasonCode) => {
  const reasons = {
    invalid_id: {
      title: "Invalid University ID",
      description: "University ID doesn't match records or is incorrect format",
      suggestion: "Verify university ID with official records"
    },
    incomplete_info: {
      title: "Incomplete Information",
      description: "Missing required fields or invalid information provided",
      suggestion: "Ensure all required fields are filled correctly"
    },
    role_mismatch: {
      title: "Role Mismatch",
      description: "Role doesn't match provided credentials or documentation",
      suggestion: "Provide appropriate credentials for selected role"
    },
    duplicate_account: {
      title: "Duplicate Account",
      description: "User already has an active account or duplicate registration",
      suggestion: "Use existing account or contact support"
    },
    suspicious_activity: {
      title: "Suspicious Activity",
      description: "Suspicious behavior or potential bot/spam account",
      suggestion: "Contact support to verify account legitimacy"
    },
    policy_violation: {
      title: "Policy Violation",
      description: "Violates community guidelines or terms of service",
      suggestion: "Review and comply with community guidelines"
    },
    verification_failed: {
      title: "Verification Failed",
      description: "Email verification failed or invalid verification token",
      suggestion: "Verify email address and try again"
    },
    missing_docs: {
      title: "Missing Documentation",
      description: "Required documentation (certificate, credentials) not provided",
      suggestion: "Provide required documentation for verification"
    }
  };

  return reasons[reasonCode] || {
    title: "Application Rejected",
    description: "Your application has been rejected",
    suggestion: "Contact support for more information"
  };
};

export default {
  validateUserForApproval,
  getRejectionReasonDetails
};
