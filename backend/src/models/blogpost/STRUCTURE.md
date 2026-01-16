# BlogPost Model Structure

## File Organization

### index.js

**Purpose:** Main entry point that assembles the complete model

**Responsibilities:**

- Import all modular components
- Create the Mongoose schema
- Apply indexes
- Add virtuals, middleware, methods, statics, and query helpers
- Export the final model

**Pattern:**

```javascript
import components from './component-files';
const schema = new Schema(fields, options);
// Apply all components
export model;
```

---

### blogpost.schema.js

**Purpose:** Define schema fields, options, and indexes

**Exports:**

- `blogPostSchemaFields` - Object containing all field definitions
- `schemaOptions` - Schema configuration options
- `schemaIndexes` - Array of index definitions

**Field Groups:**

1. Basic Information (title, content, excerpt)
2. Author Information (author reference)
3. Categorization (category, tags)
4. Media (featuredImage)
5. Status & Workflow (status, moderation fields)
6. Publishing (publishedAt)
7. SEO (slug, metaDescription)
8. Engagement (views, likes, comments counts)
9. Timestamps (createdAt, updatedAt)

---

### blogpost.methods.js

**Purpose:** Instance methods available on individual documents

**Method Categories:**

1. **Engagement Methods**

   - `incrementViews()` - Increment view count
   - `addLike(userId)` - Add user like
   - `removeLike(userId)` - Remove user like
   - `isLikedBy(userId)` - Check if user liked

2. **Authorization Methods**

   - `canEdit(userId)` - Check edit permission

3. **Status Methods**

   - `publish()` - Publish the post
   - `submitForReview()` - Submit for moderation
   - `archive()` - Archive the post
   - `approve(moderatorId, notes)` - Approve post
   - `reject(moderatorId, notes)` - Reject post

4. **Validation Methods**
   - `isPublished()` - Check if published
   - `isDraft()` - Check if draft
   - `isPending()` - Check if pending
   - `isRejected()` - Check if rejected
   - `isArchived()` - Check if archived

**Usage Pattern:**

```javascript
const post = await BlogPost.findById(id);
await post.incrementViews();
const canEdit = post.canEdit(userId);
```

---

### blogpost.statics.js

**Purpose:** Static methods available on the model itself

**Method Categories:**

1. **Finder Methods**

   - `findPublished()` - Get all published posts
   - `findByAuthor(authorId)` - Get posts by author
   - `findByCategory(category)` - Get posts by category
   - `findByTag(tag)` - Get posts by tag
   - `findPending()` - Get pending posts
   - `findRecent(limit)` - Get recent posts
   - `findPopular(limit)` - Get popular posts
   - `findTrending(limit)` - Get trending posts

2. **Search Methods**

   - `search(query, options)` - Full-text search

3. **Statistics Methods**
   - `getStatistics()` - Get post statistics

**Usage Pattern:**

```javascript
const posts = await BlogPost.findPublished();
const popular = await BlogPost.findPopular(10);
```

---

### blogpost.virtuals.js

**Purpose:** Computed properties not stored in database

**Virtual Properties:**

1. **comments** - Populate comments from Comment model
2. **readingTime** - Calculate reading time in minutes
3. **wordCount** - Count words in content
4. **engagementScore** - Calculate engagement metric
5. **publishedDateFormatted** - Format published date
6. **timeSincePublished** - Human-readable time since publication
7. **preview** - First 150 characters of content

**Usage Pattern:**

```javascript
const post = await BlogPost.findById(id);
console.log(post.readingTime); // 5 minutes
console.log(post.engagementScore); // 150
```

---

### blogpost.middleware.js

**Purpose:** Pre and post hooks for various operations

**Hook Categories:**

1. **Pre-save Hooks**

   - Update `updatedAt` timestamp
   - Auto-generate excerpt from content
   - Auto-generate slug from title
   - Validate status transitions

2. **Post-save Hooks**

   - Log post creation

3. **Pre-remove Hooks**

   - Cascade delete comments

4. **Pre-find Hooks**
   - Auto-populate author

**Execution Flow:**

```
Operation Triggered → Pre Hook → Database Operation → Post Hook → Result
```

---

### blogpost.queries.js

**Purpose:** Chainable query helper methods

**Query Helper Categories:**

1. **Status Filters**

   - `published()` - Filter published posts
   - `drafts()` - Filter draft posts
   - `pending()` - Filter pending posts
   - `notArchived()` - Exclude archived posts

2. **Content Filters**

   - `byCategory(category)` - Filter by category
   - `byTag(tag)` - Filter by tag
   - `byAuthor(authorId)` - Filter by author
   - `search(text)` - Search in title/content/tags
   - `withFeaturedImage()` - Only posts with images

3. **Sorting**

   - `popular()` - Sort by popularity
   - `recent()` - Sort by date
   - `mostViewed()` - Sort by views
   - `mostLiked()` - Sort by likes

4. **Range Filters**

   - `publishedBetween(start, end)` - Date range
   - `minViews(count)` - Minimum views
   - `minLikes(count)` - Minimum likes

5. **Pagination**
   - `paginate(page, limit)` - Paginate results

**Usage Pattern:**

```javascript
const posts = await BlogPost.find()
  .published()
  .byCategory("technology")
  .recent()
  .paginate(1, 10);
```

---

## Data Flow

### Creating a Post

```
1. User submits form data
2. Controller receives request
3. BlogPost.create() called
4. Pre-save middleware runs:
   - Updates timestamp
   - Generates excerpt
   - Generates slug
5. Document saved to database
6. Post-save middleware runs:
   - Logs creation
7. Response sent to client
```

### Querying Posts

```
1. Controller calls BlogPost.find()
2. Query helpers applied (.published().recent())
3. Pre-find middleware runs:
   - Populates author
4. Database query executed
5. Results returned
6. Virtuals computed on results
7. Response sent to client
```

### Updating a Post

```
1. Post retrieved from database
2. Fields modified
3. post.save() called
4. Pre-save middleware runs:
   - Updates timestamp
   - Validates status transition
5. Document updated in database
6. Response sent to client
```

### Deleting a Post

```
1. Post retrieved from database
2. post.deleteOne() called
3. Pre-remove middleware runs:
   - Deletes associated comments
4. Document removed from database
5. Response sent to client
```

---

## Relationships

### BlogPost → User (Author)

- Type: Many-to-One
- Field: `author` (ObjectId reference)
- Population: Auto-populated in queries

### BlogPost → User (Moderator)

- Type: Many-to-One
- Field: `moderatedBy` (ObjectId reference)
- Population: Manual

### BlogPost → User (Likes)

- Type: Many-to-Many
- Field: `likes` (Array of ObjectId references)
- Population: Manual

### BlogPost ← Comment

- Type: One-to-Many
- Virtual: `comments`
- Population: Manual via virtual

---

## Indexes Strategy

### Compound Indexes

1. `{ author: 1, createdAt: -1 }` - Author's posts chronologically
2. `{ status: 1, publishedAt: -1 }` - Published posts chronologically
3. `{ category: 1, publishedAt: -1 }` - Category posts chronologically

### Single Field Indexes

1. `{ tags: 1 }` - Tag-based queries
2. `{ likesCount: -1 }` - Popular posts
3. `{ views: -1 }` - Most viewed posts

### Unique Indexes

1. `{ slug: 1 }` - Unique slugs (sparse)

**Query Optimization:**

- Author queries use `author + createdAt` index
- Public listings use `status + publishedAt` index
- Category pages use `category + publishedAt` index
- Popular/trending use `likesCount` or `views` index

---

## Best Practices

### DO:

✅ Use query helpers for readable queries
✅ Leverage virtuals for computed properties
✅ Use instance methods for document operations
✅ Use static methods for collection operations
✅ Populate author in user-facing queries
✅ Check `canEdit()` before allowing modifications
✅ Use status methods for workflow transitions

### DON'T:

❌ Modify schema fields directly in controllers
❌ Bypass middleware by using `updateOne()` without loading document
❌ Store computed values that can be virtuals
❌ Forget to handle cascade deletions
❌ Skip authorization checks
❌ Use `find()` without status filters for public queries

---

## Testing Considerations

### Unit Tests

- Test each method in isolation
- Mock database operations
- Verify middleware execution
- Test virtual property calculations

### Integration Tests

- Test complete CRUD workflows
- Verify cascade deletions
- Test query helper chains
- Verify index usage

### Property-Based Tests

- Test with random valid inputs
- Verify invariants (likesCount = likes.length)
- Test status transitions
- Verify slug generation uniqueness

---

## Performance Considerations

1. **Indexes:** All common query patterns are indexed
2. **Lean Queries:** Use `.lean()` for read-only operations
3. **Selective Population:** Only populate when needed
4. **Pagination:** Always paginate large result sets
5. **Caching:** Consider caching published posts
6. **Aggregation:** Use aggregation pipeline for complex queries

---

## Migration Notes

### From Monolithic Model

The refactoring maintains 100% backward compatibility. All existing code continues to work without changes. The only difference is the import path:

```javascript
// Old
import BlogPost from "./models/BlogPost.js";

// New
import BlogPost from "./models/blogpost/index.js";
```

### Benefits of Modular Structure

1. **Maintainability:** Each file has a single responsibility
2. **Testability:** Components can be tested in isolation
3. **Readability:** Easier to find and understand specific functionality
4. **Scalability:** Easy to add new methods without cluttering
5. **Collaboration:** Multiple developers can work on different files
6. **Documentation:** Each file is self-documenting

---

## Future Enhancements

Potential additions to consider:

1. **Versioning:** Track post revisions
2. **Scheduling:** Schedule future publications
3. **Analytics:** Track detailed engagement metrics
4. **Collaboration:** Multiple authors per post
5. **Translations:** Multi-language support
6. **Media Gallery:** Multiple images per post
7. **Related Posts:** Automatic suggestions
8. **Reading Lists:** User-curated collections
