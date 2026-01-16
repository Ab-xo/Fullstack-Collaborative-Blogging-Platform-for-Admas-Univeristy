import Contact from '../models/Contact.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../utils/email.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

/**
 * @desc    Submit a contact form message
 * @route   POST /api/contact
 * @access  Public
 */
export const submitContactForm = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, subject, message } = req.body;

  // Create contact message
  const contact = await Contact.create({
    firstName,
    lastName,
    email,
    subject,
    message,
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent']
  });

  // Send confirmation email to the user
  try {
    await sendEmail({
      email: email,
      subject: 'Thank you for contacting Admas University Blog',
      template: 'contact-confirmation',
      data: {
        name: firstName,
        subject: subject
      }
    });
  } catch (emailError) {
    console.error('Failed to send confirmation email:', emailError);
    // Don't fail the request if email fails
  }

  // Notify admin about new contact message via email
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'gebeyehuabraham19@gmail.com';
    await sendEmail({
      email: adminEmail,
      subject: `New Contact Form Submission: ${subject}`,
      template: 'contact-admin-notification',
      data: {
        firstName,
        lastName,
        email,
        subject,
        message,
        submittedAt: new Date().toLocaleString()
      }
    });
  } catch (emailError) {
    console.error('Failed to send admin notification email:', emailError);
  }

  // Create in-app notifications for all admin users
  try {
    const adminUsers = await User.find({ role: 'admin' }).select('_id');
    
    const notifications = adminUsers.map(admin => ({
      recipient: admin._id,
      type: 'contact_message',
      title: '📬 New Contact Message',
      message: `${firstName} ${lastName} sent a message: "${subject}"`,
      link: '/admin/contacts',
      priority: 'high',
      metadata: {
        contactId: contact._id,
        senderName: `${firstName} ${lastName}`,
        senderEmail: email,
        subject: subject
      }
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (notifyError) {
    console.error('Failed to create admin notifications:', notifyError);
  }

  res.status(201).json({
    success: true,
    message: 'Your message has been sent successfully. We will get back to you soon!',
    data: {
      id: contact._id,
      submittedAt: contact.createdAt
    }
  });
});

/**
 * @desc    Get all contact messages (Admin only)
 * @route   GET /api/contact
 * @access  Private/Admin
 */
export const getContactMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const query = {};
  if (status && status !== 'all') {
    query.status = status;
  }

  const messages = await Contact.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .populate('repliedBy', 'firstName lastName email');

  const total = await Contact.countDocuments(query);

  // Get counts by status
  const statusCounts = await Contact.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const counts = {
    new: 0,
    read: 0,
    replied: 0,
    archived: 0,
    total
  };

  statusCounts.forEach(s => {
    counts[s._id] = s.count;
  });

  res.status(200).json({
    success: true,
    data: {
      messages,
      counts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

/**
 * @desc    Get single contact message (Admin only)
 * @route   GET /api/contact/:id
 * @access  Private/Admin
 */
export const getContactMessage = asyncHandler(async (req, res) => {
  const message = await Contact.findById(req.params.id)
    .populate('repliedBy', 'firstName lastName email');

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Contact message not found'
    });
  }

  // Mark as read if it's new
  if (message.status === 'new') {
    message.status = 'read';
    await message.save();
  }

  res.status(200).json({
    success: true,
    data: message
  });
});

/**
 * @desc    Update contact message status (Admin only)
 * @route   PUT /api/contact/:id/status
 * @access  Private/Admin
 */
export const updateContactStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const message = await Contact.findById(req.params.id);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Contact message not found'
    });
  }

  message.status = status;
  await message.save();

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    data: message
  });
});

/**
 * @desc    Reply to contact message (Admin only)
 * @route   POST /api/contact/:id/reply
 * @access  Private/Admin
 */
export const replyToContact = asyncHandler(async (req, res) => {
  const { replyMessage } = req.body;

  const message = await Contact.findById(req.params.id);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Contact message not found'
    });
  }

  // Send reply email
  try {
    await sendEmail({
      email: message.email,
      subject: `Re: ${message.subject}`,
      template: 'contact-reply',
      data: {
        name: message.firstName,
        originalSubject: message.subject,
        originalMessage: message.message,
        replyMessage: replyMessage
      }
    });

    // Update message status
    message.status = 'replied';
    message.repliedAt = new Date();
    message.repliedBy = req.user._id;
    message.replyMessage = replyMessage;
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      data: message
    });
  } catch (emailError) {
    console.error('Failed to send reply email:', emailError);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply email. Please try again.'
    });
  }
});

/**
 * @desc    Delete contact message (Admin only)
 * @route   DELETE /api/contact/:id
 * @access  Private/Admin
 */
export const deleteContactMessage = asyncHandler(async (req, res) => {
  const message = await Contact.findById(req.params.id);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Contact message not found'
    });
  }

  await message.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Contact message deleted successfully'
  });
});
