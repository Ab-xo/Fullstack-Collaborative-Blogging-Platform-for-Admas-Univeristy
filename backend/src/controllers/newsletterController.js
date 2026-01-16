import Newsletter from '../models/Newsletter.js';
import crypto from 'crypto';
import emailService from '../services/emailService.js';

/**
 * Newsletter Controller
 * Handles newsletter subscription operations
 */

/**
 * Subscribe to newsletter
 * POST /api/newsletter/subscribe
 */
export const subscribe = async (req, res) => {
  try {
    const { email, source = 'homepage', preferences } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (existingSubscriber) {
      // If already subscribed and active - return success instead of error
      if (existingSubscriber.isActive) {
        return res.status(200).json({
          success: true,
          message: 'You are already subscribed to our newsletter! Thank you for your interest.',
          data: {
            email: existingSubscriber.email,
            subscribedAt: existingSubscriber.subscribedAt
          }
        });
      }
      
      // Resubscribe if previously unsubscribed
      await existingSubscriber.resubscribe();
      
      // Send welcome back email
      try {
        await emailService.sendNewsletterWelcome(existingSubscriber.email, existingSubscriber.unsubscribeToken);
      } catch (emailError) {
        console.log('Welcome email failed to send:', emailError.message);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Welcome back! You have been resubscribed to our newsletter'
      });
    }

    // Generate unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    // Create new subscriber
    const subscriber = await Newsletter.create({
      email: email.toLowerCase(),
      source,
      preferences: preferences || {
        newPosts: true,
        weeklyDigest: true,
        announcements: true,
        events: true
      },
      unsubscribeToken
    });

    // Send welcome email
    try {
      await emailService.sendNewsletterWelcome(subscriber.email, unsubscribeToken);
      console.log(`📧 Newsletter welcome email sent to ${subscriber.email}`);
    } catch (emailError) {
      console.log('Welcome email failed to send:', emailError.message);
      // Don't fail the subscription if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to our newsletter! Check your email for confirmation.',
      data: {
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt
      }
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe. Please try again later.'
    });
  }
};

/**
 * Unsubscribe from newsletter
 * POST /api/newsletter/unsubscribe
 */
export const unsubscribe = async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email && !token) {
      return res.status(400).json({
        success: false,
        message: 'Email or unsubscribe token is required'
      });
    }

    let subscriber;
    
    if (token) {
      subscriber = await Newsletter.findOne({ unsubscribeToken: token });
    } else {
      subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    }

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    if (!subscriber.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This email is already unsubscribed'
      });
    }

    await subscriber.unsubscribe();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from our newsletter'
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe. Please try again later.'
    });
  }
};

/**
 * Update subscription preferences
 * PUT /api/newsletter/preferences
 */
export const updatePreferences = async (req, res) => {
  try {
    const { email, preferences } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    subscriber.preferences = { ...subscriber.preferences, ...preferences };
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: subscriber.preferences
      }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences. Please try again later.'
    });
  }
};

/**
 * Get subscriber count (public)
 * GET /api/newsletter/stats
 */
export const getStats = async (req, res) => {
  try {
    const totalSubscribers = await Newsletter.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        totalSubscribers
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stats'
    });
  }
};

/**
 * Get all subscribers (admin only)
 * GET /api/newsletter/subscribers
 */
export const getAllSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 20, active } = req.query;
    
    const query = {};
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const subscribers = await Newsletter.find(query)
      .sort({ subscribedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Newsletter.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        subscribers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscribers'
    });
  }
};

export default {
  subscribe,
  unsubscribe,
  updatePreferences,
  getStats,
  getAllSubscribers
};
