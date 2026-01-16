import transporter from '../config/email.js';

class EmailService {
  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: `"Admas University Blog" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${to}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async sendVerificationEmail(user, verificationToken) {
    const subject = 'Verify Your Email - Admas University Blog';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .token { background: #e2e8f0; padding: 15px; border-radius: 6px; text-align: center; font-family: monospace; font-size: 18px; letter-spacing: 2px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
          <p>Welcome to Admas University Blog Platform! Please use the verification code below to verify your email address:</p>
          
          <div class="token">${verificationToken}</div>
          
          <p>This code will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
          
          <div class="footer">
            <p>Admas University Blog Platform</p>
            <p>Meskel Campus, Addis Ababa, Ethiopia</p>
            <p>© 2024 Admas University. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await this.sendEmail(user.email, subject, html);

    if (!result.success) {
      console.log(`📧 Verification token for ${user.email}: ${verificationToken}`);
    }

    return result.success;
  }

  async sendPasswordResetEmail(user, resetToken, resetUrl) {
    const subject = 'Reset Your Password - Admas University Blog';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
          <p>You recently requested to reset your password for your Admas University Blog account. Click the button below to reset it.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" class="button">Reset Your Password</a>
          </div>

          <p>Or copy and paste this URL in your browser:</p>
          <div style="background: #e2e8f0; padding: 15px; border-radius: 6px; font-family: monospace; word-break: break-all;">
            ${resetUrl}
          </div>

          <p><strong>This reset link will expire in 1 hour.</strong></p>
          
          <p>If you did not request a password reset, please ignore this email.</p>
          
          <div class="footer">
            <p>Admas University Blog Platform</p>
            <p>© 2024 Admas University. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await this.sendEmail(user.email, subject, html);

    if (!result.success) {
      console.log(`📧 Password reset token for ${user.email}: ${resetToken}`);
      console.log(`📧 Reset URL: ${resetUrl}`);
    }

    return result.success;
  }

  async sendPasswordResetSuccessEmail(user) {
    const subject = 'Password Reset Successful - Admas University Blog';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #34d399); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Password Reset Successful</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
          <p>Your Admas University Blog password has been successfully reset.</p>
          
          <div style="background: #d1fae5; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #065f46; font-weight: 600;">✓ Password updated successfully</p>
          </div>

          <p>If you did not make this change, please contact our support team immediately.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/login" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              Login to Your Account
            </a>
          </div>
          
          <div class="footer">
            <p>Admas University Blog Platform</p>
            <p>© 2024 Admas University. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  async sendApprovalNotification(user) {
    const subject = 'Account Approved - Admas University Blog';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #34d399); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Account Approved</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
          <p>Your account has been approved by the administrator. You can now access all features of the Admas University Blog Platform.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/login" class="button">Login to Your Account</a>
          </div>
          
          <div class="footer">
            <p>Admas University Blog Platform</p>
            <p>© 2024 Admas University. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  async sendNewsletterWelcome(email, unsubscribeToken) {
    const unsubscribeUrl = `${process.env.CLIENT_URL}/unsubscribe?token=${unsubscribeToken}`;
    const subject = '🎉 Welcome to Admas University Newsletter!';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af, #06b6d4); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Our Community! 🎓</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Admas University Collaborative Blogging Platform</p>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: linear-gradient(135deg, #dbeafe, #e0f2fe); padding: 25px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #1e40af;">
            <h2 style="margin: 0 0 10px; color: #1e40af;">You're Now Subscribed!</h2>
            <p style="margin: 0; color: #334155;">Thank you for joining our newsletter. You'll receive the latest updates from Admas University's academic community.</p>
          </div>

          <h3 style="color: #1e40af;">What You'll Receive:</h3>
          
          <div style="margin: 25px 0;">
            <div style="margin: 15px 0; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <strong>📚 Latest Research & Publications</strong>
              <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">Stay updated with groundbreaking research from our faculty and students.</p>
            </div>
            
            <div style="margin: 15px 0; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <strong>📰 Campus News & Events</strong>
              <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">Never miss important announcements, events, and campus activities.</p>
            </div>
            
            <div style="margin: 15px 0; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <strong>💡 Academic Insights</strong>
              <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">Get valuable insights, tutorials, and tips from our academic community.</p>
            </div>
            
            <div style="margin: 15px 0; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <strong>🌟 Weekly Digest</strong>
              <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">A curated summary of the best content from the past week.</p>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/blogs" style="background: linear-gradient(135deg, #1e40af, #06b6d4); color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">Explore Our Blog</a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
            <p><strong>Admas University</strong></p>
            <p>Collaborative Blogging Platform</p>
            <p>Meskel Campus, Addis Ababa, Ethiopia</p>
            <p>© ${new Date().getFullYear()} Admas University. All rights reserved.</p>
            
            <p style="color: #94a3b8; font-size: 11px; margin-top: 15px;">
              Don't want to receive these emails? <a href="${unsubscribeUrl}" style="color: #64748b;">Unsubscribe here</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await this.sendEmail(email, subject, html);
    
    if (!result.success) {
      console.log(`📧 Newsletter welcome email for ${email} - Email service unavailable`);
    }

    return result.success;
  }
}

export default new EmailService();
