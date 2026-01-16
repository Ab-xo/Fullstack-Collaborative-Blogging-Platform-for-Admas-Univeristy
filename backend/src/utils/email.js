import transporter from '../config/email.js';
import { emailTemplates } from './emailTemplates.js';

/**
 * Send email using predefined templates
 */
export const sendEmail = async (options) => {
  try {
    const template = emailTemplates[options.template];
    
    if (!template) {
      throw new Error(`Email template '${options.template}' not found`);
    }

    const emailContent = template(options.data);

    const mailOptions = {
      from: `"Admas University Blog" <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email error:', error.message);
    throw new Error('Email could not be sent');
  }
};

/**
 * Send custom email
 */
export const sendCustomEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"Admas University Blog" <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email error:', error.message);
    throw new Error('Email could not be sent');
  }
};

// Test email functionality (silent)
export const testEmail = async () => {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    return false;
  }
};