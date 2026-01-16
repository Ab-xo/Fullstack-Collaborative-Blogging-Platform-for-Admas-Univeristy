/**
 * Database Seeder for Admas University Collaborative Blogging Platform
 
 * Creates comprehensive sample data for testing:
 * - Admin user
 * - Moderator users
 * - Regular users (students, faculty, alumni)
 * - Blog posts with various statuses
 * - Comments on posts
 * 
 * Run with: node seed-database.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './src/models/User.js';
import BlogPost from './src/models/BlogPost.js';
import Comment from './src/models/Comment.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

// Sample user data - Admas University Programs
const sampleUsers = [
  // Admin User
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@admas.edu.et',
    password: 'Admin123!',
    roleApplication: 'staff',
    universityId: 'ADMIN-2024-001',
    department: 'Information Technology',
    role: 'admin',
    roles: ['admin', 'moderator', 'author', 'reader'],
    status: 'approved',
    isEmailVerified: true,
    isActive: true,
    profile: {
      bio: 'System Administrator for Admas University Blogging Platform',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    }
  },
  
  // Moderator Users
  {
    firstName: 'Sarah',
    lastName: 'Bekele',
    email: 'sarah.bekele@admas.edu.et',
    password: 'Moderator123!',
    roleApplication: 'faculty',
    universityId: 'FAC-2024-001',
    department: 'Business Management',
    position: 'Associate Professor',
    role: 'moderator',
    roles: ['moderator', 'author', 'reader'],
    status: 'approved',
    isEmailVerified: true,
    isActive: true,
    profile: {
      bio: 'Content Moderator and Business Management Professor',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    firstName: 'Michael',
    lastName: 'Tadesse',
    email: 'michael.tadesse@admas.edu.et',
    password: 'Moderator123!',
    roleApplication: 'faculty',
    universityId: 'FAC-2024-002',
    department: 'Computer Science',
    position: 'Senior Lecturer',
    role: 'moderator',
    roles: ['moderator', 'author', 'reader'],
    status: 'approved',
    isEmailVerified: true,
    isActive: true,
    profile: {
      bio: 'Technology enthusiast and content moderator',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  },
  
  // Student Users - Representing each program
  {
    firstName: 'Hanna',
    lastName: 'Girma',
    email: 'hanna.girma@student.admas.edu.et',
    password: 'Student123!',
    roleApplication: 'student',
    universityId: 'STU-2024-001',
    department: 'Computer Science',
    yearOfStudy: '3rd Year',
    roles: ['author', 'reader'],
    status: 'approved',
    isEmailVerified: true,
    profile: {
      bio: 'Computer Science student passionate about software development and AI',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    firstName: 'Dawit',
    lastName: 'Haile',
    email: 'dawit.haile@student.admas.edu.et',
    password: 'Student123!',
    roleApplication: 'student',
    universityId: 'STU-2024-002',
    department: 'Accounting and Finance',
    yearOfStudy: '2nd Year',
    roles: ['author', 'reader'],
    status: 'approved',
    isEmailVerified: true,
    profile: {
      bio: 'Accounting student interested in financial analysis and auditing',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    firstName: 'Meron',
    lastName: 'Alemu',
    email: 'meron.alemu@student.admas.edu.et',
    password: 'Student123!',
    roleApplication: 'student',
    universityId: 'STU-2024-003',
    department: 'Business Management',
    yearOfStudy: '4th Year',
    roles: ['author', 'reader'],
    status: 'approved',
    isEmailVerified: true,
    profile: {
      bio: 'Business Management student focused on marketing and entrepreneurship',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    firstName: 'Yonas',
    lastName: 'Kebede',
    email: 'yonas.kebede@student.admas.edu.et',
    password: 'Student123!',
    roleApplication: 'student',
    universityId: 'STU-2024-004',
    department: 'Agricultural Economics',
    yearOfStudy: '3rd Year',
    roles: ['author', 'reader'],
    status: 'approved',
    isEmailVerified: true,
    profile: {
      bio: 'Agricultural Economics student passionate about sustainable farming',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    firstName: 'Tigist',
    lastName: 'Worku',
    email: 'tigist.worku@student.admas.edu.et',
    password: 'Student123!',
    roleApplication: 'student',
    universityId: 'STU-2024-005',
    department: 'Educational Planning and Management',
    yearOfStudy: '2nd Year',
    roles: ['author', 'reader'],
    status: 'approved',
    isEmailVerified: true,
    profile: {
      bio: 'Education student interested in curriculum development and policy',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
    }
  },
  
  // Faculty Users
  {
    firstName: 'Dr. Abebe',
    lastName: 'Tesfaye',
    email: 'abebe.tesfaye@admas.edu.et',
    password: 'Faculty123!',
    roleApplication: 'faculty',
    universityId: 'FAC-2024-003',
    department: 'Accounting and Finance',
    position: 'Professor',
    roles: ['author', 'reader'],
    status: 'approved',
    isEmailVerified: true,
    profile: {
      bio: 'Professor of Accounting with expertise in financial reporting and auditing',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'
    }
  },
  
  // Alumni Users
  {
    firstName: 'Selam',
    lastName: 'Mekonnen',
    email: 'selam.mekonnen@alumni.admas.edu.et',
    password: 'Alumni123!',
    roleApplication: 'alumni',
    universityId: 'ALU-2024-001',
    graduationYear: '2022',
    verificationDocument: 'alumni-verification-doc-001.pdf',
    roles: ['author', 'reader'],
    status: 'approved',
    isEmailVerified: true,
    profile: {
      bio: 'Computer Science alumni working as a software engineer at a tech company',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face'
    }
  },
  
  // Pending Users
  { 
    firstName: 'Bereket',
    lastName: 'Pending',
    email: 'bereket.pending@student.admas.edu.et',
    password: 'Pending123!',
    roleApplication: 'student',
    universityId: 'STU-2024-999',
    department: 'Computer Science',
    yearOfStudy: '1st Year',
    roles: ['reader'],
    status: 'pending',
    isEmailVerified: false,
    profile: {
      bio: 'Awaiting approval to join the platform',
      avatar: ''
    }
  }
];

// Sample blog post data - Focused on Admas University Programs
const samplePosts = [
  // ===== ACCOUNTING & FINANCE =====
  {
    title: 'Understanding Financial Statements: A Guide for Accounting Students',
    content: `<h2>Introduction</h2>
<p>Financial statements are the backbone of accounting. As Admas University accounting students, mastering these documents is essential for your career success.</p>

<h2>The Three Main Financial Statements</h2>
<ul>
<li><strong>Balance Sheet</strong> - Shows assets, liabilities, and equity at a specific point in time</li>
<li><strong>Income Statement</strong> - Reports revenues and expenses over a period</li>
<li><strong>Cash Flow Statement</strong> - Tracks cash inflows and outflows</li>
</ul>

<h2>Key Ratios to Know</h2>
<p>Learn to calculate and interpret liquidity ratios, profitability ratios, and leverage ratios to analyze company performance.</p>

<h2>Career Applications</h2>
<p>These skills are essential for careers in auditing, tax accounting, financial analysis, and corporate finance.</p>`,
    excerpt: 'A comprehensive guide to understanding and analyzing financial statements for accounting students.',
    category: 'accounting',
    tags: ['Accounting', 'Finance', 'Financial Statements', 'Career'],
    status: 'published',
    featuredImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop'
  },
  
  // ===== COMPUTER SCIENCE =====
  {
    title: 'Introduction to Data Structures: Arrays, Lists, and Trees',
    content: `<h2>Why Data Structures Matter</h2>
<p>As Computer Science students at Admas University, understanding data structures is fundamental to becoming a skilled programmer.</p>

<h2>Arrays and Lists</h2>
<p>Arrays provide constant-time access to elements, while linked lists offer efficient insertions and deletions. Each has its use cases.</p>

<h2>Trees and Graphs</h2>
<p>Binary trees, AVL trees, and graphs are essential for organizing hierarchical data and solving complex problems like pathfinding.</p>

<h2>Practical Applications</h2>
<p>From database indexing to social network analysis, these structures power the applications we use daily.</p>`,
    excerpt: 'Learn the fundamental data structures every Computer Science student needs to master.',
    category: 'computer-science',
    tags: ['Computer Science', 'Programming', 'Data Structures', 'Algorithms'],
    status: 'published',
    featuredImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=400&fit=crop'
  },
  
  // ===== BUSINESS MANAGEMENT =====
  {
    title: 'Strategic Management: Building Competitive Advantage',
    content: `<h2>What is Strategic Management?</h2>
<p>Strategic management involves setting objectives, analyzing competition, and implementing strategies to achieve organizational goals.</p>

<h2>Porter's Five Forces</h2>
<p>Understanding competitive forces helps businesses identify opportunities and threats in their industry.</p>

<h2>SWOT Analysis</h2>
<p>Strengths, Weaknesses, Opportunities, and Threats analysis is a powerful tool for strategic planning.</p>

<h2>Ethiopian Business Context</h2>
<p>How can Ethiopian businesses apply these frameworks to compete in local and international markets?</p>`,
    excerpt: 'Explore strategic management concepts and their application in Ethiopian business contexts.',
    category: 'business-management',
    tags: ['Business', 'Management', 'Strategy', 'Leadership'],
    status: 'published',
    featuredImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop'
  },
  
  // ===== AGRICULTURAL ECONOMICS =====
  {
    title: 'Agricultural Economics: Transforming Ethiopian Farming',
    content: `<h2>The Role of Agricultural Economics</h2>
<p>Ethiopia's economy heavily depends on agriculture. Understanding agricultural economics is crucial for sustainable development.</p>

<h2>Market Analysis</h2>
<p>Learn to analyze agricultural markets, price fluctuations, and supply chain dynamics affecting Ethiopian farmers.</p>

<h2>Policy Implications</h2>
<p>Government policies on subsidies, land use, and export regulations significantly impact agricultural productivity.</p>

<h2>Modern Farming Techniques</h2>
<p>How can economic principles guide the adoption of modern farming technologies in Ethiopia?</p>`,
    excerpt: 'Understanding agricultural economics and its impact on Ethiopian farming communities.',
    category: 'agricultural-economics',
    tags: ['Agriculture', 'Economics', 'Ethiopia', 'Farming'],
    status: 'published',
    featuredImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=400&fit=crop'
  },
  
  // ===== EDUCATIONAL PLANNING =====
  {
    title: 'Educational Planning: Shaping Ethiopia\'s Future',
    content: `<h2>Introduction to Educational Planning</h2>
<p>Educational planning involves systematic decision-making to improve education systems and outcomes.</p>

<h2>Challenges in Ethiopian Education</h2>
<p>Access, quality, and equity remain key challenges. How can strategic planning address these issues?</p>

<h2>Curriculum Development</h2>
<p>Designing curricula that meet both local needs and global standards is essential for student success.</p>

<h2>Technology Integration</h2>
<p>How can educational planners leverage technology to improve learning outcomes across Ethiopia?</p>`,
    excerpt: 'Exploring educational planning strategies for improving Ethiopia\'s education system.',
    category: 'educational-planning',
    tags: ['Education', 'Planning', 'Ethiopia', 'Policy'],
    status: 'published',
    featuredImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop'
  },
  
  // ===== CAMPUS LIFE =====
  {
    title: 'Campus Life: A Day in the Life of an Admas Student',
    content: `<h2>Morning Routine</h2>
<p>My day starts at 6:30 AM with a quick workout at the campus gym. The facilities are excellent, and it's a great way to energize before classes.</p>

<h2>Classes and Learning</h2>
<p>Our professors are incredibly knowledgeable and always willing to help. The interactive teaching methods make even complex subjects engaging.</p>

<h2>Campus Activities</h2>
<p>Between classes, I participate in the Computer Science Club and volunteer at the campus library. These activities have helped me develop leadership skills.</p>

<h2>Evening and Social Life</h2>
<p>Evenings are for group study sessions, club meetings, or just hanging out with friends at the campus café.</p>`,
    excerpt: 'A personal account of daily life at Admas University, from classes to extracurricular activities.',
    category: 'campus-life',
    tags: ['Campus Life', 'Student Experience', 'University'],
    status: 'published',
    featuredImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop'
  },
  
  // ===== MARKETING =====
  {
    title: 'Digital Marketing Strategies for Ethiopian Businesses',
    content: `<h2>The Digital Revolution</h2>
<p>Digital marketing is transforming how Ethiopian businesses reach customers. Social media, SEO, and content marketing are essential skills.</p>

<h2>Social Media Marketing</h2>
<p>Platforms like Facebook, Telegram, and TikTok offer unique opportunities to connect with Ethiopian consumers.</p>

<h2>Content Marketing</h2>
<p>Creating valuable content builds trust and establishes your brand as an industry authority.</p>

<h2>Measuring Success</h2>
<p>Learn to track KPIs and use analytics to optimize your marketing campaigns.</p>`,
    excerpt: 'Learn digital marketing strategies tailored for the Ethiopian business landscape.',
    category: 'marketing',
    tags: ['Marketing', 'Digital', 'Business', 'Social Media'],
    status: 'published',
    featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop'
  },
  
  // ===== PROGRAMMING =====
  {
    title: 'Getting Started with Python: A Beginner\'s Guide',
    content: `<h2>Why Python?</h2>
<p>Python is one of the most popular programming languages, known for its simplicity and versatility.</p>

<h2>Setting Up Your Environment</h2>
<p>Install Python, set up VS Code, and write your first "Hello, World!" program.</p>

<h2>Basic Concepts</h2>
<p>Variables, data types, loops, and functions form the foundation of Python programming.</p>

<h2>Project Ideas</h2>
<p>Build a calculator, create a to-do list app, or analyze data with pandas to practice your skills.</p>`,
    excerpt: 'A beginner-friendly guide to learning Python programming for Admas CS students.',
    category: 'programming',
    tags: ['Python', 'Programming', 'Coding', 'Tutorial'],
    status: 'pending',
    featuredImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop'
  },
  
  // ===== EVENTS =====
  {
    title: 'Upcoming: Admas University Career Fair 2024',
    content: `<h2>Event Details</h2>
<p>Join us for the annual Career Fair featuring top employers from banking, technology, agriculture, and education sectors.</p>

<h2>Participating Companies</h2>
<ul>
<li>Commercial Bank of Ethiopia</li>
<li>Ethio Telecom</li>
<li>Ethiopian Airlines</li>
<li>Local Tech Startups</li>
</ul>

<h2>Prepare Your Resume</h2>
<p>Visit the Career Services office for resume reviews and interview preparation workshops.</p>

<h2>Registration</h2>
<p>Register through the student portal to secure your spot!</p>`,
    excerpt: 'Don\'t miss the Admas University Career Fair 2024 - connect with top employers!',
    category: 'events',
    tags: ['Career', 'Events', 'Jobs', 'Networking'],
    status: 'published',
    featuredImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'
  },
  
  // ===== FINANCE =====
  {
    title: 'Investment Basics: Building Wealth as a Student',
    content: `<h2>Why Start Early?</h2>
<p>Compound interest works best over time. Starting to invest as a student gives you a significant advantage.</p>

<h2>Ethiopian Investment Options</h2>
<p>Explore savings accounts, government bonds, and the Ethiopian Securities Exchange.</p>

<h2>Risk Management</h2>
<p>Understand your risk tolerance and diversify your portfolio to protect your investments.</p>

<h2>Getting Started</h2>
<p>Even small amounts can grow significantly over time. Start with what you can afford.</p>`,
    excerpt: 'Learn investment basics and start building wealth while still a student.',
    category: 'finance',
    tags: ['Finance', 'Investment', 'Money', 'Savings'],
    status: 'pending',
    featuredImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=400&fit=crop'
  },
  
  // ===== SPORTS =====
  {
    title: 'Admas University Football Team Wins Regional Championship',
    content: `<h2>Victory!</h2>
<p>Our football team has won the regional university championship after an incredible season!</p>

<h2>Season Highlights</h2>
<p>The team showed exceptional teamwork and determination throughout the tournament.</p>

<h2>Star Players</h2>
<p>Congratulations to our top scorers and the MVP of the championship match.</p>

<h2>Next Season</h2>
<p>Tryouts for next season will be announced soon. Join the winning team!</p>`,
    excerpt: 'Celebrating our football team\'s regional championship victory!',
    category: 'sports',
    tags: ['Sports', 'Football', 'Championship', 'Victory'],
    status: 'draft',
    featuredImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop'
  },
  
  // ===== INTERNSHIPS =====
  {
    title: 'How to Land Your First Internship: Tips from Admas Alumni',
    content: `<h2>Start Early</h2>
<p>Begin your internship search at least 3-4 months before you want to start.</p>

<h2>Build Your Network</h2>
<p>Connect with alumni, attend career events, and use LinkedIn to find opportunities.</p>

<h2>Prepare Your Application</h2>
<p>Tailor your resume and cover letter for each position. Highlight relevant coursework and projects.</p>

<h2>Ace the Interview</h2>
<p>Research the company, practice common questions, and prepare thoughtful questions to ask.</p>`,
    excerpt: 'Practical tips from Admas alumni on securing your first internship.',
    category: 'internships',
    tags: ['Internship', 'Career', 'Jobs', 'Tips'],
    status: 'published',
    featuredImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=400&fit=crop'
  }
];

// Sample comments data - matching new posts and users
const sampleComments = [
  {
    content: 'Great guide! Understanding financial statements is crucial for our accounting career. The ratio analysis section was especially helpful.',
    postIndex: 0, // Accounting post
    userIndex: 4 // Dawit - Accounting student
  },
  {
    content: 'As a CS student, I found this data structures guide very useful. Would love to see more on algorithms next!',
    postIndex: 1, // Computer Science post
    userIndex: 3 // Hanna - CS student
  },
  {
    content: 'Strategic management concepts are so important for Ethiopian businesses. Great application of Porter\'s Five Forces!',
    postIndex: 2, // Business Management post
    userIndex: 5 // Meron - Business student
  },
  {
    content: 'This article really highlights the importance of agricultural economics for Ethiopia\'s development. Well written!',
    postIndex: 3, // Agricultural Economics post
    userIndex: 6 // Yonas - AgriEcon student
  },
  {
    content: 'Educational planning is key to improving our education system. Thanks for sharing these insights!',
    postIndex: 4, // Educational Planning post
    userIndex: 7 // Tigist - Education student
  },
  {
    content: 'Can\'t wait for the Career Fair! Already preparing my resume. Thanks for the heads up!',
    postIndex: 8, // Career Fair event post
    userIndex: 3 // Hanna
  },
  {
    content: 'As an alumni, I can confirm these internship tips really work. Great advice for current students!',
    postIndex: 11, // Internships post
    userIndex: 9 // Selam - Alumni
  }
];

// Main seeding function
const seedDatabase = async () => {
  try {
    // Check if MONGO_URI is loaded
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables. Please check your .env file.');
    }

    console.log('🌱 Starting database seeding...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await BlogPost.deleteMany({});
    await Comment.deleteMany({});
    console.log('✓ Existing data cleared\n');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      // Use new + save to ensure pre-save hooks run properly
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`   ✓ Created ${user.roles.includes('admin') ? '👑 Admin' : user.roles.includes('moderator') ? '🛡️  Moderator' : '👤 User'}: ${user.fullName} (${user.email})`);
    }
    console.log(`✓ Created ${createdUsers.length} users\n`);

    // Create blog posts
    console.log('📝 Creating blog posts...');
    const createdPosts = [];
    for (let i = 0; i < samplePosts.length; i++) {
      const postData = samplePosts[i];
      
      // Assign authors based on post type
      let authorIndex;
      if (postData.status === 'published') {
        authorIndex = i % 3 === 0 ? 3 : i % 3 === 1 ? 4 : 5; // Rotate between students
      } else if (postData.status === 'pending') {
        authorIndex = i % 2 === 0 ? 3 : 4; // Students
      } else if (postData.status === 'draft') {
        authorIndex = 6; // Daniel Brown
      } else {
        authorIndex = 9; // Pending user
      }
      
      const post = await BlogPost.create({
        ...postData,
        author: createdUsers[authorIndex]._id,
        moderatedBy: postData.status === 'published' || postData.status === 'rejected' 
          ? createdUsers[1]._id // Sarah Johnson (moderator)
          : undefined,
        moderatedAt: postData.status === 'published' || postData.status === 'rejected'
          ? new Date()
          : undefined,
        publishedAt: postData.status === 'published' ? new Date() : undefined,
        moderationNotes: postData.status === 'rejected' 
          ? 'This post violates community guidelines regarding appropriate content.'
          : undefined
      });
      
      createdPosts.push(post);
      const statusEmoji = postData.status === 'published' ? '✅' : postData.status === 'pending' ? '⏳' : postData.status === 'draft' ? '📄' : '❌';
      console.log(`   ${statusEmoji} Created post: "${post.title}" by ${createdUsers[authorIndex].fullName}`);
    }
    console.log(`✓ Created ${createdPosts.length} blog posts\n`);

    // Create comments
    console.log('💬 Creating comments...');
    for (const commentData of sampleComments) {
      const comment = await Comment.create({
        content: commentData.content,
        post: createdPosts[commentData.postIndex]._id,
        author: createdUsers[commentData.userIndex]._id
      });
      
      // Update post's comment count
      await BlogPost.findByIdAndUpdate(
        createdPosts[commentData.postIndex]._id,
        { $inc: { commentsCount: 1 } }
      );
      
      console.log(`   ✓ Created comment by ${createdUsers[commentData.userIndex].fullName}`);
    }
    console.log(`✓ Created ${sampleComments.length} comments\n`);

    // Add some likes to posts
    console.log('❤️  Adding likes to posts...');
    for (let i = 0; i < 5; i++) {
      const post = createdPosts[i];
      const likers = [createdUsers[3], createdUsers[4], createdUsers[5]];
      
      await BlogPost.findByIdAndUpdate(post._id, {
        $push: { likes: { $each: likers.map(u => u._id) } },
        likesCount: likers.length
      });
      
      console.log(`   ✓ Added ${likers.length} likes to "${post.title}"`);
    }
    console.log('✓ Likes added\n');

    // Print summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📊 SUMMARY:');
    console.log(`   Users created: ${createdUsers.length}`);
    console.log(`   - Admins: ${createdUsers.filter(u => u.roles.includes('admin')).length}`);
    console.log(`   - Moderators: ${createdUsers.filter(u => u.roles.includes('moderator')).length}`);
    console.log(`   - Students: ${createdUsers.filter(u => u.roleApplication === 'student').length}`);
    console.log(`   - Faculty: ${createdUsers.filter(u => u.roleApplication === 'faculty').length}`);
    console.log(`   - Alumni: ${createdUsers.filter(u => u.roleApplication === 'alumni').length}`);
    console.log(`   Posts created: ${createdPosts.length}`);
    console.log(`   - Published: ${createdPosts.filter(p => p.status === 'published').length}`);
    console.log(`   - Pending: ${createdPosts.filter(p => p.status === 'pending').length}`);
    console.log(`   - Draft: ${createdPosts.filter(p => p.status === 'draft').length}`);
    console.log(`   - Rejected: ${createdPosts.filter(p => p.status === 'rejected').length}`);
    console.log(`   Comments created: ${sampleComments.length}\n`);

    console.log('🔐 TEST ACCOUNTS:');
    console.log('\n   👑 ADMIN:');
    console.log('      Email: admin@admas.edu.et');
    console.log('      Password: Admin123!');
    console.log('      Access: Full system access\n');

    console.log('   🛡️  MODERATORS:');
    console.log('      Email: sarah.bekele@admas.edu.et');
    console.log('      Password: Moderator123!');
    console.log('      Email: michael.tadesse@admas.edu.et');
    console.log('      Password: Moderator123!');
    console.log('      Access: Content moderation\n');

    console.log('   👤 STUDENTS (by Program):');
    console.log('      CS: hanna.girma@student.admas.edu.et');
    console.log('      Accounting: dawit.haile@student.admas.edu.et');
    console.log('      Business: meron.alemu@student.admas.edu.et');
    console.log('      AgriEcon: yonas.kebede@student.admas.edu.et');
    console.log('      Education: tigist.worku@student.admas.edu.et');
    console.log('      Password (all): Student123!');
    console.log('      Access: Create and read posts\n');

    console.log('   👨‍🏫 FACULTY:');
    console.log('      Email: abebe.tesfaye@admas.edu.et');
    console.log('      Password: Faculty123!');
    console.log('      Access: Create and read posts\n');

    console.log('   🎓 ALUMNI:');
    console.log('      Email: selam.mekonnen@alumni.admas.edu.et');
    console.log('      Password: Alumni123!');
    console.log('      Access: Create and read posts\n');

    console.log('🌐 APPLICATION URLS:');
    console.log('   Frontend: http://localhost:5173');
    console.log('   Backend API: http://localhost:4001');
    console.log('   Admin Dashboard: http://localhost:5173/admin');
    console.log('   Moderator Dashboard: http://localhost:5173/moderator\n');

    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error seeding database:', error.message);
    if (error.code === 11000) {
      console.error('   Duplicate key error. The database may already contain some of this data.');
      console.error('   Try clearing the database first or use different email addresses.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB\n');
  }
};

// Run the seeder
seedDatabase();
