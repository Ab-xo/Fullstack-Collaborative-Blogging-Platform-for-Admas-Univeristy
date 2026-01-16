# BlogPost Model Documentation

## Overview

The BlogPost model represents blog posts in the Admas University Collaborative Blogging Platform. It has been refactored into a modular structure for better maintainability and organization.

## Structure

```
blogpost/
├── index.js                 # Main entry point - assembles the model
├── blogpost.schema.js       # Schema field definitions and indexes
├── blogpost.methods.js      # Instance methods
├── blogpost.statics.js      # Static methods
├── blogpost.virtuals.js     # Virtual properties
├── blogpost.middleware.js   # Pre/post hooks
├── blogpost.queries.js      # Query helpers
├── README.md               # This file
└── STRUCTURE.md            # Detailed structure documentation
```

## Usage

### Import the Model

```javascript
import BlogPost from "./models/blogpost/index.js";
```

### Create a New Post

```javascript
const post = await BlogPost.create({
  title: "My First Blog Post",
  content: "This is the content of my blog post...",
  author: userId,
  category: "technology",
  tags: ["javascript", "nodejs"],
});
```

### Query Posts

```javascript
// Find all published posts
const publishedPosts = await BlogPost.findPublished();

// Find posts by category
const techPosts = await BlogPost.findByCategory("technology");

// Find popular posts
const popularPosts = await BlogPost.findPopular(10);

// Chain query helpers
const posts = await BlogPost.find()
  .published()
  .byCategory("technology")
  .recent()
  .limit(10);
```

### Instance Methods

```javascript
// Increment views
await post.incrementViews();

// Add/remove likes
await post.addLike(userId);
await post.removeLike(userId);

// Check if user liked
const isLiked = post.isLikedBy(userId);

// Status management
await post.publish();
await post.submitForReview();
await post.archive();

// Moderation
await post.approve(moderatorId, "Looks good!");
await post.reject(moderatorId, "Needs revision");
```

### Virtual Properties

```javascript
// Reading time in minutes
console.log(post.readingTime); // e.g., 5

// Word count
console.log(post.wordCount); // e.g., 1000

// Engagement score
console.log(post.engagementScore); // e.g., 150

// Time since published
console.log(post.timeSincePublished); // e.g., "2 days ago"
```

## Schema Fields

### Basic Information

- `title` - Post title (5-200 characters, required)
- `content` - Post content (min 50 characters, required)
- `excerpt` - Brief summary (max 300 characters, auto-generated)

### Author

- `author` - Reference to User model (required)

### Categorization

- `category` - Post category (enum, required)
- `tags` - Array of tags (max 30 characters each)

### Media

- `featuredImage` - URL to featured image

### Status & Workflow

- `status` - Current status (draft, pending, published, rejected, archived)
- `moderatedBy` - Reference to moderator User
- `moderationNotes` - Moderation feedback
- `moderatedAt` - Moderation timestamp
- `publishedAt` - Publication timestamp

### SEO

- `slug` - URL-friendly identifier (auto-generated, unique)
- `metaDescription` - SEO meta description (max 160 characters)

### Engagement

- `views` - View count
- `likes` - Array of User references who liked
- `likesCount` - Cached like count
- `commentsCount` - Cached comment count

### Timestamps

- `createdAt` - Creation timestamp (auto)
- `updatedAt` - Last update timestamp (auto)

## Indexes

The model includes optimized indexes for common query patterns:

- `{ author: 1, createdAt: -1 }` - Author's posts by date
- `{ status: 1, publishedAt: -1 }` - Published posts by date
- `{ category: 1, publishedAt: -1 }` - Category posts by date
- `{ tags: 1 }` - Tag-based queries
- `{ likesCount: -1 }` - Popular posts
- `{ views: -1 }` - Most viewed posts

## Middleware Hooks

### Pre-save

- Updates `updatedAt` timestamp
- Auto-generates `excerpt` from content if not provided
- Auto-generates `slug` from title if not provided
- Validates status transitions

### Pre-remove

- Cascades deletion to associated comments

### Pre-find

- Auto-populates author information

## Status Workflow

```
draft → pending → published
  ↓       ↓          ↓
archived ← rejected ← archived
```

Valid transitions:

- `draft` → `pending`, `archived`
- `pending` → `published`, `rejected`, `draft`
- `published` → `archived`
- `rejected` → `draft`, `pending`
- `archived` → `draft`

## Best Practices

1. **Always populate author** when displaying posts to users
2. **Use query helpers** for cleaner, more readable queries
3. **Leverage virtuals** for computed properties instead of storing redundant data
4. **Use instance methods** for post-specific operations
5. **Use static methods** for collection-level operations
6. **Check authorization** before allowing edits (use `canEdit()` method)

## Examples

### Complete CRUD Example

```javascript
// Create
const post = await BlogPost.create({
  title: "Understanding Node.js",
  content: "Node.js is a JavaScript runtime...",
  author: req.user._id,
  category: "technology",
  tags: ["nodejs", "javascript", "backend"],
});

// Read
const foundPost = await BlogPost.findById(postId);
await foundPost.incrementViews();

// Update
foundPost.title = "Understanding Node.js - Updated";
await foundPost.save();

// Delete
await foundPost.deleteOne();
```

### Advanced Query Example

```javascript
const posts = await BlogPost.find()
  .published()
  .byCategory("technology")
  .minViews(100)
  .recent()
  .paginate(1, 10)
  .populate("author", "firstName lastName profile");
```

## Migration from Old Model

The old monolithic `BlogPost.js` model has been refactored into this modular structure. All functionality remains the same, but the code is now better organized and easier to maintain.

To use the new model, simply update your imports:

```javascript
// Old
import BlogPost from "./models/BlogPost.js";

// New
import BlogPost from "./models/blogpost/index.js";
```

All existing code should work without changes.
