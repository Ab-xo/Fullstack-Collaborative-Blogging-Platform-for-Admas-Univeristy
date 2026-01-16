/**
 * ============================================================================
 * TESTIMONIALS SECTION - Enhanced Modern Design with Real Users
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
} from "lucide-react";
import apiClient from "../../api/client";

// Testimonial quotes based on role
const getTestimonialQuote = (member, index) => {
  const quotes = [
    {
      content:
        "This platform has revolutionized how we share knowledge within our university. The collaborative features make it easy for faculty and students to engage in meaningful academic discussions.",
      highlight: "Revolutionary Platform",
    },
    {
      content:
        "As a content creator, I love how easy it is to share my findings and get feedback from peers. The community here is incredibly supportive and engaging.",
      highlight: "Great for Sharing",
    },
    {
      content:
        "The moderation system gives us confidence in the quality of published content. It's become an essential tool for our knowledge sharing initiatives.",
      highlight: "Quality Assured",
    },
    {
      content:
        "The community here is incredibly supportive. I've received valuable feedback on my posts and connected with like-minded individuals who share my interests.",
      highlight: "Supportive Community",
    },
    {
      content:
        "Being part of this platform has helped me grow as a writer and connect with readers who appreciate quality content. The engagement is amazing!",
      highlight: "Amazing Engagement",
    },
    {
      content:
        "This is the perfect platform for sharing ideas and learning from others. The interface is intuitive and the community is welcoming.",
      highlight: "Perfect for Learning",
    },
  ];
  return quotes[index % quotes.length];
};

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [activeMembers, setActiveMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch active community members
  useEffect(() => {
    const fetchActiveMembers = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get("/public/active-members");
        if (
          response.data?.success &&
          response.data?.data &&
          response.data.data.length > 0
        ) {
          // Transform members into testimonials format
          const members = response.data.data.map((member, index) => {
            const quote = getTestimonialQuote(member, index);
            return {
              id: member._id || `member-${index}`,
              name: member.displayName,
              role: member.roleTitle,
              avatar: member.avatar,
              content: quote.content,
              rating: 5,
              highlight: quote.highlight,
              postCount: member.postCount,
              totalLikes: member.totalLikes,
            };
          });

          // Remove any duplicates by name
          const uniqueMembers = members.filter(
            (member, index, self) =>
              index ===
              self.findIndex(
                (m) => m.name.toLowerCase() === member.name.toLowerCase()
              )
          );

          // If we have fewer than 8 real members, fill with defaults (no duplicates)
          const defaults = getDefaultTestimonials();
          let finalMembers = uniqueMembers;

          if (uniqueMembers.length < 8) {
            const realNames = new Set(
              uniqueMembers.map((m) => m.name.toLowerCase())
            );
            const additionalDefaults = defaults.filter(
              (d) => !realNames.has(d.name.toLowerCase())
            );
            finalMembers = [...uniqueMembers, ...additionalDefaults].slice(
              0,
              8
            );
          }

          setActiveMembers(finalMembers);
        } else {
          setActiveMembers(getDefaultTestimonials());
        }
      } catch (error) {
        console.error("Error fetching active members:", error);
        setActiveMembers(getDefaultTestimonials());
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveMembers();
  }, []);

  // Default testimonials as fallback - 8 testimonials to fill the grid
  const getDefaultTestimonials = () => [
    {
      name: "Dr. Alemayehu Tadesse",
      role: "Computer Science Professor",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content:
        "This platform has revolutionized how we share knowledge within our university. The collaborative features make it easy for faculty and students to engage in meaningful academic discussions.",
      rating: 5,
      highlight: "Revolutionary Platform",
    },
    {
      name: "Tigist Bekele",
      role: "Business Management Student",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      content:
        "As a student, I love how easy it is to share my research findings and get feedback from professors. The community here is incredibly supportive and engaging.",
      rating: 5,
      highlight: "Great for Students",
    },
    {
      name: "Yohannes Girma",
      role: "Engineering Contributor",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content:
        "The moderation system gives us confidence in the quality of published content. It's become an essential tool for our knowledge sharing initiatives.",
      rating: 5,
      highlight: "Quality Assured",
    },
    {
      name: "Sara Mohammed",
      role: "Content Moderator",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content:
        "The community here is incredibly supportive. I've received valuable feedback on my posts and connected with like-minded individuals who share my interests.",
      rating: 5,
      highlight: "Supportive Community",
    },
    {
      name: "Dawit Haile",
      role: "Research Assistant",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      content:
        "Being part of this platform has helped me grow as a writer and connect with readers who appreciate quality content. The engagement is amazing!",
      rating: 5,
      highlight: "Amazing Engagement",
    },
    {
      name: "Meron Abebe",
      role: "Law Student",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      content:
        "This is the perfect platform for sharing ideas and learning from others. The interface is intuitive and the community is welcoming.",
      rating: 5,
      highlight: "Perfect for Learning",
    },
    {
      name: "Henok Tesfaye",
      role: "IT Department Head",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      content:
        "The platform's security and reliability have made it our go-to solution for academic collaboration. Highly recommended for any educational institution.",
      rating: 5,
      highlight: "Secure & Reliable",
    },
    {
      name: "Bethlehem Worku",
      role: "Medical Sciences Student",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      content:
        "I've published several research papers here and the feedback from the community has been invaluable. This platform truly supports academic growth.",
      rating: 5,
      highlight: "Academic Excellence",
    },
  ];

  const testimonials =
    activeMembers.length > 0 ? activeMembers : getDefaultTestimonials();

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    const words = name.trim().split(" ").filter(Boolean);
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Avatar component with fallback
  const MemberAvatar = ({ avatar, name, size = "md" }) => {
    const [imageError, setImageError] = useState(false);
    const sizeClasses = {
      sm: "w-10 h-10 text-sm",
      md: "w-16 h-16 text-lg",
    };

    if (avatar && !imageError) {
      return (
        <img
          src={avatar}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg`}
          onError={() => setImageError(true)}
        />
      );
    }

    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold border-4 border-white dark:border-gray-700 shadow-lg`}
      >
        {getInitials(name)}
      </div>
    );
  };

  if (isLoading) {
    return (
      <section className="relative py-16 sm:py-24 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 sm:py-24 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-3xl" />

        {/* Floating Shapes */}
        <motion.div
          className="absolute top-20 left-10 w-16 h-16 border-2 border-blue-300/30 dark:border-blue-500/30 rounded-2xl"
          animate={{ rotate: 360, y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-32 right-20 w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full"
          animate={{ scale: [1, 1.2, 1], y: [0, 15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-10 w-8 h-8 border-2 border-blue-300/30 dark:border-blue-500/30 rounded-full"
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Illustration - Abstract Shapes */}
        <div className="absolute -left-20 top-1/2 -translate-y-1/2 opacity-10 dark:opacity-5">
          <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
            <circle
              cx="150"
              cy="150"
              r="100"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-500"
            />
            <circle
              cx="150"
              cy="150"
              r="70"
              stroke="currentColor"
              strokeWidth="2"
              className="text-cyan-500"
            />
            <circle
              cx="150"
              cy="150"
              r="40"
              fill="currentColor"
              className="text-blue-500/20"
            />
          </svg>
        </div>
        <div className="absolute -right-20 bottom-1/4 opacity-10 dark:opacity-5">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <rect
              x="50"
              y="50"
              width="100"
              height="100"
              rx="20"
              stroke="currentColor"
              strokeWidth="2"
              className="text-cyan-500"
              transform="rotate(15 100 100)"
            />
            <rect
              x="70"
              y="70"
              width="60"
              height="60"
              rx="10"
              fill="currentColor"
              className="text-cyan-500/20"
              transform="rotate(15 100 100)"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            What Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500">
              Community
            </span>{" "}
            Says
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
            Hear from faculty, students, and researchers who are making the most
            of our platform
          </p>
        </motion.div>

        {/* Main Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Large Quote Icon */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 z-20">
            <Quote className="w-8 h-8 text-white" />
          </div>

          {/* Testimonial Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 sm:p-12 pt-12 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/5 to-cyan-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
              >
                {/* Highlight Badge */}
                <div className="flex justify-center mb-6">
                  <span className="px-4 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300">
                    {testimonials[currentIndex].highlight}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 text-center mb-8 leading-relaxed italic">
                  "{testimonials[currentIndex].content}"
                </p>

                {/* Author */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <MemberAvatar
                      avatar={testimonials[currentIndex].avatar}
                      name={testimonials[currentIndex].name}
                      size="md"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {testimonials[currentIndex].role}
                  </p>
                  {testimonials[currentIndex].postCount && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {testimonials[currentIndex].postCount} posts •{" "}
                      {testimonials[currentIndex].totalLikes} likes
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={goToPrevious}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentIndex(index);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "w-8 bg-gradient-to-r from-blue-500 to-cyan-500"
                        : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={goToNext}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mini Testimonial Cards - 2 rows of 4 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-12"
        >
          {testimonials.slice(0, 8).map((testimonial, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(index);
              }}
              className={`p-4 rounded-xl text-left transition-all duration-300 ${
                index === currentIndex
                  ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 scale-105"
                  : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <MemberAvatar
                  avatar={testimonial.avatar}
                  name={testimonial.name}
                  size="sm"
                />
                <div>
                  <p
                    className={`font-semibold text-sm ${
                      index === currentIndex
                        ? "text-white"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {testimonial.name}
                  </p>
                  <p
                    className={`text-xs ${
                      index === currentIndex
                        ? "text-white/80"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      index === currentIndex
                        ? "text-yellow-300 fill-yellow-300"
                        : "text-yellow-400 fill-yellow-400"
                    }`}
                  />
                ))}
              </div>
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
