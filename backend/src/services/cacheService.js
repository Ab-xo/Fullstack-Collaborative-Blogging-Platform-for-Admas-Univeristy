/**
 * In-Memory Cache Service
 * Fast caching without external dependencies
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.isConnected = true;
    this.defaultTTL = 300; // 5 minutes default
    
    // Cleanup expired entries every minute (silent)
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  async connect() {
    this.isConnected = true;
    return true;
  }

  async disconnect() {
    this.cache.clear();
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < now) {
        this.cache.delete(key);
      }
    }
  }

  async get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (entry.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttl * 1000)
    });
    return true;
  }

  async del(key) {
    this.cache.delete(key);
    return true;
  }

  async delByPattern(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
    return true;
  }

  async flush() {
    this.cache.clear();
    return true;
  }

  getStats() {
    return { size: this.cache.size, connected: this.isConnected };
  }

  static keys = {
    stats: () => 'stats:public',
    posts: (page, limit, category) => `posts:list:${page}:${limit}:${category || 'all'}`,
    post: (id) => `posts:single:${id}`,
    featured: () => 'posts:featured',
    categories: () => 'categories:all',
    category: (slug) => `categories:${slug}`,
    user: (id) => `users:${id}`,
    terms: (type) => `terms:${type}`,
    topAuthors: () => 'authors:top',
    activeMembers: () => 'members:active',
  };

  static ttl = {
    stats: 60, posts: 120, post: 300, featured: 180,
    categories: 600, terms: 3600, user: 300,
    topAuthors: 300, activeMembers: 300,
  };
}

const cacheService = new CacheService();
export default cacheService;
export { CacheService };
