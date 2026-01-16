export const emailTemplates = {
  // Email Verification Template
  'email-verification': (data) => ({
    subject: 'Verify Your Email - Admas University Blog',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c5aa0; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .button { 
            background: #2c5aa0; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block;
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .code { 
            background: #f4f4f4; 
            padding: 10px; 
            font-size: 24px; 
            text-align: center; 
            letter-spacing: 5px;
            margin: 20px 0;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Admas University Blog</h1>
            <p>Email Verification Required</p>
          </div>
          <div class="content">
            <h2>Hello ${data.name},</h2>
            <p>Thank you for registering with Admas University Collaborative Blogging Platform.</p>
            <p>Please verify your email address by using the verification code below:</p>
            
            <div class="code">${data.verificationToken}</div>
            
            <p>Or click the button below to verify your email:</p>
            <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
            
            <p>This verification code will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Admas University. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Account Approved Template
  'account-approved': (data) => ({
    subject: 'Account Approved - Admas University Blog',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #27ae60; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .button { 
            background: #27ae60; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block;
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Admas University Blog</h1>
            <p>Account Approved</p>
          </div>
          <div class="content">
            <h2>Congratulations ${data.name}!</h2>
            <p>Your account has been approved by the administration team.</p>
            <p>You can now access all features of the Admas University Collaborative Blogging Platform.</p>
            
            <a href="${data.loginUrl}" class="button">Login to Your Account</a>
            
            <p>We look forward to seeing your contributions to our academic community!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Admas University. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Account Rejected Template
  'account-rejected': (data) => ({
    subject: 'Account Review - Admas University Blog',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e74c3c; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .notes { 
            background: #fff3f3; 
            padding: 15px; 
            border-left: 4px solid #e74c3c;
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Admas University Blog</h1>
            <p>Account Review Status</p>
          </div>
          <div class="content">
            <h2>Dear ${data.name},</h2>
            <p>Thank you for your interest in joining the Admas University Collaborative Blogging Platform.</p>
            <p>After careful review, we regret to inform you that your application has not been approved at this time.</p>
            
            <div class="notes">
              <strong>Review Notes:</strong>
              <p>${data.reviewNotes}</p>
            </div>
            
            <p>If you believe this is an error or would like more information, please contact the university administration.</p>
            <p>Thank you for your understanding.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Admas University. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Contact Form Confirmation Template
  'contact-confirmation': (data) => ({
    subject: '✅ Message Received - Admas University Blog',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #1f2937;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 20px;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 50px 30px;
            text-align: center;
          }
          .success-icon {
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          }
          .success-icon span {
            font-size: 40px;
          }
          .header h1 {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          .header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .message-card {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-radius: 16px;
            padding: 25px;
            margin: 25px 0;
            border-left: 5px solid #10b981;
          }
          .message-card h3 {
            color: #059669;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
          }
          .message-card p {
            color: #166534;
            font-size: 18px;
            font-weight: 600;
          }
          .info-section {
            background: #f8fafc;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
          }
          .info-section h4 {
            color: #374151;
            font-size: 16px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .timeline {
            display: flex;
            align-items: center;
            gap: 15px;
            margin: 20px 0;
          }
          .timeline-item {
            flex: 1;
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }
          .timeline-item .icon {
            font-size: 24px;
            margin-bottom: 8px;
          }
          .timeline-item .label {
            font-size: 12px;
            color: #6b7280;
          }
          .contact-box {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
          }
          .contact-box h4 {
            color: #1e40af;
            margin-bottom: 15px;
          }
          .contact-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 0;
            color: #1e40af;
          }
          .footer {
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer-text {
            font-size: 13px;
            color: #6b7280;
            margin: 8px 0;
          }
          .social-links {
            margin: 20px 0;
          }
          .social-link {
            display: inline-block;
            width: 40px;
            height: 40px;
            background: #e5e7eb;
            border-radius: 50%;
            margin: 0 5px;
            line-height: 40px;
            text-decoration: none;
            transition: all 0.3s;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div class="success-icon">
              <span>✓</span>
            </div>
            <h1>Message Received!</h1>
            <p>We've got your message and will respond soon</p>
          </div>

          <div class="content">
            <div class="greeting">Hello ${data.name}! 👋</div>
            
            <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">
              Thank you for reaching out to us! Your message has been successfully received and our team is already on it.
            </p>

            <div class="message-card">
              <h3>📋 Your Inquiry</h3>
              <p>"${data.subject}"</p>
            </div>

            <div class="info-section">
              <h4>⏱️ What happens next?</h4>
              <div class="timeline">
                <div class="timeline-item">
                  <div class="icon">📨</div>
                  <div class="label">Received</div>
                </div>
                <div class="timeline-item">
                  <div class="icon">👀</div>
                  <div class="label">Under Review</div>
                </div>
                <div class="timeline-item">
                  <div class="icon">💬</div>
                  <div class="label">Response</div>
                </div>
              </div>
              <p style="color: #6b7280; font-size: 14px; text-align: center;">
                Expected response time: <strong>24-48 business hours</strong>
              </p>
            </div>

            <div class="contact-box">
              <h4>📞 Need urgent help?</h4>
              <div class="contact-item">
                <span>📱</span>
                <span>+251 11 667 1234</span>
              </div>
              <div class="contact-item">
                <span>✉️</span>
                <span>gebeyehuabraham19@gmail.com</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p class="footer-text">
              <strong>Admas University Collaborative Blogging Platform</strong>
            </p>
            <p class="footer-text">
              Building knowledge together, one post at a time
            </p>
            <p class="footer-text" style="margin-top: 20px;">
              &copy; ${new Date().getFullYear()} Admas University. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Contact Admin Notification Template
  'contact-admin-notification': (data) => ({
    subject: `🔔 New Contact: ${data.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #3b82f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 35px 30px; text-align: center;">
                    <div style="display: inline-block; background: white; color: #1d4ed8; padding: 8px 20px; border-radius: 50px; font-size: 13px; font-weight: 600; margin-bottom: 15px;">🔔 NEW MESSAGE</div>
                    <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 10px 0 5px 0;">Contact Form Submission</h1>
                    <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">Someone reached out through the contact form</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 30px;">
                    
                    <!-- Sender Info Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #eff6ff; border-radius: 12px; border: 2px solid #3b82f6; margin-bottom: 25px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h3 style="color: #1e40af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">👤 Sender Information</h3>
                          
                          <!-- Name Row -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="background: white; border-radius: 8px; margin-bottom: 10px;">
                            <tr>
                              <td style="padding: 12px 15px;">
                                <table cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="width: 40px; vertical-align: top;">
                                      <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 8px; text-align: center; line-height: 32px; font-size: 14px;">👤</div>
                                    </td>
                                    <td style="padding-left: 12px; vertical-align: middle;">
                                      <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Full Name</div>
                                      <div style="font-size: 15px; color: #1f2937; font-weight: 600;">${data.firstName} ${data.lastName}</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>

                          <!-- Email Row -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="background: white; border-radius: 8px;">
                            <tr>
                              <td style="padding: 12px 15px;">
                                <table cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="width: 40px; vertical-align: top;">
                                      <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 8px; text-align: center; line-height: 32px; font-size: 14px;">✉️</div>
                                    </td>
                                    <td style="padding-left: 12px; vertical-align: middle;">
                                      <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</div>
                                      <div style="font-size: 15px; color: #1f2937; font-weight: 600;">${data.email}</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>

                    <!-- Message Section -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 12px; margin-bottom: 25px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h3 style="color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">💬 Message Details</h3>
                          
                          <div style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; margin-bottom: 15px;">📋 ${data.subject}</div>
                          
                          <table width="100%" cellpadding="0" cellspacing="0" style="background: white; border-radius: 8px; border-left: 4px solid #10b981;">
                            <tr>
                              <td style="padding: 18px; font-size: 14px; color: #374151; line-height: 1.7;">
                                ${data.message.replace(/\n/g, '<br>')}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Action Section -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 12px;">
                      <tr>
                        <td style="padding: 25px; text-align: center;">
                          <h4 style="color: #1e40af; font-size: 16px; margin: 0 0 10px 0;">🚀 Quick Actions</h4>
                          <p style="color: #6b7280; font-size: 13px; margin: 0 0 15px 0;">Log in to the admin panel to respond</p>
                          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/contacts" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">📧 View & Reply</a>
                        </td>
                      </tr>
                    </table>

                    <!-- Timestamp -->
                    <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">⏰ Submitted on ${data.submittedAt}</p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #1e3a5f; padding: 20px; text-align: center;">
                    <p style="color: white; font-size: 13px; font-weight: 600; margin: 0 0 5px 0;">Admas University Blog - Admin Notification</p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0 0 5px 0;">This email was sent to gebeyehuabraham19@gmail.com</p>
                    <p style="color: #6b7280; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Admas University. All rights reserved.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }),

  // Contact Reply Template
  'contact-reply': (data) => ({
    subject: `💬 Re: ${data.originalSubject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #1f2937;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            padding: 40px 20px;
          }
          .email-wrapper {
            max-width: 650px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          }
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            padding: 45px 30px;
            text-align: center;
          }
          .reply-icon {
            width: 70px;
            height: 70px;
            background: white;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          }
          .reply-icon span {
            font-size: 32px;
          }
          .header h1 {
            color: white;
            font-size: 26px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          .header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 15px;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 22px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .intro-text {
            color: #4b5563;
            font-size: 16px;
            margin-bottom: 25px;
          }
          .reply-card {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border-radius: 16px;
            padding: 25px;
            margin: 25px 0;
            border-left: 5px solid #3b82f6;
          }
          .reply-card h3 {
            color: #1e40af;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .reply-content {
            background: white;
            border-radius: 12px;
            padding: 20px;
            font-size: 15px;
            color: #374151;
            line-height: 1.8;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }
          .original-section {
            background: #f8fafc;
            border-radius: 16px;
            padding: 25px;
            margin: 25px 0;
          }
          .original-section h3 {
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
          }
          .original-subject {
            display: inline-block;
            background: #e5e7eb;
            color: #374151;
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 12px;
          }
          .original-message {
            background: white;
            border-radius: 10px;
            padding: 15px;
            font-size: 14px;
            color: #6b7280;
            border-left: 3px solid #d1d5db;
            font-style: italic;
          }
          .help-section {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-radius: 16px;
            padding: 25px;
            text-align: center;
            margin-top: 25px;
          }
          .help-section h4 {
            color: #166534;
            margin-bottom: 10px;
          }
          .help-section p {
            color: #15803d;
            font-size: 14px;
          }
          .contact-link {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 12px 30px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            margin-top: 15px;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          }
          .footer {
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer-text {
            font-size: 13px;
            color: #6b7280;
            margin: 5px 0;
          }
          .footer-brand {
            font-weight: 600;
            color: #374151;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div class="reply-icon">
              <span>💬</span>
            </div>
            <h1>We've Responded!</h1>
            <p>Here's our reply to your inquiry</p>
          </div>

          <div class="content">
            <div class="greeting">Hello ${data.name}! 👋</div>
            
            <p class="intro-text">
              Thank you for contacting Admas University Blog. We've reviewed your message and here's our response:
            </p>

            <div class="reply-card">
              <h3>📩 Our Response</h3>
              <div class="reply-content">
                ${data.replyMessage.replace(/\n/g, '<br>')}
              </div>
            </div>

            <div class="original-section">
              <h3>📋 Your Original Message</h3>
              <div class="original-subject">Subject: ${data.originalSubject}</div>
              <div class="original-message">
                ${data.originalMessage.replace(/\n/g, '<br>')}
              </div>
            </div>

            <div class="help-section">
              <h4>🤝 Need More Help?</h4>
              <p>Feel free to reply to this email or submit another inquiry through our contact form.</p>
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/contact" class="contact-link">
                📝 Contact Us Again
              </a>
            </div>
          </div>

          <div class="footer">
            <p class="footer-text footer-brand">
              Admas University Collaborative Blogging Platform
            </p>
            <p class="footer-text">
              Building knowledge together, one post at a time
            </p>
            <p class="footer-text" style="margin-top: 15px;">
              &copy; ${new Date().getFullYear()} Admas University. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Password Reset Template
  'password-reset': (data) => ({
    subject: 'Password Reset Request - Admas University Blog',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #1f2937;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            width: 64px;
            height: 64px;
            background: white;
            border-radius: 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          .logo-text {
            font-size: 28px;
            font-weight: bold;
            color: #667eea;
          }
          .header h1 {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          .header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
          }
          .content {
            padding: 40px 30px;
            background: white;
          }
          .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
            line-height: 1.8;
          }
          .code-container {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            border: 2px dashed #667eea;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .code-label {
            font-size: 14px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
            font-weight: 600;
          }
          .code {
            font-size: 36px;
            font-weight: 700;
            color: #667eea;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
          }
          .code-hint {
            font-size: 13px;
            color: #9ca3af;
            margin-top: 12px;
          }
          .divider {
            text-align: center;
            margin: 30px 0;
            position: relative;
          }
          .divider::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            width: 100%;
            height: 1px;
            background: #e5e7eb;
          }
          .divider-text {
            background: white;
            padding: 0 15px;
            color: #9ca3af;
            font-size: 14px;
            position: relative;
            display: inline-block;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
          }
          .info-box {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 16px 20px;
            border-radius: 8px;
            margin: 25px 0;
          }
          .info-box p {
            font-size: 14px;
            color: #1e40af;
            margin: 0;
          }
          .warning-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px 20px;
            border-radius: 8px;
            margin: 25px 0;
          }
          .warning-box p {
            font-size: 14px;
            color: #92400e;
            margin: 0;
          }
          .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer-text {
            font-size: 13px;
            color: #6b7280;
            margin: 8px 0;
          }
          .footer-links {
            margin-top: 20px;
          }
          .footer-link {
            color: #667eea;
            text-decoration: none;
            margin: 0 10px;
            font-size: 13px;
          }
          .social-icons {
            margin-top: 20px;
          }
          .social-icon {
            display: inline-block;
            width: 36px;
            height: 36px;
            background: #e5e7eb;
            border-radius: 50%;
            margin: 0 5px;
            line-height: 36px;
            color: #6b7280;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <!-- Header -->
          <div class="header">
            <div class="logo">
              <span class="logo-text">AU</span>
            </div>
            <h1>Password Reset Request</h1>
            <p>Secure your account with a new password</p>
          </div>

          <!-- Content -->
          <div class="content">
            <div class="greeting">Hello ${data.name}! 👋</div>
            
            <p class="message">
              We received a request to reset the password for your Admas University Blog account. 
              To proceed with resetting your password, please use the verification code below:
            </p>

            <!-- Verification Code -->
            <div class="code-container">
              <div class="code-label">Your Verification Code</div>
              <div class="code">${data.resetToken}</div>
              <div class="code-hint">Enter this code on the password reset page</div>
            </div>

            <div class="info-box">
              <p><strong>⏰ This code will expire in 24 hours</strong> for security reasons. If you need a new code, you can request another one from the login page.</p>
            </div>

            <div class="divider">
              <span class="divider-text">OR</span>
            </div>

            <!-- Reset Button -->
            <div class="button-container">
              <a href="${data.resetUrl}" class="button">
                🔒 Reset Password Now
              </a>
            </div>

            <p class="message" style="margin-top: 30px;">
              Click the button above to be taken directly to the password reset page where you can create your new password.
            </p>

            <div class="warning-box">
              <p><strong>⚠️ Didn't request this?</strong> If you didn't request a password reset, please ignore this email and your password will remain unchanged. Your account is secure.</p>
            </div>

            <p class="message" style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              For security reasons, we recommend:
            </p>
            <ul style="color: #6b7280; font-size: 14px; margin-left: 20px; margin-top: 10px;">
              <li>Using a strong, unique password</li>
              <li>Not sharing your password with anyone</li>
              <li>Enabling two-factor authentication when available</li>
            </ul>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p class="footer-text">
              <strong>Admas University Collaborative Blogging Platform</strong>
            </p>
            <p class="footer-text">
              Building knowledge together, one post at a time
            </p>
            <div class="footer-links">
              <a href="${process.env.CLIENT_URL}" class="footer-link">Visit Website</a>
              <a href="${process.env.CLIENT_URL}/help" class="footer-link">Help Center</a>
              <a href="${process.env.CLIENT_URL}/contact" class="footer-link">Contact Us</a>
            </div>
            <p class="footer-text" style="margin-top: 20px;">
              &copy; ${new Date().getFullYear()} Admas University. All rights reserved.
            </p>
            <p class="footer-text">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};