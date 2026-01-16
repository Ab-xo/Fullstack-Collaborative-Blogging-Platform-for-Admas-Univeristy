/**
 * ============================================================================
 * HOME PAGE
 * ============================================================================
 *
 * The main landing page of the Admas University Blogging Platform.
 * This page is the first thing visitors see when they access the website.
 *
 * Page Sections:
 *   1. HeroSection - Welcome banner with call-to-action buttons
 *   2. FeaturedBlogs - Showcase of popular/trending blog posts
 *   3. TestimonialsSection - User reviews and feedback
 *
 * Note: Categories are now accessible via the navbar dropdown for better UX.
 *
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import HeroSection from "../components/home/HeroSection";
import FeaturedBlogs from "../components/home/FeaturedBlogs";
import TestimonialsSection from "../components/home/TestimonialsSection";
import NewsletterSection from "../components/home/NewsletterSection";

const Home = () => {
  return (
    <div>
      {/* Hero Section - Main welcome area with platform introduction */}
      <HeroSection />

      {/* Featured Blogs - Display trending and popular posts */}
      <FeaturedBlogs />

      {/* Testimonials - Build trust with user reviews */}
      <TestimonialsSection />

      {/* Newsletter - Email subscription section */}
      <NewsletterSection />
    </div>
  );
};

export default Home;
