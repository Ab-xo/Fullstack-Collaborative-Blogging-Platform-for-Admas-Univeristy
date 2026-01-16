/**
 * Terms Controller - Handles Terms of Service, Privacy Policy, and Content Guidelines
 */
import termsService from '../services/termsService.js';

/**
 * Get current terms by type
 * GET /api/terms/:type
 */
export const getCurrentTerms = async (req, res) => {
  try {
    const { type } = req.params;
    
    const validTypes = ['tos', 'privacy', 'content-guidelines'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid terms type. Must be: tos, privacy, or content-guidelines'
      });
    }

    const terms = await termsService.getCurrentTerms(type);
    
    if (!terms) {
      return res.status(404).json({
        success: false,
        message: `No ${type} terms found`
      });
    }

    res.json({
      success: true,
      data: terms
    });
  } catch (error) {
    console.error('Error getting terms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get terms'
    });
  }
};

/**
 * Get all versions of terms by type
 * GET /api/terms/:type/versions
 */
export const getTermsVersions = async (req, res) => {
  try {
    const { type } = req.params;
    
    const validTypes = ['tos', 'privacy', 'content-guidelines'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid terms type'
      });
    }

    const versions = await termsService.getAllVersions(type);

    res.json({
      success: true,
      data: versions
    });
  } catch (error) {
    console.error('Error getting terms versions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get terms versions'
    });
  }
};


/**
 * Record terms acceptance
 * POST /api/terms/accept
 */
export const recordAcceptance = async (req, res) => {
  try {
    const { type, version } = req.body;
    const userId = req.user._id;
    const ipAddress = req.ip || req.headers['x-forwarded-for'];

    if (!type || !version) {
      return res.status(400).json({
        success: false,
        message: 'Type and version are required'
      });
    }

    const validTypes = ['tos', 'privacy', 'content-guidelines'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid terms type'
      });
    }

    // Verify the version exists
    const terms = await termsService.getTermsVersion(type, version);
    if (!terms) {
      return res.status(404).json({
        success: false,
        message: 'Terms version not found'
      });
    }

    const acceptances = await termsService.recordAcceptance(
      userId, 
      type, 
      version, 
      ipAddress
    );

    res.json({
      success: true,
      message: 'Terms acceptance recorded',
      data: { type, version, acceptedAt: new Date() }
    });
  } catch (error) {
    console.error('Error recording acceptance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record acceptance'
    });
  }
};

/**
 * Get user's acceptance status
 * GET /api/terms/status
 */
export const getAcceptanceStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.query;

    if (type) {
      const validTypes = ['tos', 'privacy', 'content-guidelines'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid terms type'
        });
      }

      const status = await termsService.checkAcceptance(userId, type);
      return res.json({
        success: true,
        data: { [type]: status }
      });
    }

    const status = await termsService.getUserAcceptanceStatus(userId);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting acceptance status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get acceptance status'
    });
  }
};

/**
 * Create new terms (Admin only)
 * POST /api/terms
 */
export const createTerms = async (req, res) => {
  try {
    const { type, version, title, content, summary, effectiveDate } = req.body;

    if (!type || !version || !title || !content || !summary) {
      return res.status(400).json({
        success: false,
        message: 'Type, version, title, content, and summary are required'
      });
    }

    const terms = await termsService.createTerms({
      type,
      version,
      title,
      content,
      summary,
      effectiveDate: effectiveDate || new Date(),
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Terms created successfully',
      data: terms
    });
  } catch (error) {
    console.error('Error creating terms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create terms'
    });
  }
};
