/**
 * Integration Tests for Following Feed
 * Feature: following-feed
 * 
 * These tests verify the correctness properties of the feed system
 */

import mongoose from 'mongoose';
import Follow from '../models/Follow.js';
import BlogPost from '../models/BlogPost.js';
import User from '../models/User.js';
import * as feedService from '../services/feedService.js';

// Mock data helpers
const createUser = async (overrides = {}) => {
  const userData = {
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}${Math.random()}@example.com`,
    password: 'password123',
    role: 'author',
    ...overrides
  };
  return await User.create(userData);
};

const createPost = async (authorId, overrides = {}) => {
  const postData = {
    title: 'Test Post Title',
    content: 'This is test content that meets the minimum length requirement for a blog post',
    excerpt: 'Test excerpt',
    author: authorId,
    status: 'published',
    category: 'technology',
    publishedAt: new Date(),
    ...overrides
  };
  return await BlogPost.create(postData);
};

describe('Feed Service Tests', () => {
  
  // Skip tests if not connected to database
  beforeAll(() => {
    if (mongoose.connection.readyState !== 1) {
      console.log('Skipping feed tests - database not connected');
    }
  });

  /**
   * **Feature: following-feed, Property 1: Feed contains only published posts from followed authors**
   * **Validates: Requirements 1.1**
   */
  describe('Property 1: Feed content validation', () => {
    test('should only return published posts from followed authors', async () => {
      if (mongoose.connection.readyState !== 1) return;

      // Create users
      const currentUser = await createUser({ email: 'current@test.com' });
      const followedAuthor = await createUser({ email: 'followed@test.com' });
      const unfollowedAuthor = await createUser({ email: 'unfollowed@test.com' });

      // Create follow relationship
      await Follow.create({
        follower: currentUser._id,
        following: followedAuthor._id
      });

      // Create posts
      const publishedPost = await createPost(followedAuthor._id, { status: 'published' });
      const draftPost = await createPost(followedAuthor._id, { status: 'draft' });
      const unfollowedPost = await createPost(unfollowedAuthor._id, { status: 'published' });

      // Get feed
      const feed = await feedService.getFollowingFeed(currentUser._id.toString());

      // Verify only published post from followed author is in feed
      expect(feed.posts).toHaveLength(1);
      expect(feed.posts[0]._id.toString()).toBe(publishedPost._id.toString());
      expect(feed.posts[0].status).toBe('published');
      expect(feed.posts[0].author._id.toString()).toBe(followedAuthor._id.toString());

      // Cleanup
      await User.deleteMany({ _id: { $in: [currentUser._id, followedAuthor._id, unfollowedAuthor._id] } });
      await BlogPost.deleteMany({ _id: { $in: [publishedPost._id, draftPost._id, unfollowedPost._id] } });
      await Follow.deleteMany({ follower: currentUser._id });
    });
  });

  /**
   * **Feature: following-feed, Property 2: Feed posts are ordered by publication date descending**
   * **Validates: Requirements 1.2**
   */
  describe('Property 2: Feed ordering', () => {
    test('should order posts by publication date descending', async () => {
      if (mongoose.connection.readyState !== 1) return;

      // Create users
      const currentUser = await createUser({ email: 'current2@test.com' });
      const author = await createUser({ email: 'author2@test.com' });

      // Create follow relationship
      await Follow.create({
        follower: currentUser._id,
        following: author._id
      });

      // Create posts with different dates
      const post1 = await createPost(author._id, { 
        publishedAt: new Date('2024-01-10'),
        title: 'Post 1'
      });
      const post2 = await createPost(author._id, { 
        publishedAt: new Date('2024-01-20'),
        title: 'Post 2'
      });
      const post3 = await createPost(author._id, { 
        publishedAt: new Date('2024-01-15'),
        title: 'Post 3'
      });

      // Get feed
      const feed = await feedService.getFollowingFeed(currentUser._id.toString());

      // Verify ordering (newest first)
      expect(feed.posts).toHaveLength(3);
      expect(feed.posts[0]._id.toString()).toBe(post2._id.toString()); // Jan 20
      expect(feed.posts[1]._id.toString()).toBe(post3._id.toString()); // Jan 15
      expect(feed.posts[2]._id.toString()).toBe(post1._id.toString()); // Jan 10

      // Cleanup
      await User.deleteMany({ _id: { $in: [currentUser._id, author._id] } });
      await BlogPost.deleteMany({ _id: { $in: [post1._id, post2._id, post3._id] } });
      await Follow.deleteMany({ follower: currentUser._id });
    });
  });

  /**
   * **Feature: following-feed, Property 3: Feed posts contain all required metadata fields**
   * **Validates: Requirements 1.4**
   */
  describe('Property 3: Post metadata completeness', () => {
    test('should include all required metadata fields in feed posts', async () => {
      if (mongoose.connection.readyState !== 1) return;

      // Create users
      const currentUser = await createUser({ email: 'current3@test.com' });
      const author = await createUser({ email: 'author3@test.com' });

      // Create follow relationship
      await Follow.create({
        follower: currentUser._id,
        following: author._id
      });

      // Create post with all fields
      const post = await createPost(author._id, {
        featuredImage: 'https://example.com/image.jpg',
        likesCount: 10,
        commentsCount: 5,
        views: 100
      });

      // Get feed
      const feed = await feedService.getFollowingFeed(currentUser._id.toString());

      // Verify all required fields are present
      expect(feed.posts).toHaveLength(1);
      const feedPost = feed.posts[0];
      
      expect(feedPost.title).toBeDefined();
      expect(feedPost.excerpt).toBeDefined();
      expect(feedPost.author).toBeDefined();
      expect(feedPost.author.firstName).toBeDefined();
      expect(feedPost.author.lastName).toBeDefined();
      expect(feedPost.featuredImage).toBeDefined();
      expect(feedPost.publishedAt).toBeDefined();
      expect(typeof feedPost.likesCount).toBe('number');
      expect(typeof feedPost.commentsCount).toBe('number');
      expect(typeof feedPost.views).toBe('number');

      // Cleanup
      await User.deleteMany({ _id: { $in: [currentUser._id, author._id] } });
      await BlogPost.deleteMany({ _id: post._id });
      await Follow.deleteMany({ follower: currentUser._id });
    });
  });
});

  /**
   * **Feature: following-feed, Property 5: Pagination returns correct metadata**
   * **Validates: Requirements 2.2**
   */
  describe('Property 5: Pagination metadata', () => {
    test('should return correct pagination metadata', async () => {
      if (mongoose.connection.readyState !== 1) return;

      // Create users
      const currentUser = await createUser({ email: 'current4@test.com' });
      const author = await createUser({ email: 'author4@test.com' });

      // Create follow relationship
      await Follow.create({
        follower: currentUser._id,
        following: author._id
      });

      // Create 15 posts
      const posts = [];
      for (let i = 0; i < 15; i++) {
        const post = await createPost(author._id, {
          title: `Post ${i}`,
          publishedAt: new Date(Date.now() - i * 1000000)
        });
        posts.push(post);
      }

      // Test page 1 with limit 10
      const feed1 = await feedService.getFollowingFeed(currentUser._id.toString(), {
        page: 1,
        limit: 10
      });

      expect(feed1.pagination.currentPage).toBe(1);
      expect(feed1.pagination.totalPages).toBe(2);
      expect(feed1.pagination.totalPosts).toBe(15);
      expect(feed1.pagination.hasMore).toBe(true);
      expect(feed1.pagination.limit).toBe(10);
      expect(feed1.posts).toHaveLength(10);

      // Test page 2 with limit 10
      const feed2 = await feedService.getFollowingFeed(currentUser._id.toString(), {
        page: 2,
        limit: 10
      });

      expect(feed2.pagination.currentPage).toBe(2);
      expect(feed2.pagination.totalPages).toBe(2);
      expect(feed2.pagination.totalPosts).toBe(15);
      expect(feed2.pagination.hasMore).toBe(false);
      expect(feed2.posts).toHaveLength(5);

      // Cleanup
      await User.deleteMany({ _id: { $in: [currentUser._id, author._id] } });
      await BlogPost.deleteMany({ _id: { $in: posts.map(p => p._id) } });
      await Follow.deleteMany({ follower: currentUser._id });
    });

    test('should handle empty feed pagination correctly', async () => {
      if (mongoose.connection.readyState !== 1) return;

      // Create user with no follows
      const currentUser = await createUser({ email: 'current5@test.com' });

      // Get feed
      const feed = await feedService.getFollowingFeed(currentUser._id.toString());

      expect(feed.pagination.currentPage).toBe(1);
      expect(feed.pagination.totalPages).toBe(0);
      expect(feed.pagination.totalPosts).toBe(0);
      expect(feed.pagination.hasMore).toBe(false);
      expect(feed.posts).toHaveLength(0);
      expect(feed.followingCount).toBe(0);

      // Cleanup
      await User.deleteMany({ _id: currentUser._id });
    });
  });

  /**
   * **Feature: following-feed, Property 9: Category filter returns only matching posts**
   * **Validates: Requirements 4.1**
   */
  describe('Property 9: Category filtering', () => {
    test('should only return posts matching the category filter', async () => {
      if (mongoose.connection.readyState !== 1) return;

      // Create users
      const currentUser = await createUser({ email: 'current6@test.com' });
      const author = await createUser({ email: 'author6@test.com' });

      // Create follow relationship
      await Follow.create({
        follower: currentUser._id,
        following: author._id
      });

      // Create posts with different categories
      const techPost = await createPost(author._id, { 
        category: 'technology',
        title: 'Tech Post'
      });
      const academicPost = await createPost(author._id, { 
        category: 'academic',
        title: 'Academic Post'
      });
      const careerPost = await createPost(author._id, { 
        category: 'career',
        title: 'Career Post'
      });

      // Get feed with technology filter
      const feed = await feedService.getFollowingFeed(currentUser._id.toString(), {
        category: 'technology'
      });

      // Verify only technology posts are returned
      expect(feed.posts).toHaveLength(1);
      expect(feed.posts[0].category).toBe('technology');
      expect(feed.posts[0]._id.toString()).toBe(techPost._id.toString());

      // Cleanup
      await User.deleteMany({ _id: { $in: [currentUser._id, author._id] } });
      await BlogPost.deleteMany({ _id: { $in: [techPost._id, academicPost._id, careerPost._id] } });
      await Follow.deleteMany({ follower: currentUser._id });
    });
  });

  /**
   * **Feature: following-feed, Property 12: Sort order correctly orders posts**
   * **Validates: Requirements 4.4**
   */
  describe('Property 12: Sort ordering', () => {
    test('should sort by most liked correctly', async () => {
      if (mongoose.connection.readyState !== 1) return;

      // Create users
      const currentUser = await createUser({ email: 'current7@test.com' });
      const author = await createUser({ email: 'author7@test.com' });

      // Create follow relationship
      await Follow.create({
        follower: currentUser._id,
        following: author._id
      });

      // Create posts with different like counts
      const post1 = await createPost(author._id, { 
        likesCount: 5,
        title: 'Post 1'
      });
      const post2 = await createPost(author._id, { 
        likesCount: 20,
        title: 'Post 2'
      });
      const post3 = await createPost(author._id, { 
        likesCount: 10,
        title: 'Post 3'
      });

      // Get feed sorted by most liked
      const feed = await feedService.getFollowingFeed(currentUser._id.toString(), {
        sortBy: 'mostLiked'
      });

      // Verify ordering by likes descending
      expect(feed.posts).toHaveLength(3);
      expect(feed.posts[0]._id.toString()).toBe(post2._id.toString()); // 20 likes
      expect(feed.posts[1]._id.toString()).toBe(post3._id.toString()); // 10 likes
      expect(feed.posts[2]._id.toString()).toBe(post1._id.toString()); // 5 likes

      // Cleanup
      await User.deleteMany({ _id: { $in: [currentUser._id, author._id] } });
      await BlogPost.deleteMany({ _id: { $in: [post1._id, post2._id, post3._id] } });
      await Follow.deleteMany({ follower: currentUser._id });
    });

    test('should sort by most viewed correctly', async () => {
      if (mongoose.connection.readyState !== 1) return;

      // Create users
      const currentUser = await createUser({ email: 'current8@test.com' });
      const author = await createUser({ email: 'author8@test.com' });

      // Create follow relationship
      await Follow.create({
        follower: currentUser._id,
        following: author._id
      });

      // Create posts with different view counts
      const post1 = await createPost(author._id, { 
        views: 100,
        title: 'Post 1'
      });
      const post2 = await createPost(author._id, { 
        views: 500,
        title: 'Post 2'
      });
      const post3 = await createPost(author._id, { 
        views: 250,
        title: 'Post 3'
      });

      // Get feed sorted by most viewed
      const feed = await feedService.getFollowingFeed(currentUser._id.toString(), {
        sortBy: 'mostViewed'
      });

      // Verify ordering by views descending
      expect(feed.posts).toHaveLength(3);
      expect(feed.posts[0]._id.toString()).toBe(post2._id.toString()); // 500 views
      expect(feed.posts[1]._id.toString()).toBe(post3._id.toString()); // 250 views
      expect(feed.posts[2]._id.toString()).toBe(post1._id.toString()); // 100 views

      // Cleanup
      await User.deleteMany({ _id: { $in: [currentUser._id, author._id] } });
      await BlogPost.deleteMany({ _id: { $in: [post1._id, post2._id, post3._id] } });
      await Follow.deleteMany({ follower: currentUser._id });
    });
  });

  /**
   * **Feature: following-feed, Property 4: Unfollowing excludes author's posts from feed**
   * **Validates: Requirements 1.5**
   */
  describe('Property 4: Unfollow exclusion', () => {
    test('should exclude posts after unfollowing an author', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const currentUser = await createUser({ email: 'current9@test.com' });
      const author = await createUser({ email: 'author9@test.com' });

      // Create follow and post
      const follow = await Follow.create({
        follower: currentUser._id,
        following: author._id
      });
      const post = await createPost(author._id);

      // Verify post appears in feed
      let feed = await feedService.getFollowingFeed(currentUser._id.toString());
      expect(feed.posts).toHaveLength(1);

      // Unfollow
      await Follow.deleteOne({ _id: follow._id });

      // Verify post no longer appears
      feed = await feedService.getFollowingFeed(currentUser._id.toString());
      expect(feed.posts).toHaveLength(0);

      // Cleanup
      await User.deleteMany({ _id: { $in: [currentUser._id, author._id] } });
      await BlogPost.deleteMany({ _id: post._id });
    });
  });

  /**
   * **Feature: following-feed, Property 14: Followed authors list contains required fields**
   * **Validates: Requirements 5.2**
   */
  describe('Property 14: Followed authors metadata', () => {
    test('should include all required fields for followed authors', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const currentUser = await createUser({ email: 'current10@test.com' });
      const author = await createUser({ email: 'author10@test.com' });

      await Follow.create({
        follower: currentUser._id,
        following: author._id
      });

      const authors = await feedService.getFollowedAuthors(currentUser._id.toString());

      expect(authors).toHaveLength(1);
      expect(authors[0].firstName).toBeDefined();
      expect(authors[0].lastName).toBeDefined();
      expect(authors[0].profile).toBeDefined();
      expect(typeof authors[0].followerCount).toBe('number');

      // Cleanup
      await User.deleteMany({ _id: { $in: [currentUser._id, author._id] } });
      await Follow.deleteMany({ follower: currentUser._id });
    });
  });

  /**
   * **Feature: following-feed, Property 8: Feed reflects current user's like state**
   * **Validates: Requirements 3.5**
   */
  describe('Property 8: User like state', () => {
    test('should correctly show isLikedByCurrentUser field', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const currentUser = await createUser({ email: 'current11@test.com' });
      const author = await createUser({ email: 'author11@test.com' });

      await Follow.create({
        follower: currentUser._id,
        following: author._id
      });

      // Create post with current user's like
      const post = await createPost(author._id, {
        likes: [currentUser._id],
        likesCount: 1
      });

      const feed = await feedService.getFollowingFeed(currentUser._id.toString());

      expect(feed.posts).toHaveLength(1);
      expect(feed.posts[0].isLikedByCurrentUser).toBe(true);

      // Cleanup
      await User.deleteMany({ _id: { $in: [currentUser._id, author._id] } });
      await BlogPost.deleteMany({ _id: post._id });
      await Follow.deleteMany({ follower: currentUser._id });
    });
  });
