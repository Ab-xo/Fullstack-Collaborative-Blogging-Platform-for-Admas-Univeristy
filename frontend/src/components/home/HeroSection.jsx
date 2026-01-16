/**
 * ============================================================================
 * HERO SECTION - INDUSTRY-LEVEL GSAP ANIMATIONS
 * ============================================================================
 *
 * Advanced features:
 *   - GSAP ScrollTrigger for scroll-based animations
 *   - Dark/Light mode consistent theming
 *   - Staggered text reveal animations
 *   - Parallax effects on scroll
 *   - Interactive particle network
 *   - Smooth entrance animations
 *
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  PenTool,
  BookOpen,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Zap,
  BarChart3,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { postsAPI } from "../../api/posts";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/* ============================================================================
   ANIMATED CANVAS NETWORK - Interactive Particle System
   ============================================================================ */
const ParticleNetwork = ({ isDark }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width, height;

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initParticles();
    };

    const initParticles = () => {
      const count = Math.min(Math.floor((width * height) / 20000), 40);
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const particles = particlesRef.current;
      const time = Date.now() * 0.001;

      // Colors based on theme - Blue for Admas University branding
      const dotColor = isDark
        ? "rgba(59, 130, 246, 0.6)"
        : "rgba(59, 130, 246, 0.4)";
      const lineColor = isDark
        ? "rgba(59, 130, 246, 0.15)"
        : "rgba(59, 130, 246, 0.1)";
      const mouseLineColor = isDark
        ? "rgba(6, 182, 212, 0.3)"
        : "rgba(6, 182, 212, 0.2)";

      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse attraction
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          p.vx += (dx / dist) * 0.01;
          p.vy += (dy / dist) * 0.01;
        }

        // Limit speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 0.8) {
          p.vx = (p.vx / speed) * 0.8;
          p.vy = (p.vy / speed) * 0.8;
        }

        // Pulsing size
        const pulse = Math.sin(time * 2 + p.pulse) * 0.3 + 1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1 - dist / 120;
            ctx.stroke();
          }
        }

        // Mouse connections
        const mdx = mouseRef.current.x - particles[i].x;
        const mdy = mouseRef.current.y - particles[i].y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          ctx.strokeStyle = mouseLineColor;
          ctx.lineWidth = 1 - mdist / 150;
          ctx.stroke();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isDark]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

/* ============================================================================
   PLATFORM STATISTICS
   ============================================================================ */
const PLATFORM_STATS = [
  { value: "500+", label: "Writers", icon: Users },
  { value: "1.2k+", label: "Posts", icon: BookOpen },
  { value: "50+", label: "Categories", icon: BarChart3 },
  { value: "98%", label: "Satisfaction", icon: TrendingUp },
];

/* ============================================================================
   MAIN HERO SECTION WITH GSAP
   ============================================================================ */
const HeroSection = () => {
  const { isAuthenticated, user } = useAuth();
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // Refs for GSAP animations
  const sectionRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const descRef = useRef(null);
  const buttonsRef = useRef(null);
  const statsRef = useRef(null);
  const cardRef = useRef(null);
  const cardGlowRef = useRef(null);

  const handleCardMouseMove = (e) => {
    if (!cardRef.current || !cardGlowRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardGlowRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(59, 130, 246, 0.15), transparent 40%)`;
  };

  // Check dark mode
  useEffect(() => {
    const checkDark = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  /* --------------------------------------------------------------------------
     GSAP ANIMATIONS - Industry Level
     -------------------------------------------------------------------------- */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(
        [
          badgeRef.current,
          titleRef.current,
          subtitleRef.current,
          descRef.current,
          buttonsRef.current,
        ],
        {
          opacity: 0,
          y: 60,
        }
      );
      gsap.set(statsRef.current?.children || [], {
        opacity: 0,
        y: 40,
        scale: 0.9,
      });
      gsap.set(cardRef.current, { opacity: 0, x: 100, rotateY: -15 });

      // Master timeline
      const tl = gsap.timeline({
        defaults: { ease: "power4.out", duration: 1 },
        delay: 0.2,
      });

      // Badge entrance with bounce
      tl.to(badgeRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
      });

      // Title with split text effect
      tl.to(
        titleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 1,
        },
        "-=0.5"
      );

      // Subtitle with gradient reveal
      tl.to(
        subtitleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 1,
        },
        "-=0.7"
      );

      // Description
      tl.to(
        descRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
        },
        "-=0.6"
      );

      // Buttons with stagger
      tl.to(
        buttonsRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
        },
        "-=0.5"
      );

      // Stats with stagger
      tl.to(
        statsRef.current?.children || [],
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.1,
          duration: 0.6,
          ease: "back.out(1.4)",
        },
        "-=0.4"
      );

      // Card with 3D entrance
      tl.to(
        cardRef.current,
        {
          opacity: 1,
          x: 0,
          rotateY: 0,
          duration: 1.2,
          ease: "power3.out",
        },
        "-=1"
      );

      // Scroll-triggered parallax
      gsap.to(".hero-bg-element", {
        y: 100,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* --------------------------------------------------------------------------
     FETCH FEATURED POSTS
     -------------------------------------------------------------------------- */
  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setIsLoading(true);
        const response = await postsAPI.getPosts({ limit: 5, sort: "views" });
        const data = response.data || response;
        const posts = data.posts || data || [];
        setFeaturedPosts(Array.isArray(posts) ? posts : []);
      } catch (error) {
        console.error("Error fetching featured posts:", error);
        setFeaturedPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeaturedPosts();
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (featuredPosts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredPosts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredPosts.length]);

  const currentPost = useMemo(
    () => featuredPosts[currentIndex],
    [featuredPosts, currentIndex]
  );
  const goToPrevious = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? featuredPosts.length - 1 : prev - 1
    );
  const goToNext = () =>
    setCurrentIndex((prev) => (prev + 1) % featuredPosts.length);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-300"
    >
      {/* Background Image - Admas University */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-white/85 dark:bg-gray-900/90 backdrop-blur-[2px]" />
      </div>

      {/* Animated Particle Network */}
      <div className="absolute inset-0 opacity-60">
        <ParticleNetwork isDark={isDark} />
      </div>

      {/* Background Gradient Orbs - Blue for Admas University */}
      <div className="hero-bg-element absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="hero-bg-element absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-blue-500/10 to-blue-400/10 dark:from-blue-500/15 dark:to-blue-400/15 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="hero-bg-element absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-cyan-500/5 to-blue-500/5 dark:from-cyan-500/10 dark:to-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      {/* Animated Floating Objects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Circles */}
        <div
          className="absolute top-[15%] left-[10%] w-4 h-4 rounded-full bg-blue-400/30 dark:bg-blue-400/40"
          style={{
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-[25%] right-[15%] w-6 h-6 rounded-full bg-cyan-400/25 dark:bg-cyan-400/35"
          style={{
            animation: "float 8s ease-in-out infinite 1s",
          }}
        />
        <div
          className="absolute bottom-[30%] left-[5%] w-3 h-3 rounded-full bg-blue-400/30 dark:bg-blue-400/40"
          style={{
            animation: "float 7s ease-in-out infinite 0.5s",
          }}
        />
        <div
          className="absolute top-[60%] right-[8%] w-5 h-5 rounded-full bg-blue-300/25 dark:bg-blue-300/35"
          style={{
            animation: "float 9s ease-in-out infinite 2s",
          }}
        />

        {/* Floating Squares */}
        <div
          className="absolute top-[20%] right-[25%] w-4 h-4 rounded-md bg-gradient-to-br from-blue-400/20 to-cyan-400/20 dark:from-blue-400/30 dark:to-cyan-400/30 rotate-45"
          style={{
            animation: "floatRotate 10s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-[25%] right-[20%] w-6 h-6 rounded-md bg-gradient-to-br from-blue-400/15 to-blue-300/15 dark:from-blue-400/25 dark:to-blue-300/25 rotate-12"
          style={{
            animation: "floatRotate 12s ease-in-out infinite 1.5s",
          }}
        />
        <div
          className="absolute top-[45%] left-[8%] w-5 h-5 rounded-md bg-gradient-to-br from-cyan-400/20 to-blue-400/20 dark:from-cyan-400/30 dark:to-blue-400/30 -rotate-12"
          style={{
            animation: "floatRotate 8s ease-in-out infinite 0.8s",
          }}
        />

        {/* Floating Triangles (using borders) */}
        <div
          className="absolute top-[35%] right-[12%] w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-blue-400/25 dark:border-b-blue-400/35"
          style={{
            animation: "floatRotate 11s ease-in-out infinite 0.3s",
          }}
        />
        <div
          className="absolute bottom-[40%] left-[15%] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-cyan-400/20 dark:border-b-cyan-400/30"
          style={{
            animation: "floatRotate 9s ease-in-out infinite 1.2s",
          }}
        />

        {/* Floating Rings */}
        <div
          className="absolute top-[70%] left-[20%] w-8 h-8 rounded-full border-2 border-blue-400/20 dark:border-blue-400/30"
          style={{
            animation: "floatScale 7s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-[12%] right-[30%] w-6 h-6 rounded-full border-2 border-cyan-400/15 dark:border-cyan-400/25"
          style={{
            animation: "floatScale 9s ease-in-out infinite 1s",
          }}
        />
        <div
          className="absolute bottom-[15%] right-[35%] w-10 h-10 rounded-full border-2 border-blue-400/15 dark:border-blue-400/25"
          style={{
            animation: "floatScale 11s ease-in-out infinite 2s",
          }}
        />

        {/* Floating Plus Signs */}
        <div
          className="absolute top-[50%] right-[5%] text-blue-400/25 dark:text-blue-400/35 text-2xl font-light"
          style={{
            animation: "floatRotate 8s ease-in-out infinite 0.5s",
          }}
        >
          +
        </div>
        <div
          className="absolute bottom-[35%] left-[25%] text-cyan-400/20 dark:text-cyan-400/30 text-xl font-light"
          style={{
            animation: "floatRotate 10s ease-in-out infinite 1.8s",
          }}
        >
          +
        </div>

        {/* Floating Dots Pattern */}
        <div
          className="absolute top-[80%] left-[40%] flex gap-1"
          style={{
            animation: "float 6s ease-in-out infinite 0.7s",
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400/30 dark:bg-blue-400/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/30 dark:bg-cyan-400/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400/30 dark:bg-blue-400/40" />
        </div>
        <div
          className="absolute top-[8%] left-[45%] flex gap-1"
          style={{
            animation: "float 8s ease-in-out infinite 1.3s",
          }}
        >
          <div className="w-1 h-1 rounded-full bg-blue-300/25 dark:bg-blue-300/35" />
          <div className="w-1 h-1 rounded-full bg-blue-400/25 dark:bg-blue-400/35" />
        </div>

        {/* Floating Lines */}
        <div
          className="absolute top-[55%] left-[3%] w-8 h-0.5 bg-gradient-to-r from-blue-400/20 to-transparent dark:from-blue-400/30 rotate-45"
          style={{
            animation: "floatRotate 7s ease-in-out infinite 0.9s",
          }}
        />
        <div
          className="absolute bottom-[20%] right-[10%] w-10 h-0.5 bg-gradient-to-r from-cyan-400/15 to-transparent dark:from-cyan-400/25 -rotate-12"
          style={{
            animation: "floatRotate 9s ease-in-out infinite 1.6s",
          }}
        />
      </div>

      {/* CSS Keyframes for Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes floatRotate {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(5deg);
          }
          50% {
            transform: translateY(-20px) rotate(0deg);
          }
          75% {
            transform: translateY(-10px) rotate(-5deg);
          }
        }
        
        @keyframes floatScale {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-15px) scale(1.1);
            opacity: 0.5;
          }
        }
      `}</style>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Content */}
          <div>
            {/* Badge */}
            <div
              ref={badgeRef}
              className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/40 rounded-full px-4 py-2 mb-8 border border-blue-200 dark:border-blue-700"
            >
              <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Admas University Platform
              </span>
              <Sparkles className="h-3 w-3 text-cyan-500 animate-pulse" />
            </div>

            {/* Title */}
            <h1
              ref={titleRef}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-3"
            >
              Share{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400">
                Knowledge,
              </span>
            </h1>

            {/* Subtitle */}
            <h2
              ref={subtitleRef}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500">
                Build Community
              </span>
            </h2>

            {/* Description */}
            <p
              ref={descRef}
              className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg leading-relaxed"
            >
              Connect with fellow students, faculty, and alumni. Share your
              research, insights, and experiences in our collaborative platform.
            </p>

            {/* Buttons */}
            <div
              ref={buttonsRef}
              className="flex flex-col sm:flex-row gap-4 mb-10"
            >
              {/* Smart CTA based on user state */}
              {isAuthenticated ? (
                // For logged-in users
                user?.roles?.some((role) =>
                  ["author", "moderator", "admin"].includes(role)
                ) ? (
                  // For authors - encourage creating content
                  <Link
                    to="/posts/create"
                    className="group inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-7 py-4 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <PenTool className="h-5 w-5" />
                    <span>Create New Post</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  // For readers - encourage becoming authors
                  <Link
                    to="/contact"
                    className="group inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-7 py-4 rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>Become an Author</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )
              ) : (
                // For guests - encourage registration
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-7 py-4 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <PenTool className="h-5 w-5" />
                  <span>Start Writing</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <Link
                to="/blogs"
                className="inline-flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-7 py-4 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <BookOpen className="h-5 w-5" />
                <span>Explore Blogs</span>
              </Link>
            </div>

            {/* Stats */}
            <div ref={statsRef} className="grid grid-cols-4 gap-3">
              {PLATFORM_STATS.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Featured Post Card */}
          <div
            ref={cardRef}
            className="relative hidden lg:block"
            style={{ perspective: "1000px" }}
          >
            {/* Decorative Half-Round Background Shape */}
            <div className="absolute -top-8 -right-8 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-gradient-to-tr from-blue-500/15 to-blue-400/15 rounded-full blur-2xl" />

            {/* Main Card with Half-Round Design */}
            <div
              ref={cardRef}
              onMouseMove={handleCardMouseMove}
              className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-[2rem] rounded-tl-[4rem] p-6 shadow-2xl border border-gray-100 dark:border-gray-700 transform-gpu overflow-hidden group/card"
            >
              {/* Interactive Glow */}
              <div
                ref={cardGlowRef}
                className="absolute inset-0 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
              />
              {/* Decorative Corner Accent */}
              <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-br-[3rem]" />
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-blue-500/10 to-blue-400/10 rounded-tl-[2rem]" />

              {isLoading ? (
                <div className="animate-pulse space-y-4 relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                    </div>
                  </div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
              ) : featuredPosts.length > 0 && currentPost ? (
                <div className="carousel-content relative z-10">
                  <Link
                    to={`/posts/${currentPost._id}`}
                    className="block group"
                  >
                    {/* Author */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <PenTool className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                          {currentPost.category || "Featured"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          By {currentPost.author?.firstName || "Anonymous"}
                        </p>
                      </div>
                    </div>

                    {/* Title & Excerpt */}
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {currentPost.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {currentPost.excerpt ||
                        currentPost.content?.substring(0, 100) + "..."}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{currentPost.views || 0}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{currentPost.likesCount || 0}</span>
                      </span>
                    </div>
                  </Link>

                  {/* Navigation */}
                  {featuredPosts.length > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={goToPrevious}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <div className="flex items-center space-x-1.5">
                        {featuredPosts.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              index === currentIndex
                                ? "w-6 bg-gradient-to-r from-blue-500 to-cyan-500"
                                : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={goToNext}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 relative z-10">
                  <BookOpen className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No featured posts yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400 dark:text-gray-500 mb-2">
            Scroll
          </span>
          <div className="w-5 h-8 border-2 border-gray-300 dark:border-gray-600 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full mt-1.5 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
