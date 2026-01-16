import mongoose from 'mongoose';
import { blogPostSchemaFields, schemaOptions, schemaIndexes } from './blogpost.schema.js';
import { addVirtuals } from './blogpost.virtuals.js';
import { addMiddleware } from './blogpost.middleware.js';
import { addInstanceMethods } from './blogpost.methods.js';
import { addStaticMethods } from './blogpost.statics.js';
import { addQueryHelpers } from './blogpost.queries.js';

/**
 * BlogPost Model - Modular Structure
 * 
 * This file assembles the BlogPost model from modular components:
 * - blogpost.schema.js: Schema field definitions
 * - blogpost.virtuals.js: Virtual properties
 * - blogpost.middleware.js: Pre/post hooks
 * - blogpost.methods.js: Instance methods
 * - blogpost.statics.js: Static methods
 * - blogpost.queries.js: Query helpers
 */

// Create schema with fields and options
const blogPostSchema = new mongoose.Schema(blogPostSchemaFields, schemaOptions);

// Add indexes
schemaIndexes.forEach(({ fields, options }) => {
  blogPostSchema.index(fields, options);
});

// Add virtuals
addVirtuals(blogPostSchema);

// Add middleware (hooks)
addMiddleware(blogPostSchema);

// Add instance methods
addInstanceMethods(blogPostSchema);

// Add static methods
addStaticMethods(blogPostSchema);

// Add query helpers
addQueryHelpers(blogPostSchema);

// Create and export model
const BlogPost = mongoose.model('BlogPost', blogPostSchema);

export default BlogPost;
