/**
 * BlogPost Model - Backward Compatibility Wrapper
 * 
 * This file maintains backward compatibility by re-exporting
 * the modular BlogPost model from ./blogpost/index.js
 * 
 * All existing imports will continue to work:
 * import BlogPost from './models/BlogPost.js';
 * 
 * The actual model implementation is now in ./blogpost/ directory
 * for better organization and maintainability.
 */

import BlogPost from './blogpost/index.js';

export default BlogPost;