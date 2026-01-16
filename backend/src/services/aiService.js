/**
 * ============================================================================
 * AI SERVICE - With Built-in Fallback
 * ============================================================================
 * Supports multiple AI providers with automatic fallback to built-in templates:
 * 1. OpenAI (if configured and working)
 * 2. Groq (free tier available with API key)
 * 3. Ollama (local, free - requires local installation)
 * 4. Built-in Template Generator (ALWAYS works - no API needed)
 * 
 * The built-in fallback ensures AI features work even without external APIs.
 */

import OpenAI from 'openai';

// Provider configuration
const PROVIDERS = {
  OPENAI: 'openai',
  GROQ: 'groq',
  OLLAMA: 'ollama',
  BUILTIN: 'builtin'
};

// Initialize clients
let openaiClient = null;
let groqClient = null;

// Initialize OpenAI if configured
if (process.env.OPENAI_API_KEY) {
  try {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } catch (e) {
    console.log('OpenAI client initialization failed:', e.message);
  }
}

// Initialize Groq if configured
if (process.env.GROQ_API_KEY) {
  try {
    groqClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  } catch (e) {
    console.log('Groq client initialization failed:', e.message);
  }
}

/**
 * Always return true - we have built-in fallback
 */
const isConfigured = () => true;

/**
 * Get available providers (always includes builtin)
 */
const getAvailableProviders = () => {
  const providers = [];
  if (process.env.OPENAI_API_KEY) providers.push(PROVIDERS.OPENAI);
  if (process.env.GROQ_API_KEY) providers.push(PROVIDERS.GROQ);
  if (process.env.OLLAMA_URL) providers.push(PROVIDERS.OLLAMA);
  providers.push(PROVIDERS.BUILTIN); // Always available
  return providers;
};

// ============================================================================
// BUILT-IN CONTENT GENERATION (No API Required)
// ============================================================================

/**
 * Category-specific content templates
 */
const CATEGORY_TEMPLATES = {
  technology: {
    intro: [
      "In today's rapidly evolving digital landscape, {topic} has become increasingly important for students and professionals alike.",
      "The field of {topic} continues to transform how we approach learning and problem-solving in the modern era.",
      "Understanding {topic} is essential for anyone looking to stay competitive in the technology-driven world."
    ],
    body: [
      "When examining {topic}, it's crucial to consider both the theoretical foundations and practical applications that make this subject so relevant.",
      "The key aspects of {topic} include understanding core concepts, exploring real-world implementations, and staying updated with the latest developments.",
      "Students studying {topic} should focus on hands-on experience, as practical knowledge often complements theoretical understanding."
    ],
    conclusion: [
      "As we continue to advance in this field, {topic} will undoubtedly play a pivotal role in shaping future innovations and career opportunities.",
      "By mastering {topic}, students position themselves at the forefront of technological advancement and professional growth.",
      "The journey of learning {topic} is ongoing, and staying curious and adaptable will be key to long-term success."
    ]
  },
  education: {
    intro: [
      "Education plays a fundamental role in shaping our understanding of {topic} and its impact on society.",
      "The study of {topic} offers valuable insights that extend beyond the classroom into real-world applications.",
      "As educators and learners, exploring {topic} helps us develop critical thinking skills essential for academic success."
    ],
    body: [
      "Effective learning about {topic} requires a combination of theoretical knowledge and practical engagement with the subject matter.",
      "Research in {topic} has shown that active participation and collaborative learning significantly enhance understanding and retention.",
      "The educational approach to {topic} should balance traditional methods with innovative teaching strategies."
    ],
    conclusion: [
      "Continued exploration of {topic} will contribute to both personal growth and the advancement of educational practices.",
      "By embracing lifelong learning in {topic}, we prepare ourselves for the challenges and opportunities that lie ahead.",
      "The knowledge gained from studying {topic} serves as a foundation for future academic and professional endeavors."
    ]
  },
  science: {
    intro: [
      "Scientific inquiry into {topic} reveals fascinating insights about the natural world and our place within it.",
      "The study of {topic} combines rigorous methodology with creative thinking to advance our understanding.",
      "Exploring {topic} through a scientific lens helps us develop evidence-based perspectives on complex issues."
    ],
    body: [
      "Research methodologies in {topic} have evolved significantly, incorporating new technologies and interdisciplinary approaches.",
      "Key findings in {topic} demonstrate the importance of systematic observation and hypothesis testing.",
      "The scientific community continues to make breakthroughs in {topic}, opening new avenues for exploration and discovery."
    ],
    conclusion: [
      "Future research in {topic} promises to unlock even more discoveries that could transform our understanding.",
      "The scientific study of {topic} reminds us of the importance of curiosity, persistence, and intellectual rigor.",
      "As we advance our knowledge of {topic}, we contribute to the collective scientific understanding of humanity."
    ]
  },
  business: {
    intro: [
      "In the competitive business environment, understanding {topic} is crucial for organizational success and growth.",
      "The business implications of {topic} extend across industries, affecting strategy, operations, and innovation.",
      "Professionals seeking to excel must develop a comprehensive understanding of {topic} and its applications."
    ],
    body: [
      "Successful implementation of {topic} requires careful planning, resource allocation, and stakeholder engagement.",
      "Case studies in {topic} reveal best practices and common pitfalls that organizations should consider.",
      "The strategic importance of {topic} cannot be overstated in today's dynamic business landscape."
    ],
    conclusion: [
      "Organizations that master {topic} position themselves for sustainable competitive advantage.",
      "The future of business will increasingly depend on effective application of {topic} principles.",
      "By investing in {topic} knowledge, professionals enhance their value and career prospects."
    ]
  },
  general: {
    intro: [
      "The topic of {topic} offers rich opportunities for exploration and understanding across multiple dimensions.",
      "Examining {topic} provides valuable perspectives that can enhance both academic knowledge and practical skills.",
      "A comprehensive look at {topic} reveals its significance in contemporary discourse and everyday life."
    ],
    body: [
      "When delving into {topic}, it's important to consider various viewpoints and the evidence supporting different positions.",
      "The multifaceted nature of {topic} requires an interdisciplinary approach to fully appreciate its complexity.",
      "Understanding {topic} involves examining historical context, current developments, and future implications."
    ],
    conclusion: [
      "Continued engagement with {topic} will deepen understanding and open new avenues for inquiry.",
      "The insights gained from exploring {topic} contribute to personal growth and informed decision-making.",
      "As we reflect on {topic}, we recognize its ongoing relevance and the importance of staying informed."
    ]
  }
};

/**
 * Extract main topic from title
 */
const extractTopic = (title) => {
  // Remove common words and extract key topic
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'how', 'what', 'why', 'when', 'where', 'who', 'which', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their'];

  const words = title.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => !stopWords.includes(word) && word.length > 2);

  // Return the most significant words as the topic
  return words.slice(0, 4).join(' ') || title;
};

/**
 * Get random item from array
 */
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Generate content using built-in templates
 */
const generateBuiltinContent = (title, category = 'general') => {
  const topic = extractTopic(title);
  const templates = CATEGORY_TEMPLATES[category.toLowerCase()] || CATEGORY_TEMPLATES.general;

  const paragraphs = [
    {
      id: 'p1',
      text: randomItem(templates.intro).replace(/{topic}/g, topic),
      type: 'introduction'
    },
    {
      id: 'p2',
      text: randomItem(templates.body).replace(/{topic}/g, topic),
      type: 'body'
    },
    {
      id: 'p3',
      text: randomItem(templates.conclusion).replace(/{topic}/g, topic),
      type: 'conclusion'
    }
  ];

  return {
    success: true,
    paragraphs,
    generatedAt: new Date().toISOString(),
    provider: 'builtin'
  };
};

/**
 * Perform grammar check using built-in logic
 */
const checkGrammarBuiltin = (content) => {
  const words = content.split(/\s+/);
  const errors = [];

  // Very simplistic rule-based "grammar" check
  if (content.length > 10 && !/[.!?]$/.test(content.trim())) {
    errors.push({ text: content.slice(-5), error: 'Missing ending punctuation', suggestion: content.trim() + '.' });
  }

  const commonTypos = {
    'recieve': 'receive',
    'teh': 'the',
    'goverment': 'government',
    'occurance': 'occurrence',
    'definately': 'definitely'
  };

  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    if (commonTypos[cleanWord]) {
      errors.push({ text: word, error: 'Spelling error', suggestion: commonTypos[cleanWord] });
    }
  });

  return {
    success: true,
    errors,
    summary: errors.length > 0 ? `Found ${errors.length} potential issues.` : 'No obvious grammar issues found.',
    provider: 'builtin'
  };
};

/**
 * Improve content using built-in logic
 */
const improveContentBuiltin = (content) => {
  let improved = content;

  // Very simplistic "improvement"
  improved = improved.replace(/\bvery good\b/gi, 'excellent');
  improved = improved.replace(/\bvery bad\b/gi, 'terrible');
  improved = improved.replace(/\bhappy\b/gi, 'delighted');

  return {
    success: true,
    improvedContent: improved,
    changesMade: improved !== content ? 1 : 0,
    provider: 'builtin'
  };
};

/**
 * Generate topic ideas using built-in logic
 */
const generateTopicsBuiltin = (category) => {
  const topics = {
    technology: ['Future of AI in Education', 'Cybersecurity Best Practices for Students', 'Impact of 5G on Campus Connectivity'],
    education: ['Modern Study Techniques', 'Benefits of Collaborative Learning', 'Managing Academic Stress'],
    business: ['Entrepreneurship for Students', 'Digital Marketing Trends 2026', 'Financial Literacy for Beginners'],
    general: ['How to stay productive', 'Benefits of daily reading', 'Importance of community involvement']
  };

  return {
    success: true,
    topics: topics[category.toLowerCase()] || topics.general,
    provider: 'builtin'
  };
};

/**
 * Chat with AI using built-in logic with intelligent keyword matching
 */
const chatBuiltin = (message, context = "") => {
  const lowerMessage = message.toLowerCase().trim();

  // Registration and Getting Started
  if (lowerMessage.includes('register') || lowerMessage.includes('sign up') || lowerMessage.includes('join') || lowerMessage.includes('account')) {
    if (lowerMessage.includes('how') || lowerMessage.includes('?') || lowerMessage.includes('do i')) {
      return {
        success: true,
        reply: "To register on the Admas University Blog platform:\n\n1. Click 'Register' button on the homepage\n2. Fill in your details (name, email, university ID)\n3. Choose your role (Student, Faculty, or Alumni)\n4. Accept the terms and conditions\n5. Submit the form\n\n📧 You'll receive a verification email - click the link to verify your account\n\n⏳ After verification:\n• Students & Faculty: Wait for admin approval (usually 24-48 hours)\n• Alumni: Submit verification documents for approval\n\nOnce approved, you can start blogging! Need help with any specific step?",
        provider: 'builtin'
      };
    }
  }

  // Email Verification
  if (lowerMessage.includes('verif') || lowerMessage.includes('email') && (lowerMessage.includes('confirm') || lowerMessage.includes('activate'))) {
    return {
      success: true,
      reply: "Email Verification Steps:\n\n1. Check your inbox for an email from Admas Blog\n2. Click the verification link in the email\n3. You'll be redirected to a confirmation page\n\n❗ Didn't receive the email?\n• Check your spam/junk folder\n• Wait a few minutes and try again\n• Click 'Resend Verification Email' on the login page\n\nAfter verification, wait for admin approval before you can start posting!",
      provider: 'builtin'
    };
  }

  // Approval Process
  if (lowerMessage.includes('approval') || lowerMessage.includes('pending') || lowerMessage.includes('waiting') && lowerMessage.includes('account')) {
    return {
      success: true,
      reply: "Account Approval Process:\n\n📋 After email verification, your account goes to admin review:\n\n• Students/Faculty: Usually approved within 24-48 hours\n• Alumni: May take longer due to document verification\n\nYou'll receive an email notification when approved!\n\n✅ Once approved, you can:\n• Create and publish blog posts\n• Comment on other posts\n• Collaborate with other authors\n• Access all platform features\n\nStill waiting? Contact support if it's been more than 3 days.",
      provider: 'builtin'
    };
  }

  // Login Issues
  if (lowerMessage.includes('login') || lowerMessage.includes('log in') || lowerMessage.includes('sign in')) {
    if (lowerMessage.includes('can\'t') || lowerMessage.includes('cannot') || lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
      return {
        success: true,
        reply: "Login Troubleshooting:\n\n🔐 Common issues:\n\n1. **Wrong password**: Use 'Forgot Password' to reset\n2. **Email not verified**: Check your inbox and verify\n3. **Account pending**: Wait for admin approval\n4. **Account suspended**: Contact admin\n\n💡 Tips:\n• Make sure you're using the correct email\n• Check caps lock is off\n• Clear browser cache and try again\n\nStill having trouble? Let me know the specific error message!",
        provider: 'builtin'
      };
    }
  }

  // Roles and Permissions
  if (lowerMessage.includes('role') || lowerMessage.includes('permission') || lowerMessage.includes('author') && lowerMessage.includes('what')) {
    return {
      success: true,
      reply: "Platform Roles:\n\n👨‍🎓 **Student/Faculty Author**:\n• Create and edit posts\n• Request peer reviews\n• Collaborate with co-authors\n• Comment on posts\n\n👔 **Moderator**:\n• Review and approve posts\n• Manage content quality\n• Provide feedback to authors\n\n⚙️ **Admin**:\n• Full platform control\n• User management\n• System settings\n\nYour role is assigned during registration and determines what you can do on the platform!",
      provider: 'builtin'
    };
  }

  // Greeting patterns
  const greetings = /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy|hiya)\b/i;
  if (greetings.test(lowerMessage)) {
    return {
      success: true,
      reply: "Hello! 👋 I'm your Admas University Blog Assistant. I'm here to help you navigate the platform, answer questions about blogging, and assist with your writing. How can I help you today?",
      provider: 'builtin'
    };
  }

  // Platform/University questions
  if (lowerMessage.includes('admas') || lowerMessage.includes('university') || lowerMessage.includes('platform')) {
    if (lowerMessage.includes('what is') || lowerMessage.includes('tell me about') || lowerMessage.includes('about')) {
      return {
        success: true,
        reply: "The Admas University Blogging Platform is a collaborative space designed for students, faculty, and alumni to share knowledge, research, and experiences. It features AI-powered writing assistance, real-time collaboration, peer review workflows, and a vibrant community of academic writers.",
        provider: 'builtin'
      };
    }
  }

  // Creating posts
  if ((lowerMessage.includes('create') || lowerMessage.includes('write') || lowerMessage.includes('post') || lowerMessage.includes('publish')) &&
    (lowerMessage.includes('how') || lowerMessage.includes('where') || lowerMessage.includes('?'))) {
    return {
      success: true,
      reply: "To create a new blog post:\n1. Click on 'Create Post' in your dashboard or navigation menu\n2. Write your content using our rich text editor\n3. Use AI tools for grammar checking and content improvement\n4. Add categories and tags\n5. Submit for review or publish directly (depending on your role)\n\nWould you like help with any specific part of the writing process?",
      provider: 'builtin'
    };
  }

  // AI features
  if (lowerMessage.includes('ai') || lowerMessage.includes('grammar') || lowerMessage.includes('improve') || lowerMessage.includes('suggestions')) {
    return {
      success: true,
      reply: "Our platform offers several AI-powered features:\n• Grammar & Spelling Check\n• Content Improvement Suggestions\n• Topic Ideas Generator\n• Keyword Suggestions\n• Content Analysis\n\nYou can access these tools while creating or editing a post. Just look for the AI assistant panel in the editor!",
      provider: 'builtin'
    };
  }

  // Collaboration
  if (lowerMessage.includes('collaborate') || lowerMessage.includes('co-author') || lowerMessage.includes('work together')) {
    return {
      success: true,
      reply: "Our platform supports real-time collaboration! You can:\n• Invite co-authors to your posts\n• See who's editing in real-time\n• View typing indicators\n• Request peer reviews from other authors\n\nCollaboration makes your content stronger through diverse perspectives!",
      provider: 'builtin'
    };
  }

  // Help/Support
  if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('how do i') || lowerMessage.includes('how can i')) {
    return {
      success: true,
      reply: "I'm here to help! I can assist you with:\n• Creating and editing blog posts\n• Using AI writing tools\n• Understanding platform features\n• Collaboration and peer review\n• Publishing and moderation process\n\nWhat specific topic would you like to know more about?",
      provider: 'builtin'
    };
  }

  // Categories
  if (lowerMessage.includes('categor') || lowerMessage.includes('topic')) {
    return {
      success: true,
      reply: "Our platform supports multiple categories including Technology, Education, Science, Business, and more. You can browse posts by category or select appropriate categories when creating your own content. This helps readers find content relevant to their interests!",
      provider: 'builtin'
    };
  }

  // Review/Moderation
  if (lowerMessage.includes('review') || lowerMessage.includes('approve') || lowerMessage.includes('moderat')) {
    return {
      success: true,
      reply: "The review process ensures quality content:\n• Authors submit posts for review\n• Moderators review and provide feedback\n• Posts can be approved, rejected, or sent back for revision\n• Peer reviewers can also provide structured feedback\n\nThis collaborative process helps maintain high content standards!",
      provider: 'builtin'
    };
  }

  // Dashboard/Navigation
  if (lowerMessage.includes('dashboard') || lowerMessage.includes('navigate') || lowerMessage.includes('find')) {
    return {
      success: true,
      reply: "Your dashboard is your central hub! From there you can:\n• View your posts and their status\n• Access analytics and statistics\n• Create new content\n• Manage your profile\n• Check notifications\n\nThe navigation menu provides quick access to all platform features.",
      provider: 'builtin'
    };
  }

  // Thank you
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return {
      success: true,
      reply: "You're welcome! I'm always here to help. Feel free to ask me anything about the platform or your blogging journey. Happy writing! ✍️",
      provider: 'builtin'
    };
  }

  // Goodbye
  if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
    return {
      success: true,
      reply: "Goodbye! Feel free to reach out anytime you need assistance. Happy blogging! 👋",
      provider: 'builtin'
    };
  }

  // Default fallback - more contextual
  const defaultResponses = [
    "I'm here to help you with the Admas University Blog platform! You can ask me about creating posts, using AI tools, collaboration features, or anything else related to blogging here.",
    "I can assist you with writing, editing, publishing, and navigating the platform. What would you like to know?",
    "Feel free to ask me about any platform features, writing tips, or how to get started with your blog posts!",
  ];

  return {
    success: true,
    reply: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
    provider: 'builtin'
  };
};

/**
 * Generate keywords using built-in logic
 */
const generateBuiltinKeywords = (title, content, category) => {
  const topic = extractTopic(title);
  const words = topic.split(' ');

  // Generate keywords from title and category
  const keywords = [
    ...words,
    category,
    `${category} ${words[0] || ''}`.trim(),
    'university',
    'education',
    'learning',
    'academic',
    'research'
  ].filter((k, i, arr) => k && arr.indexOf(k) === i).slice(0, 8);

  const tags = words.slice(0, 3).map(w => w.toLowerCase());

  return {
    success: true,
    keywords,
    tags,
    seoTitle: title.length > 60 ? title.substring(0, 57) + '...' : title,
    metaDescription: `Explore ${topic} in this comprehensive article covering key concepts and insights for students and professionals.`,
    provider: 'builtin'
  };
};

/**
 * Analyze content using built-in rules
 */
const analyzeBuiltinContent = (content) => {
  const lowerContent = content.toLowerCase();
  const flags = [];

  // Simple rule-based checks
  const inappropriatePatterns = [
    { pattern: /\b(hate|kill|murder|attack)\b/gi, flag: 'potentially violent language' },
    { pattern: /\b(spam|buy now|click here|free money)\b/gi, flag: 'potential spam' },
  ];

  inappropriatePatterns.forEach(({ pattern, flag }) => {
    if (pattern.test(lowerContent)) {
      flags.push(flag);
    }
  });

  return {
    success: true,
    isAppropriate: flags.length === 0,
    flags,
    confidence: 70,
    severity: flags.length === 0 ? 'none' : 'low',
    recommendation: flags.length === 0 ? 'approve' : 'review',
    details: flags.length === 0 ? 'Content appears appropriate' : 'Some content may need review',
    provider: 'builtin'
  };
};

// ============================================================================
// EXTERNAL AI PROVIDERS
// ============================================================================

/**
 * Call Ollama API (local LLM)
 */
const callOllama = async (prompt, systemPrompt) => {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  const model = process.env.OLLAMA_LLAMA3_MODEL || 'llama3:latest';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: `${systemPrompt}\n\nUser: ${prompt}`,
        stream: false,
        options: { temperature: 0.7, num_predict: 800 }
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
    const data = await response.json();
    return data.response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
};

/**
 * Try external AI providers, fall back to builtin
 * Priority: Groq (free & fast) -> OpenAI -> Ollama -> Builtin
 */
const tryExternalProviders = async (systemPrompt, userPrompt) => {
  // Try Groq FIRST (free and fast)
  if (groqClient) {
    try {
      console.log('🤖 Trying Groq...');
      const response = await groqClient.chat.completions.create({
        model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.7,
      });
      console.log('✅ Groq success');
      return { success: true, content: response.choices[0].message.content, provider: 'groq' };
    } catch (e) {
      console.log('❌ Groq failed:', e.message);
    }
  }

  // Try OpenAI second
  if (openaiClient) {
    try {
      console.log('🤖 Trying OpenAI...');
      const response = await openaiClient.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.7,
      });
      console.log('✅ OpenAI success');
      return { success: true, content: response.choices[0].message.content, provider: 'openai' };
    } catch (e) {
      console.log('❌ OpenAI failed:', e.message);
    }
  }

  // Try Ollama
  if (process.env.OLLAMA_URL) {
    try {
      console.log('🤖 Trying Ollama...');
      const content = await callOllama(userPrompt, systemPrompt);
      console.log('✅ Ollama success');
      return { success: true, content, provider: 'ollama' };
    } catch (e) {
      console.log('❌ Ollama failed:', e.message);
    }
  }

  return { success: false };
};

/**
 * Parse JSON from AI response
 */
const parseJsonResponse = (content) => {
  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    }
    throw new Error('Could not parse JSON');
  }
};

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Generate content paragraph suggestions
 */
export const generateContentParagraphs = async (title, category = 'general') => {
  if (!title || title.length < 5) {
    return {
      success: false,
      paragraphs: [],
      message: 'Title must be at least 5 characters'
    };
  }

  // Try external providers first
  const systemPrompt = `You are a writing assistant. Generate 3 paragraphs for a blog post.
Respond with ONLY valid JSON: {"paragraphs": [{"id": "p1", "text": "...", "type": "introduction"}, {"id": "p2", "text": "...", "type": "body"}, {"id": "p3", "text": "...", "type": "conclusion"}]}`;

  const result = await tryExternalProviders(systemPrompt, `Title: ${title}\nCategory: ${category}`);

  if (result.success) {
    try {
      const parsed = parseJsonResponse(result.content);
      if (parsed.paragraphs?.length >= 2) {
        return {
          success: true,
          paragraphs: parsed.paragraphs.slice(0, 3),
          generatedAt: new Date().toISOString(),
          provider: result.provider
        };
      }
    } catch (e) {
      console.log('Failed to parse AI response, using builtin');
    }
  }

  // Fall back to built-in generator
  console.log('📝 Using built-in content generator');
  return generateBuiltinContent(title, category);
};

/**
 * Generate keyword suggestions
 */
export const generateKeywordSuggestions = async (title, content, category) => {
  const systemPrompt = `Generate SEO keywords. Respond with ONLY JSON: {"keywords": [...], "tags": [...], "seoTitle": "...", "metaDescription": "..."}`;
  const result = await tryExternalProviders(systemPrompt, `Title: ${title}\nCategory: ${category}\nContent: ${content?.substring(0, 1000) || ''}`);

  if (result.success) {
    try {
      const parsed = parseJsonResponse(result.content);
      return { success: true, ...parsed, provider: result.provider };
    } catch (e) { /* fall through */ }
  }

  return generateBuiltinKeywords(title, content, category);
};

/**
 * Analyze content for violations
 */
export const analyzeContent = async (content) => {
  const systemPrompt = `Analyze content for inappropriate material. Respond with JSON: {"isAppropriate": true, "flags": [], "severity": "none", "recommendation": "approve"}`;
  const result = await tryExternalProviders(systemPrompt, content.substring(0, 2000));

  if (result.success) {
    try {
      const parsed = parseJsonResponse(result.content);
      return { success: true, ...parsed, provider: result.provider };
    } catch (e) { /* fall through */ }
  }

  return analyzeBuiltinContent(content);
};

/**
 * Check grammar and spelling
 */
export const checkGrammar = async (content) => {
  const systemPrompt = `You are a professional editor. Check the following content for grammar and spelling errors. 
  Respond with ONLY JSON: {"errors": [{"text": "...", "error": "...", "suggestion": "..."}], "summary": "..."}`;

  const result = await tryExternalProviders(systemPrompt, content.substring(0, 2000));

  if (result.success) {
    try {
      const parsed = parseJsonResponse(result.content);
      return { success: true, ...parsed, provider: result.provider };
    } catch (e) { /* fall through */ }
  }

  return checkGrammarBuiltin(content);
};

/**
 * Improve content flow and vocabulary
 */
export const improveContent = async (content) => {
  const systemPrompt = `You are a professional writer. Improve the following content by enhancing its flow, vocabulary, and clarity. 
  Respond with ONLY JSON: {"improvedContent": "...", "changesMade": number}`;

  const result = await tryExternalProviders(systemPrompt, content.substring(0, 2000));

  if (result.success) {
    try {
      const parsed = parseJsonResponse(result.content);
      return { success: true, ...parsed, provider: result.provider };
    } catch (e) { /* fall through */ }
  }

  return improveContentBuiltin(content);
};

/**
 * Generate topic ideas based on category
 */
export const generateTopicIdeas = async (category) => {
  const systemPrompt = `Generate 5 creative blog post topic ideas for the category: ${category}. 
  Respond with ONLY JSON: {"topics": ["...", "...", "..."]}`;

  const result = await tryExternalProviders(systemPrompt, `Category: ${category}`);

  if (result.success) {
    try {
      const parsed = parseJsonResponse(result.content);
      return { success: true, ...parsed, provider: result.provider };
    } catch (e) { /* fall through */ }
  }

  return generateTopicsBuiltin(category);
};

/**
 * Interactive chat assistant
 */
export const chatWithAssistant = async (message, context = "") => {
  const systemPrompt = `You are the Admas University Blog Assistant. Help users with their questions about the platform, 
  writing tips, and university-related topics. Keep responses concise and helpful. Context: ${context}`;

  const result = await tryExternalProviders(systemPrompt, message);

  if (result.success) {
    return { success: true, reply: result.content, provider: result.provider };
  }

  return chatBuiltin(message);
};

/**
 * Detect spam
 */
export const detectSpam = async (content) => {
  const lowerContent = content.toLowerCase();
  const spamIndicators = [];

  if ((content.match(/http/gi) || []).length > 5) spamIndicators.push('excessive links');
  if (/buy now|click here|free money|act now/i.test(lowerContent)) spamIndicators.push('promotional language');
  if (/(.)\1{10,}/.test(content)) spamIndicators.push('repetitive characters');

  return {
    success: true,
    isSpam: spamIndicators.length > 1,
    confidence: spamIndicators.length > 0 ? 60 + spamIndicators.length * 15 : 10,
    indicators: spamIndicators,
    provider: 'builtin'
  };
};

/**
 * Get content suggestions
 */
export const getContentSuggestions = async (content) => {
  const wordCount = content.split(/\s+/).length;
  const suggestions = [];

  if (wordCount < 100) suggestions.push('Consider expanding your content for better engagement');
  if (wordCount > 2000) suggestions.push('Consider breaking this into multiple posts');
  if (!/[.!?]$/.test(content.trim())) suggestions.push('Ensure your content ends with proper punctuation');
  if (content.split('\n\n').length < 3) suggestions.push('Add more paragraph breaks for readability');

  return {
    success: true,
    overallScore: Math.min(10, Math.max(5, 7 + (wordCount > 200 ? 1 : 0) + (suggestions.length === 0 ? 2 : 0))),
    suggestions,
    strengths: wordCount > 100 ? ['Good content length'] : [],
    readabilityLevel: wordCount < 200 ? 'easy' : wordCount < 500 ? 'moderate' : 'advanced',
    provider: 'builtin'
  };
};

/**
 * Generate excerpt
 */
export const generateExcerpt = async (content, maxLength = 200) => {
  const plainText = content.replace(/<[^>]*>/g, '').trim();
  const sentences = plainText.match(/[^.!?]+[.!?]+/g) || [plainText];
  let excerpt = '';

  for (const sentence of sentences) {
    if ((excerpt + sentence).length <= maxLength) {
      excerpt += sentence;
    } else break;
  }

  return {
    success: true,
    excerpt: excerpt || plainText.substring(0, maxLength) + '...',
    provider: 'builtin'
  };
};

/**
 * Get service status
 */
export const getStatus = () => ({
  configured: true,
  providers: getAvailableProviders(),
  primaryProvider: getAvailableProviders()[0],
  hasBuiltinFallback: true
});

export default {
  isConfigured,
  getStatus,
  generateContentParagraphs,
  generateKeywordSuggestions,
  getContentSuggestions,
  generateExcerpt,
  checkGrammar,
  improveContent,
  generateTopicIdeas,
  chatWithAssistant
};
