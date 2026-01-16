/**
 * ============================================================================
 * UNIFIED AUTH PAGE - LOGIN & SIGNUP WITH SMOOTH ANIMATIONS
 * ============================================================================
 */

import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Zap,
  Globe,
  Users,
  BookOpen,
  GraduationCap,
  ArrowLeft,
  Sparkles,
  Rocket,
} from "lucide-react";
import { gsap } from "gsap";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

/* ============================================================================
   ANIMATED STATS COUNTER
   ============================================================================ */
const AnimatedStat = ({ value, label, icon: Icon, delay }) => {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value.replace(/[^0-9]/g, ""));

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const end = numericValue;
      const duration = 2000;
      const increment = end / (duration / 16);
      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(counter);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(counter);
    }, delay);
    return () => clearTimeout(timer);
  }, [numericValue, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      className="text-center"
    >
      <div className="w-10 h-10 mx-auto mb-1.5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-blue-500" />
      </div>
      <div className="text-xl font-bold text-gray-900 dark:text-white">
        {count}
        {value.includes("+") ? "+" : ""}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </motion.div>
  );
};

/* ============================================================================
   MAIN AUTH PAGE COMPONENT
   ============================================================================ */
const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(
    location.pathname === "/login" ? "login" : "signup"
  );
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const leftPanelRef = useRef(null);
  const formCardRef = useRef(null);
  const benefitsRef = useRef(null);

  useEffect(() => {
    if (location.pathname === "/login") {
      setActiveTab("login");
    } else if (location.pathname === "/register") {
      setActiveTab("signup");
    }
  }, [location.pathname]);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        leftPanelRef.current,
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );
      gsap.fromTo(
        formCardRef.current,
        { x: 150, opacity: 0, scale: 0.9 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "back.out(1.7)",
          delay: 0.3,
        }
      );
      if (benefitsRef.current) {
        gsap.fromTo(
          benefitsRef.current.children,
          { x: -50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            delay: 0.6,
          }
        );
      }
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(tab === "login" ? "/login" : "/register", { replace: true });
  };

  const benefits = [
    {
      icon: Shield,
      title: "Secure & Verified",
      description: "Protected with university-level security",
    },
    {
      icon: Zap,
      title: "Instant Publishing",
      description: "Share your thoughts with the community",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with academics worldwide",
    },
  ];

  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden relative"
    >
      {/* Animated Background Gradient */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(600px circle at ${
            mousePosition.x * 100
          }% ${
            mousePosition.y * 100
          }%, rgba(59, 130, 246, 0.2), transparent 40%)`,
        }}
      />

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-blue-500/10 dark:bg-white/10"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Animated Orbs */}
      <motion.div
        className="absolute top-20 right-20 w-72 h-72 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center px-6 sm:px-8 lg:px-12 py-6">
        <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-10 items-center">
          {/* Left Side - Information Panel */}
          <div
            ref={leftPanelRef}
            className="hidden lg:flex lg:w-5/12 flex-col justify-center relative z-10 opacity-0"
          >
            <div className="relative z-10 max-w-md">
              <div className="mb-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-white/10 backdrop-blur-sm border border-blue-200 dark:border-white/20 text-blue-700 dark:text-gray-300 text-sm">
                  <Rocket className="w-4 h-4" />
                  {activeTab === "login"
                    ? "Welcome back"
                    : "Start your journey today"}
                </span>
              </div>

              <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {activeTab === "login" ? "Welcome Back to " : "Start Your "}
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                  {activeTab === "login" ? "Admas Blog" : "Academic Journey"}
                </span>
              </h2>

              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                {activeTab === "login"
                  ? "Sign in to continue sharing knowledge and connecting with fellow academics."
                  : "Create your account and become part of a thriving community of scholars and innovators."}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-white/50 dark:bg-white/5 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-white/10">
                <AnimatedStat
                  value="500+"
                  label="Writers"
                  icon={Users}
                  delay={600}
                />
                <AnimatedStat
                  value="1200+"
                  label="Articles"
                  icon={BookOpen}
                  delay={800}
                />
                <AnimatedStat
                  value="50+"
                  label="Categories"
                  icon={GraduationCap}
                  delay={1000}
                />
              </div>

              {/* Benefits */}
              <div ref={benefitsRef} className="space-y-4">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ x: 10, scale: 1.02 }}
                      className="flex items-start space-x-4 p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all cursor-default shadow-sm"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-500/30 dark:to-cyan-500/30 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-white/10">
                        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {benefit.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {benefit.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full lg:w-7/12 flex items-center justify-center relative z-10">
            <div
              ref={formCardRef}
              className="w-full max-w-lg h-full flex flex-col opacity-0"
            >
              {/* Form Card */}
              <div className="relative flex-1 flex flex-col min-h-0">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-blue-500/30 dark:from-blue-500/50 dark:via-cyan-500/50 dark:to-blue-500/50 rounded-3xl blur-xl opacity-20" />

                <div className="relative bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-white/20 flex flex-col flex-1 min-h-0 overflow-hidden max-h-[80vh]">
                  {/* Tab Buttons */}
                  <div className="flex border-b border-gray-200 dark:border-white/10 flex-shrink-0">
                    <button
                      onClick={() => handleTabChange("login")}
                      className={`flex-1 py-4 px-6 text-center font-semibold transition-all relative ${
                        activeTab === "login"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      Login
                      {activeTab === "login" && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                    </button>
                    <button
                      onClick={() => handleTabChange("signup")}
                      className={`flex-1 py-4 px-6 text-center font-semibold transition-all relative ${
                        activeTab === "signup"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      Sign Up
                      {activeTab === "signup" && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                    </button>
                  </div>

                  {/* Form Header */}
                  <div className="text-center p-4 sm:p-5 pb-2 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {activeTab === "login"
                        ? "Welcome Back"
                        : "Create Your Account"}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activeTab === "login"
                        ? "Sign in to continue"
                        : "Join the community today"}
                    </p>
                  </div>

                  {/* Form Content - Scrollable */}
                  <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-5 custom-scrollbar">
                    <AnimatePresence mode="wait">
                      {activeTab === "login" ? (
                        <motion.div
                          key="login"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <LoginForm />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="signup"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <RegisterForm />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Back to Home */}
              <div className="mt-4 text-center flex-shrink-0">
                <Link
                  to="/"
                  className="inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
