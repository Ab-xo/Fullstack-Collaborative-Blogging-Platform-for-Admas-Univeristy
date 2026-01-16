/**
 * ============================================================================
 * INTRODUCTION PAGE - LANDING PAGE WITH GSAP ANIMATIONS
 * ============================================================================
 */

import { useState, useEffect, useRef, memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BookOpen,
  Users,
  TrendingUp,
  Award,
  ArrowRight,
  Eye,
  CheckCircle,
} from "lucide-react";
import LandingNavbar from "../components/layout/LandingNavbar";
import NewsletterSection from "../components/home/NewsletterSection";
import SmartCTA from "../components/common/SmartCTA";
import Footer from "../components/layout/Footer";
import apiClient from "../api/client";
import { SITE_BRANDING } from "../constants/branding";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Default stats for instant display
const DEFAULT_STATS = {
  totalUsers: 150,
  totalPosts: 320,
  totalCategories: 12,
  totalViews: 5000,
};

/* ============================================================================
   ANIMATED COUNTER COMPONENT - Memoized for performance
   ============================================================================ */
const AnimatedCounter = memo(({ end, duration = 1.5, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTime;
          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min(
              (timestamp - startTime) / (duration * 1000),
              1
            );
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
});

AnimatedCounter.displayName = "AnimatedCounter";

/* ============================================================================
   OPTIMIZED IMAGE COMPONENT - Lazy loading with placeholder
   ============================================================================ */
const OptimizedImage = memo(({ src, alt, className, style }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative">
      {!loaded && (
        <div
          className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse`}
          style={style}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${
          loaded ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
        style={style}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
});

OptimizedImage.displayName = "OptimizedImage";

/* ============================================================================
   MAIN INTRODUCTION COMPONENT
   ============================================================================ */
const Introduction = () => {
  // Use default stats immediately for faster initial render
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(false); // Start as false for instant display

  // Refs for GSAP animations
  const heroRef = useRef(null);
  const statsImageRef = useRef(null);
  const statsContentRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaImageRef = useRef(null);
  const ctaContentRef = useRef(null);

  // Fetch real stats in background (non-blocking)
  useEffect(() => {
    const controller = new AbortController();

    apiClient
      .get("/public/stats", { signal: controller.signal })
      .then((response) => {
        if (response.data?.data?.stats) {
          const apiStats = response.data.data.stats;
          setStats({
            totalUsers: apiStats.totalUsers || DEFAULT_STATS.totalUsers,
            totalPosts: apiStats.totalPosts || DEFAULT_STATS.totalPosts,
            totalCategories:
              apiStats.totalCategories || DEFAULT_STATS.totalCategories,
            totalViews: apiStats.totalViews || DEFAULT_STATS.totalViews,
          });
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.log("Using default stats");
        }
      });

    return () => controller.abort();
  }, []);

  // GSAP Animations
  useGSAP(() => {
    // Hero animation
    gsap.from(heroRef.current?.querySelectorAll(".hero-animate"), {
      y: 60,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out",
    });

    // Stats section - Image slides from left
    gsap.from(statsImageRef.current, {
      scrollTrigger: {
        trigger: statsImageRef.current,
        start: "top 80%",
        toggleActions: "play none none none",
      },
      x: -100,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    });

    // Stats section - Content slides from right
    gsap.from(statsContentRef.current, {
      scrollTrigger: {
        trigger: statsContentRef.current,
        start: "top 80%",
        toggleActions: "play none none none",
      },
      x: 100,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      delay: 0.2,
    });

    // Stats cards stagger animation
    gsap.from(".stat-card", {
      scrollTrigger: {
        trigger: ".stat-card",
        start: "top 85%",
        toggleActions: "play none none none",
      },
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: "back.out(1.7)",
    });

    // Features section animations
    const featureItems = featuresRef.current?.querySelectorAll(".feature-item");
    featureItems?.forEach((item, index) => {
      const isEven = index % 2 === 0;
      const image = item.querySelector(".feature-image");
      const content = item.querySelector(".feature-content");

      gsap.from(image, {
        scrollTrigger: {
          trigger: item,
          start: "top 75%",
          toggleActions: "play none none none",
        },
        x: isEven ? -80 : 80,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.from(content, {
        scrollTrigger: {
          trigger: item,
          start: "top 75%",
          toggleActions: "play none none none",
        },
        x: isEven ? 80 : -80,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power2.out",
      });

      // Animate feature points
      const points = content.querySelectorAll(".feature-point");
      gsap.from(points, {
        scrollTrigger: {
          trigger: item,
          start: "top 70%",
          toggleActions: "play none none none",
        },
        x: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.4,
        ease: "power2.out",
      });
    });

    // CTA section animations
    gsap.from(ctaContentRef.current, {
      scrollTrigger: {
        trigger: ctaContentRef.current,
        start: "top 80%",
        toggleActions: "play none none none",
      },
      x: -80,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
    });

    gsap.from(ctaImageRef.current, {
      scrollTrigger: {
        trigger: ctaImageRef.current,
        start: "top 80%",
        toggleActions: "play none none none",
      },
      x: 80,
      opacity: 0,
      scale: 0.9,
      duration: 0.8,
      delay: 0.2,
      ease: "back.out(1.4)",
    });
  }, []);

  // Memoize features to prevent re-renders
  const features = useMemo(
    () => [
      {
        title: "Share Your Knowledge",
        description:
          "Write and publish academic articles, research insights, and educational content to help fellow students and faculty members.",
        image:
          "https://img.freepik.com/free-vector/online-article-concept-illustration_114360-5193.jpg",
        points: ["Easy-to-use editor", "Rich text formatting", "Media uploads"],
      },
      {
        title: "Connect & Collaborate",
        description:
          "Join a vibrant community of students, professors, and alumni. Engage in meaningful discussions and build your network.",
        image:
          "https://img.freepik.com/free-vector/team-concept-illustration_114360-688.jpg",
        points: ["Follow authors", "Comment & discuss", "Share posts"],
      },
      {
        title: "Grow Your Career",
        description:
          "Build your professional portfolio, showcase your expertise, and get recognized for your contributions to the academic community.",
        image:
          "https://img.freepik.com/free-vector/business-growth-concept-illustration_114360-7989.jpg",
        points: ["Build portfolio", "Earn recognition", "Career growth"],
      },
    ],
    []
  );

  return (
    <>
      <LandingNavbar />
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* HERO SECTION */}
        <section className="relative min-h-[80vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80"
              alt="University students collaborating"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 via-blue-800/40 to-cyan-900/40" />
          </div>

          <div
            ref={heroRef}
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-0"
          >
            <h1 className="hero-animate text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Welcome to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300">
                {SITE_BRANDING.subTitle}
              </span>
            </h1>
            <h2 className="hero-animate text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white/80 mb-4 sm:mb-6">
              {SITE_BRANDING.mainTitle}
            </h2>
            <p className="hero-animate text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8 sm:mb-10 px-4">
              A dedicated space for students, faculty, and alumni to share
              knowledge and experiences.
            </p>
            <SmartCTA variant="hero" />
          </div>
        </section>

        {/* PLATFORM STATS - Side by Side Layout */}
        <section className="py-12 sm:py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* Left - Illustration with Hexagon/Diamond Shape */}
              <div
                ref={statsImageRef}
                className="flex justify-center order-2 lg:order-1"
              >
                <div className="relative w-full max-w-[280px] sm:max-w-[350px] md:max-w-[420px]">
                  {/* Decorative gradient background */}
                  <div
                    className="absolute -inset-4 sm:-inset-8 bg-gradient-to-br from-blue-500/25 via-indigo-500/20 to-purple-500/25 blur-2xl sm:blur-3xl"
                    style={{
                      borderRadius: "20% 80% 70% 30% / 60% 30% 70% 40%",
                    }}
                  />
                  {/* Rotating ring decoration */}
                  <div
                    className="absolute -inset-2 sm:-inset-4 border-2 sm:border-4 border-dashed border-blue-300/40 dark:border-blue-500/30"
                    style={{
                      borderRadius: "30% 70% 60% 40% / 50% 40% 60% 50%",
                    }}
                  />
                  <div
                    className="relative overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-800 p-2 sm:p-3 shadow-2xl"
                    style={{
                      borderRadius: "25% 75% 65% 35% / 55% 35% 65% 45%",
                    }}
                  >
                    <img
                      src="https://img.freepik.com/free-vector/data-report-illustration-concept_114360-883.jpg"
                      alt="Platform Statistics"
                      className="w-full h-auto object-cover aspect-square"
                      style={{
                        borderRadius: "25% 75% 65% 35% / 55% 35% 65% 45%",
                      }}
                    />
                  </div>
                  {/* Floating accent shapes - hidden on very small screens */}
                  <div className="hidden sm:block absolute -top-4 sm:-top-6 -right-1 sm:-right-2 w-10 sm:w-16 h-10 sm:h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl sm:rounded-2xl rotate-12 opacity-70 shadow-lg" />
                  <div className="hidden sm:block absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 w-8 sm:w-12 h-8 sm:h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-60 shadow-lg" />
                </div>
              </div>

              {/* Right - Stats Content */}
              <div
                ref={statsContentRef}
                className="order-1 lg:order-2 text-center lg:text-left"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-4">
                  <TrendingUp className="w-4 h-4" />
                  Our Impact
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                  Platform Statistics
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">
                  Join thousands of active members contributing to our growing
                  knowledge base.
                </p>

                <div className="grid grid-cols-2 gap-3 sm:gap-6">
                  {[
                    {
                      icon: Users,
                      value: stats.totalUsers,
                      label: "Active Writers",
                      color: "blue",
                    },
                    {
                      icon: BookOpen,
                      value: stats.totalPosts,
                      label: "Published Posts",
                      color: "purple",
                    },
                    {
                      icon: Award,
                      value: stats.totalCategories,
                      label: "Categories",
                      color: "indigo",
                    },
                    {
                      icon: Eye,
                      value: stats.totalViews,
                      label: "Total Views",
                      color: "green",
                    },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="stat-card bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700"
                    >
                      <stat.icon
                        className={`w-6 h-6 sm:w-8 sm:h-8 text-${stat.color}-500 mb-2 sm:mb-3`}
                      />
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        <AnimatedCounter end={stat.value} suffix="+" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES - Alternating Side by Side Layout */}
        <section className="py-12 sm:py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                Features
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Why Choose Our Platform?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
                Discover features that make our platform perfect for academic
                collaboration.
              </p>
            </div>

            <div ref={featuresRef} className="space-y-16 sm:space-y-24">
              {features.map((feature, index) => {
                // Different unique shapes for each feature
                const shapes = [
                  {
                    // Feature 1: Rounded square with asymmetric corners
                    container: "12% 88% 85% 15% / 15% 12% 88% 85%",
                    bg: "15% 85% 80% 20% / 20% 15% 85% 80%",
                  },
                  {
                    // Feature 2: Organic blob shape
                    container: "70% 30% 30% 70% / 60% 40% 60% 40%",
                    bg: "65% 35% 35% 65% / 55% 45% 55% 45%",
                  },
                  {
                    // Feature 3: Pebble/stone shape
                    container: "45% 55% 60% 40% / 40% 60% 40% 60%",
                    bg: "50% 50% 55% 45% / 45% 55% 45% 55%",
                  },
                ];

                const currentShape = shapes[index];

                return (
                  <div
                    key={index}
                    className={`feature-item grid lg:grid-cols-2 gap-8 sm:gap-12 items-center`}
                  >
                    {/* Image with Unique Organic Shape */}
                    <div
                      className={`feature-image flex justify-center ${
                        index % 2 === 1 ? "lg:order-2" : ""
                      }`}
                    >
                      <div className="relative w-full max-w-[260px] sm:max-w-[320px] md:max-w-[400px]">
                        {/* Decorative gradient blob background */}
                        <div
                          className={`absolute -inset-6 sm:-inset-10 blur-2xl sm:blur-3xl opacity-35 ${
                            index === 0
                              ? "bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-400"
                              : index === 1
                              ? "bg-gradient-to-br from-violet-500 via-purple-400 to-fuchsia-400"
                              : "bg-gradient-to-br from-emerald-500 via-green-400 to-lime-400"
                          }`}
                          style={{ borderRadius: currentShape.bg }}
                        />
                        {/* Decorative border ring */}
                        <div
                          className={`absolute -inset-2 sm:-inset-3 border-2 sm:border-[3px] border-dashed opacity-30 ${
                            index === 0
                              ? "border-blue-400"
                              : index === 1
                              ? "border-purple-400"
                              : "border-green-400"
                          }`}
                          style={{ borderRadius: currentShape.container }}
                        />
                        <div
                          className="relative overflow-hidden bg-white dark:bg-gray-800 shadow-2xl p-1.5 sm:p-2"
                          style={{ borderRadius: currentShape.container }}
                        >
                          <img
                            src={feature.image}
                            alt={feature.title}
                            className="w-full h-auto object-cover aspect-square"
                            style={{
                              borderRadius: currentShape.container,
                            }}
                          />
                        </div>
                        {/* Floating decorative elements - hidden on small screens */}
                        {index === 0 && (
                          <>
                            <div className="hidden sm:block absolute -top-3 sm:-top-5 -right-3 sm:-right-5 w-10 sm:w-14 h-10 sm:h-14 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg sm:rounded-xl rotate-45 opacity-70 shadow-lg" />
                            <div className="hidden sm:block absolute -bottom-2 sm:-bottom-3 -left-2 sm:-left-3 w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full opacity-60 shadow-lg" />
                            <div className="hidden md:block absolute top-1/3 -left-6 w-6 h-6 bg-blue-300 rounded-lg opacity-50" />
                          </>
                        )}
                        {index === 1 && (
                          <>
                            <div className="hidden sm:block absolute -top-3 sm:-top-4 left-1/4 w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-70 shadow-lg" />
                            <div className="hidden sm:block absolute -bottom-3 sm:-bottom-5 -right-2 sm:-right-3 w-12 sm:w-16 h-6 sm:h-8 bg-gradient-to-r from-fuchsia-400 to-violet-500 rounded-full opacity-60 shadow-lg" />
                            <div className="hidden md:block absolute bottom-1/4 -left-5 w-8 h-8 bg-pink-300 rounded-xl rotate-12 opacity-50" />
                          </>
                        )}
                        {index === 2 && (
                          <>
                            <div className="hidden sm:block absolute -top-2 sm:-top-3 -left-3 sm:-left-4 w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl sm:rounded-2xl -rotate-12 opacity-70 shadow-lg" />
                            <div className="hidden sm:block absolute -bottom-3 sm:-bottom-4 right-1/4 w-10 sm:w-14 h-5 sm:h-6 bg-gradient-to-r from-lime-400 to-green-500 rounded-full opacity-60 shadow-lg" />
                            <div className="hidden md:block absolute top-1/2 -right-5 w-7 h-7 bg-emerald-300 rounded-full opacity-50" />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div
                      className={`feature-content text-center lg:text-left ${
                        index % 2 === 1 ? "lg:order-1" : ""
                      }`}
                    >
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-base sm:text-lg">
                        {feature.description}
                      </p>
                      <ul className="space-y-2 sm:space-y-3 inline-block text-left">
                        {feature.points.map((point, i) => (
                          <li
                            key={i}
                            className="feature-point flex items-center gap-2 sm:gap-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base"
                          >
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-12 sm:py-20 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div
                ref={ctaContentRef}
                className="text-center lg:text-left order-2 lg:order-1"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
                  Start Your Journey Today
                </h2>
                <p className="text-white/80 text-base sm:text-lg mb-6 sm:mb-8">
                  Join our community of writers, readers, and learners. Share
                  your knowledge and grow together.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  Create Free Account
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </div>

              <div
                ref={ctaImageRef}
                className="flex justify-center order-1 lg:order-2"
              >
                <div className="relative w-full max-w-[240px] sm:max-w-[300px] md:max-w-[380px]">
                  {/* Decorative egg/oval shape background */}
                  <div
                    className="absolute -inset-6 sm:-inset-10 bg-white/15 blur-xl sm:blur-2xl"
                    style={{
                      borderRadius: "50% 50% 45% 55% / 60% 60% 40% 40%",
                    }}
                  />
                  {/* Decorative ring */}
                  <div
                    className="absolute -inset-2 sm:-inset-4 border-2 sm:border-[3px] border-dashed border-white/25"
                    style={{
                      borderRadius: "48% 52% 43% 57% / 58% 62% 38% 42%",
                    }}
                  />
                  <div
                    className="relative overflow-hidden bg-white/15 backdrop-blur-sm p-2 sm:p-3 shadow-2xl"
                    style={{
                      borderRadius: "48% 52% 43% 57% / 58% 62% 38% 42%",
                    }}
                  >
                    <img
                      src="https://img.freepik.com/free-vector/startup-life-concept-illustration_114360-1068.jpg"
                      alt="Get Started"
                      className="w-full h-auto object-cover aspect-square"
                      style={{
                        borderRadius: "48% 52% 43% 57% / 58% 62% 38% 42%",
                      }}
                    />
                  </div>
                  {/* Floating decorative elements - hidden on small screens */}
                  <div className="hidden sm:block absolute -top-3 sm:-top-5 -left-3 sm:-left-5 w-10 sm:w-14 h-10 sm:h-14 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-xl sm:rounded-2xl rotate-12 opacity-80 shadow-lg" />
                  <div className="hidden sm:block absolute -bottom-4 sm:-bottom-6 -right-2 sm:-right-4 w-12 sm:w-16 h-12 sm:h-16 bg-white/30 rounded-full shadow-lg" />
                  <div className="hidden md:block absolute top-1/3 -right-8 w-8 h-8 bg-gradient-to-br from-pink-300 to-rose-400 rounded-xl -rotate-12 opacity-75 shadow-lg" />
                  <div className="hidden md:block absolute bottom-1/4 -left-6 w-6 h-6 bg-cyan-300 rounded-full opacity-70" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <NewsletterSection />

        {/* FOOTER - Using shared Footer component */}
        <Footer />
      </div>
    </>
  );
};

export default Introduction;
