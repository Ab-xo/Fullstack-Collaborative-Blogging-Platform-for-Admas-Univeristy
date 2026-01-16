/**
 * Terms Service - Handles Terms of Service, Privacy Policy, and Content Guidelines
 */
import Terms from '../models/Terms.js';
import User from '../models/User.js';
import cacheService, { CacheService } from './cacheService.js';

class TermsService {
  /**
   * Get current active terms by type
   * @param {string} type - 'tos' | 'privacy' | 'content-guidelines'
   */
  async getCurrentTerms(type) {
    // Try cache first
    const cacheKey = CacheService.keys.terms(type);
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const terms = await Terms.getCurrentByType(type);
    
    // Cache for 1 hour
    if (terms) {
      await cacheService.set(cacheKey, terms, CacheService.ttl.terms);
    }
    
    return terms;
  }

  /**
   * Get specific version of terms
   * @param {string} type - Terms type
   * @param {string} version - Version string (e.g., '1.0.0')
   */
  async getTermsVersion(type, version) {
    return Terms.findOne({ type, version });
  }

  /**
   * Get all versions of a terms type
   * @param {string} type - Terms type
   */
  async getAllVersions(type) {
    return Terms.getAllVersions(type);
  }

  /**
   * Create new terms document
   * @param {Object} termsData - Terms document data
   */
  async createTerms(termsData) {
    // Deactivate old versions
    await Terms.deactivateOldVersions(termsData.type, termsData.version);
    
    const terms = new Terms({
      ...termsData,
      isActive: true
    });
    
    const saved = await terms.save();
    
    // Invalidate cache for this terms type
    await cacheService.del(CacheService.keys.terms(termsData.type));
    
    return saved;
  }

  /**
   * Record user acceptance of terms
   * @param {string} userId - User ID
   * @param {string} type - Terms type
   * @param {string} version - Terms version
   * @param {string} ipAddress - User's IP address
   */
  async recordAcceptance(userId, type, version, ipAddress = null) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Remove existing acceptance for this type (replace with new)
    user.termsAcceptances = user.termsAcceptances.filter(
      acc => acc.type !== type
    );

    // Add new acceptance
    user.termsAcceptances.push({
      type,
      version,
      acceptedAt: new Date(),
      ipAddress
    });

    await user.save();
    return user.termsAcceptances;
  }

  /**
   * Check if user has accepted current version of terms
   * @param {string} userId - User ID
   * @param {string} type - Terms type
   */
  async checkAcceptance(userId, type) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const currentTerms = await this.getCurrentTerms(type);
    if (!currentTerms) {
      return { accepted: false, needsUpdate: false, currentVersion: null };
    }

    const acceptance = user.termsAcceptances?.find(acc => acc.type === type);
    
    if (!acceptance) {
      return { 
        accepted: false, 
        needsUpdate: true, 
        currentVersion: currentTerms.version 
      };
    }

    const needsUpdate = acceptance.version !== currentTerms.version;
    
    return {
      accepted: true,
      needsUpdate,
      acceptedVersion: acceptance.version,
      currentVersion: currentTerms.version,
      acceptedAt: acceptance.acceptedAt
    };
  }

  /**
   * Get user's acceptance status for all terms types
   * @param {string} userId - User ID
   */
  async getUserAcceptanceStatus(userId) {
    const types = ['tos', 'privacy', 'content-guidelines'];
    const status = {};

    for (const type of types) {
      status[type] = await this.checkAcceptance(userId, type);
    }

    return status;
  }

  /**
   * Check if user needs to accept any terms before proceeding
   * @param {string} userId - User ID
   * @param {string[]} requiredTypes - Array of required terms types
   */
  async checkRequiredAcceptances(userId, requiredTypes = ['tos', 'privacy']) {
    const missing = [];

    for (const type of requiredTypes) {
      const status = await this.checkAcceptance(userId, type);
      if (!status.accepted || status.needsUpdate) {
        missing.push({
          type,
          currentVersion: status.currentVersion,
          needsUpdate: status.needsUpdate
        });
      }
    }

    return {
      allAccepted: missing.length === 0,
      missing
    };
  }
}

export default new TermsService();
