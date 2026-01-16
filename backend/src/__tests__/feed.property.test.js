/**
 * Property-Based Tests for Following Feed
 * Feature: following-feed
 * 
 * These tests verify universal properties that should hold across all inputs
 * using fast-check for property-based testing with 100+ iterations
 */

import fc from 'fast-check';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Follow from '../models/Follow.js';
import BlogPost from '../models/BlogPost.js';
import User from '../models/User.js';
import * as feedService from '../services/feedService.js';

let mongoServer;

// Setup in-memory MongoDB for testing
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clean up collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// ==================== GENERATORS ====================

/**
 * Generate a random user
 */
const userArbitrary = () => fc.record({
  firstName: fc.string({ minLength: 2, maxLength: 20 }),
  lastName: fc.string({ minLength: 2, maxLength: 20 }),
  email: fc.emailAddress(),
  password: fc.string({ minLength: 8, maxLength: 20 }),
  role: fc.constantFrom('author', 'user', 'admin'),
  profile: fc.record({
    avatar: fc.option(fc.webUrl(), { nil: '' }),
    bio: fc.option(fc.string({ maxLength: 200 }), { nil: '' })
  })
});

/**
 * Generate a random blog post
 */
const blogPostArbitrary = (authorId) => fc.record({
  title: fc.string({ minLength: 5, maxLength: 100 }),
  content: fc.string({ minLength: 50, maxLength: 500 }),
  excerpt: fc.string({ minLength: 10, maxLength: 150 }),
  author: fc.constant(authorId),
  status: fc.constantFrom('draft', 'published', 'archived'),
  category: fc.constantFrom('technology', 'academic', 'campus-life', 'career'),
  tags: fc.array(fc.string({ minLength: 3, maxLength: 15 }), { minLength: 0, maxLength: 5 }),
  featuredImage: fc.option(fc.webUrl(), { nil: '' }),
  publishedAt: fc.date({ min: new Date('2020-01-01'), max: new Date() }),
  likesCount: fc.nat({ max: 1000 }),
  commentsCount: fc.nat({ max: 500 }),
  views: fc.nat({ max: 10000 }),
  likes: fc.array(fc.constant(new mongoose.Types.ObjectId()), { maxLength: 10 })
});

// ==================== PROPERTY TESTS ====================

describe('Feed Property Tests', () => {
  
  /**
   * **Feature: following-feed, Property 1: Feed contains only published posts from followed authors**
   * **Validates: Requirements 1.1**
   */
  test('Property 1: Feed contains only published posts from followed authors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(userArbitrary(), { minLength: 3, maxLength: 10 }),
        fc.array(fc.nat({ max: 5 }), { minLength: 1, maxLength: 5 }), // indices of followed users
        async (usersData, followedIndices) => {
          // Create users
          const users = await Promise.all(
            usersData.map(data => User.create(data))
          );
          
          if (users.length === 0) return true;
          
          const currentUser = users[0];
          
          // Create follow relationships
          const followedUsers = followedIndices
            .map(idx => users[idx % users.length])
            .filter(u => u._id.toString() !== currentUser._id.toString());
          
          if (followedUsers.length === 0) return true;
          
          await Promise.all(
            followedUsers.map(followed =>
              Follow.create({
                follower: currentUser._id,
                following: followed._id
              })
            )
          );
          
          // Create posts for all users (some published, some not)
          const allPosts = [];
          for (const user of users) {
            const postData = await fc.sample(blogPostArbitrary(user._id), 3);
            const posts = await Promise.all(
              postData.map(data => BlogPost.create(data))
            );
            allPosts.push(...posts);
          }
          
          // Get feed
          const feed = await feedService.getFollowingFeed(currentUser._id.toString());
          
          // Verify all posts in feed are published and from followed authors
          const followedIds = followedUsers.map(u => u._id.toString());
          
          return feed.posts.every(post => {
            const isPublished = post.status === 'published';
            const isFromFollowed = followedIds.includes(post.author._id.toString());
            return isPublished && isFromFollowed;
          });
        }
      ),
      { numRuns: 100 }
    );
  }, 60000); // 60 second timeout for property test

  /**
   * **Feature: following-feed, Property 2: Feed posts are ordered by publication date descending**
   * **Validates: Requirements 1.2**
   */
  test('Property 2: Feed posts are ordered by publication date descending', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(userArbitrary(), { minLength: 2, maxLength: 5 }),
        async (usersData) => {
          // Create users
          const users = await Promise.all(
            usersData.map(data => User.create(data))
          );
          
          if (users.length < 2) return true;
          
          const currentUser = users[0];
          const followedUser = users[1];
          
          // Create follow relationship
          await Follow.create({
            follower: currentUser._id,
            following: followedUser._id
          });
          
          // Create multiple published posts with different dates
          const postDates = [
            new Date('2024-01-15'),
            new Date('2024-01-10'),
            new Date('2024-01-20'),
            new Date('2024-01-05')
          ];
          
          await Promise.all(
            postDates.map(date =>
              BlogPost.create({
                title: 'Test Post',
                content: 'Test content that is long enough to meet minimum requirements',
                author: followedUser._id,
                status: 'published',
                category: 'technology',
                publishedAt: date
              })
            )
          );
          
          // Get feed
          const feed = await feedService.getFollowingFeed(currentUser._id.toString());
          
          // Verify posts are ordered by publishedAt descending
          for (let i = 0; i < feed.posts.length - 1; i++) {
            const currentDate = new Date(feed.posts[i].publishedAt);
            const nextDate = new Date(feed.posts[i + 1].publishedAt);
            if (currentDate < nextDate) {
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * **Feature: following-feed, Property 3: Feed posts contain all required metadata fields**
   * **Validates: Requirements 1.4**
   */
  test('Property 3: Feed posts contain all required metadata fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(userArbitrary(), { minLength: 2, maxLength: 5 }),
        async (usersData) => {
          // Create users
          const users = await Promise.all(
            usersData.map(data => User.create(data))
          );
          
          if (users.length < 2) return true;
          
          const currentUser = users[0];
          const followedUser = users[1];
          
          // Create follow relationship
          await Follow.create({
            follower: currentUser._id,
            following: followedUser._id
          });
          
          // Create a published post
          await BlogPost.create({
            title: 'Test Post with All Fields',
            content: 'Test content that is long enough to meet minimum requirements for a blog post',
            excerpt: 'Test excerpt',
            author: followedUser._id,
            status: 'published',
            category: 'technology',
            featuredImage: 'https://example.com/image.jpg',
            publishedAt: new Date(),
            likesCount: 10,
            commentsCount: 5,
            views: 100
          });
          
          // Get feed
          const feed = await feedService.getFollowingFeed(currentUser._id.toString());
          
          // Verify all required fields are present
          return feed.posts.every(post => {
            const hasTitle = post.title && typeof post.title === 'string';
            const hasExcerpt = post.hasOwnProperty('excerpt');
            const hasAuthor = post.author && post.author.firstName && post.author.lastName;
            const hasFeaturedImage = post.hasOwnProperty('featuredImage');
            const hasPublishedAt = post.publishedAt && post.publishedAt instanceof Date;
            const hasLikesCount = typeof post.likesCount === 'number';
            const hasCommentsCount = typeof post.commentsCount === 'number';
            const hasViews = typeof post.views === 'number';
            
            return hasTitle && hasExcerpt && hasAuthor && hasFeaturedImage && 
                   hasPublishedAt && hasLikesCount && hasCommentsCount && hasViews;
          });
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});
