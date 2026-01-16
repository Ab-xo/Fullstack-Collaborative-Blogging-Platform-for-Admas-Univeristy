/**
 * Seed script for Terms of Service, Privacy Policy, and Content Guidelines
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Terms from './src/models/Terms.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/admas-blog';

// Terms of Service Content
const tosContent = `# Terms of Service

**Effective Date:** January 2026

## 1. Acceptance of Terms

By accessing and using the Admas University Blog platform ("Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.

## 2. Account Registration

### 2.1 Eligibility
- You must be affiliated with Admas University (student, faculty, staff, or alumni)
- You must provide accurate and complete registration information
- You must be at least 18 years old or have parental consent

### 2.2 Account Security
- You are responsible for maintaining the confidentiality of your account credentials
- You must notify us immediately of any unauthorized access to your account
- You are responsible for all activities that occur under your account

## 3. Content Ownership and Usage

### 3.1 Your Content
- You retain ownership of content you create and publish on the platform
- By posting content, you grant Admas University Blog a non-exclusive license to display, distribute, and promote your content
- You are solely responsible for the content you post

### 3.2 Platform Content
- The platform design, features, and functionality are owned by Admas University
- You may not copy, modify, or distribute platform code or design elements without permission

## 4. Prohibited Content and Conduct

### 4.1 Prohibited Content
- Harassment, bullying, or threatening language
- Hate speech or discriminatory content
- Spam, promotional content, or commercial solicitation
- Plagiarized or copyrighted material without permission
- False or misleading information
- Content that violates university policies

### 4.2 Prohibited Conduct
- Attempting to hack, disrupt, or damage the platform
- Creating multiple accounts to circumvent restrictions
- Impersonating others or providing false identity information
- Interfering with other users' ability to use the platform

## 5. Content Moderation

- We use AI-powered systems to detect policy violations
- Flagged content may be temporarily hidden pending review
- Repeated violations may result in account restrictions or termination
- You may appeal moderation decisions through the platform

## 6. Limitation of Liability

- The platform is provided "as is" without warranties
- We are not liable for user-generated content
- We are not responsible for technical issues or data loss
- Our liability is limited to the maximum extent permitted by law

## 7. Termination

- You may delete your account at any time
- We may suspend or terminate accounts for policy violations
- Upon termination, your access to the platform will be revoked

## 8. Changes to Terms

- We may update these terms periodically
- Users will be notified of significant changes
- Continued use constitutes acceptance of updated terms

## 9. Contact Information

For questions about these terms, contact: support@admas.edu.et
`;

// Privacy Policy Content
const privacyContent = `# Privacy Policy

**Effective Date:** January 2026

## 1. Information We Collect

### 1.1 Personal Information
- Name, email address, and university ID
- Profile information you choose to provide
- Academic status (student, faculty, alumni)

### 1.2 Content Information
- Blog posts, comments, and other content you create
- Interaction data (likes, shares, views)
- Upload timestamps and edit history

### 1.3 Technical Information
- IP address and device information
- Browser type and operating system
- Usage patterns and feature interactions

## 2. How We Use Your Information

### 2.1 Service Provision
- Create and maintain your account
- Display your content to other users
- Provide personalized recommendations
- Enable communication features

### 2.2 Platform Improvement
- Analyze usage patterns to improve features
- Identify and fix technical issues
- Develop new functionality

### 2.3 Safety and Security
- Detect and prevent abuse or violations
- Protect against spam and malicious activity
- Investigate reported content or behavior

## 3. Information Sharing

### 3.1 Public Information
- Your profile information (name, bio, profile picture)
- Published blog posts and comments
- Public interaction data (likes, follows)

### 3.2 University Sharing
- Academic status verification with Admas University
- Compliance reporting as required by university policies

### 3.3 Legal Requirements
- Compliance with Ethiopian law
- Response to valid legal requests
- Protection of rights and safety

## 4. Data Protection and Security

- Encryption of sensitive data in transit and at rest
- Regular security audits and updates
- Access controls and authentication systems
- Monitoring for suspicious activity

## 5. Your Privacy Rights

### 5.1 Access and Control
- View and download your personal information
- Update your profile and account settings
- Control privacy settings for your content

### 5.2 Deletion Rights
- Delete individual posts and comments
- Deactivate or delete your account
- Request removal of personal information

## 6. Cookies and Tracking

- Essential cookies for platform functionality
- Analytics cookies to understand usage patterns
- Preference cookies to remember your settings

## 7. Changes to Privacy Policy

- Notification of material changes via email
- Opportunity to review changes before they take effect
- Continued use constitutes acceptance of updated policy

## 8. Contact Information

For privacy-related questions: privacy@admas.edu.et
`;

// Content Guidelines
const guidelinesContent = `# Content Publishing Guidelines

**Effective Date:** January 2026

## 1. Content Standards

### 1.1 Educational Value
- Focus on academic topics, research, and learning
- Share knowledge and insights relevant to your field
- Contribute to scholarly discussion and debate
- Support claims with credible sources

### 1.2 Originality and Attribution
- Create original content or properly cite sources
- Use quotations and citations for referenced material
- Avoid plagiarism and copyright infringement
- Give credit to collaborators and contributors

### 1.3 Quality Standards
- Use clear, professional language
- Organize content with proper structure
- Proofread for grammar and spelling
- Include relevant tags and categories

## 2. Acceptable Content Types

- Research findings and analysis
- Course reflections and learning experiences
- Study guides and educational resources
- Career advice and industry insights
- Campus events and activities
- Creative writing and artistic projects

## 3. Prohibited Content

### 3.1 Harmful Content
- Harassment, bullying, or personal attacks
- Hate speech or discriminatory language
- Threats or intimidation
- Content promoting violence or self-harm

### 3.2 Inappropriate Content
- Sexually explicit or suggestive material
- Graphic violence or disturbing imagery
- Illegal activities or substance abuse

### 3.3 Academic Misconduct
- Plagiarized content without attribution
- Sharing of exam answers or solutions
- Violation of academic integrity policies

## 4. Community Interaction

### 4.1 Respectful Communication
- Engage in constructive dialogue
- Respect diverse viewpoints
- Use professional and courteous language
- Avoid personal attacks

### 4.2 Constructive Feedback
- Provide helpful and specific feedback
- Focus on content rather than personal characteristics
- Offer suggestions for improvement

## 5. Moderation and Enforcement

### 5.1 AI Content Screening
- Automated systems scan for policy violations
- Flagged content is reviewed by human moderators
- Users are notified of policy violations

### 5.2 Consequences
- First violation: Warning and education
- Second violation: Temporary posting restrictions
- Third violation: Extended restrictions or suspension
- Severe violations: Immediate account suspension

### 5.3 Appeals Process
- Users can appeal moderation decisions
- Appeals are reviewed by senior moderators
- Process typically completed within 48 hours

## 6. Best Practices

- Define your target audience
- Research your topic thoroughly
- Create an outline before writing
- Engage with comments and feedback
- Consistently publish quality content
`;

async function seedTerms() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing terms
    await Terms.deleteMany({});
    console.log('Cleared existing terms');

    // Create Terms of Service
    const tos = await Terms.create({
      type: 'tos',
      version: '1.0.0',
      title: 'Terms of Service',
      content: tosContent,
      summary: 'By using Admas University Blog, you agree to follow our community guidelines, respect intellectual property, and use the platform responsibly.',
      effectiveDate: new Date(),
      isActive: true
    });
    console.log('Created Terms of Service:', tos.version);

    // Create Privacy Policy
    const privacy = await Terms.create({
      type: 'privacy',
      version: '1.0.0',
      title: 'Privacy Policy',
      content: privacyContent,
      summary: 'We collect minimal personal information to provide our services, protect your privacy, and comply with educational regulations.',
      effectiveDate: new Date(),
      isActive: true
    });
    console.log('Created Privacy Policy:', privacy.version);

    // Create Content Guidelines
    const guidelines = await Terms.create({
      type: 'content-guidelines',
      version: '1.0.0',
      title: 'Content Publishing Guidelines',
      content: guidelinesContent,
      summary: 'Create respectful, original, and educational content that contributes positively to the Admas University community.',
      effectiveDate: new Date(),
      isActive: true
    });
    console.log('Created Content Guidelines:', guidelines.version);

    console.log('\nTerms seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding terms:', error);
    process.exit(1);
  }
}

seedTerms();
