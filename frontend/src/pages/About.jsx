/**
 * ============================================================================
 * ABOUT PAGE - ENHANCED VERSION WITH FREEPIK ILLUSTRATIONS
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  Award,
  Target,
  Heart,
  Globe,
  Shield,
  MessageSquare,
  Eye,
  FileText,
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle,
  GraduationCap,
  Loader2,
  PenTool,
  Trophy,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

// Illustration URLs from Freepik (same style as Introduction page)
const ILLUSTRATIONS = {
  hero: "https://img.freepik.com/free-vector/content-writer-concept-illustration_114360-6145.jpg",
  mission:
    "https://img.freepik.com/free-vector/teamwork-concept-illustration_114360-1407.jpg",
  aiWriting:
    "https://img.freepik.com/free-vector/hand-drawn-essay-illustration_23-2150268421.jpg",
  peerReview:
    "https://img.freepik.com/free-vector/code-review-concept-illustration_114360-3877.jpg",
  collaboration:
    "https://img.freepik.com/free-vector/remote-team-concept-illustration_114360-4498.jpg",
  community:
    "https://img.freepik.com/free-vector/people-talking-concept-illustration_114360-2958.jpg",
  cta: "https://img.freepik.com/free-vector/creative-writing-concept-illustration_114360-5765.jpg",
};

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const About = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [topAuthors, setTopAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, authorsRes] = await Promise.all([
          api.get("/public/stats"),
          api.get("/public/top-authors"),
        ]);
        if (statsRes.data?.success) setStats(statsRes.data.data.stats);
        if (authorsRes.data?.success) {
          // Filter out duplicates by display name to avoid showing same person twice
          const authors = authorsRes.data.data || [];
          const uniqueAuthors = authors.filter((author, index, self) => {
            const displayName = author.displayName || author.username || "";
            return (
              index ===
              self.findIndex(
                (a) => (a.displayName || a.username || "") === displayName
              )
            );
          });
          setTopAuthors(uniqueAuthors);
        }
      } catch (error) {
        console.error("Error fetching about page data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const values = [
    {
      icon: BookOpen,
      title: "Academic Excellence",
      description:
        "Fostering a culture of learning, research, and intellectual growth through collaborative knowledge sharing.",
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: Users,
      title: "Community Collaboration",
      description:
        "Building bridges between students, faculty, and alumni to create a vibrant academic community.",
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      icon: Shield,
      title: "Quality & Integrity",
      description:
        "Maintaining high standards through peer review and moderation to ensure reliable, trustworthy content.",
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      icon: Globe,
      title: "Global Perspective",
      description:
        "Embracing diverse viewpoints and international insights to enrich our academic discourse.",
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Writing Assistant",
      description:
        "Get intelligent suggestions, keyword recommendations, and content quality analysis as you write.",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      image: ILLUSTRATIONS.aiWriting,
    },
    {
      icon: Award,
      title: "Peer Review System",
      description:
        "Ensure quality and accuracy through our comprehensive peer review and moderation process.",
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      image: ILLUSTRATIONS.peerReview,
    },
    {
      icon: Zap,
      title: "Real-time Collaboration",
      description:
        "Work together on articles with live notifications and instant feedback from peers and mentors.",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      image: ILLUSTRATIONS.collaboration,
    },
    {
      icon: Heart,
      title: "Community Engagement",
      description:
        "Foster meaningful discussions through comments, likes, and collaborative project opportunities.",
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      image: ILLUSTRATIONS.community,
    },
  ];

  const getAvatarUrl = (author) => {
    if (author.profilePicture) return author.profilePicture;
    const name = author.displayName || author.username || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=6366f1&color=fff&size=200&bold=true`;
  };

  const getRankBadge = (index) => {
    if (index === 0) return { bg: "bg-yellow-500", text: "🥇" };
    if (index === 1) return { bg: "bg-gray-400", text: "🥈" };
    if (index === 2) return { bg: "bg-orange-400", text: "🥉" };
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/30 dark:bg-blue-800/20 rounded-full blur-3xl" />
        </div>

        <div className="container-max section-padding relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
                <GraduationCap className="w-4 h-4" />
                Admas University Blogging Platform
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Where Knowledge
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                  Meets Community
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Empowering our academic community through collaborative
                knowledge sharing, innovative research communication, and
                meaningful connections.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  Join Our Community <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/blogs"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all duration-300"
                >
                  Explore Content
                </Link>
              </div>
            </motion.div>

            {/* Hero Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex justify-center"
            >
              <div className="relative w-full max-w-[400px]">
                <div
                  className="absolute -inset-8 bg-gradient-to-br from-blue-500/25 via-blue-400/20 to-cyan-400/25 blur-3xl"
                  style={{ borderRadius: "20% 80% 70% 30% / 60% 30% 70% 40%" }}
                />
                <div
                  className="absolute -inset-4 border-4 border-dashed border-blue-300/40 dark:border-blue-500/30"
                  style={{ borderRadius: "30% 70% 60% 40% / 50% 40% 60% 50%" }}
                />
                <div
                  className="relative overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-700 dark:to-gray-800 p-3 shadow-2xl"
                  style={{ borderRadius: "25% 75% 65% 35% / 55% 35% 65% 45%" }}
                >
                  <img
                    src={ILLUSTRATIONS.hero}
                    alt="Blogging Platform"
                    className="w-full h-auto object-cover aspect-square"
                    style={{
                      borderRadius: "25% 75% 65% 35% / 55% 35% 65% 45%",
                    }}
                  />
                </div>
                <div className="absolute -top-6 -right-2 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl rotate-12 opacity-70 shadow-lg" />
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-60 shadow-lg" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Statistics Section */}
      <section className="py-16 bg-white dark:bg-gray-800/50">
        <div className="container-max section-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Growing Community
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Real-time statistics from our vibrant academic community
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {[
                {
                  icon: FileText,
                  value: stats?.totalPosts || 0,
                  label: "Published Articles",
                  color: "text-blue-600 dark:text-blue-400",
                  bg: "bg-blue-100 dark:bg-blue-900/30",
                },
                {
                  icon: Users,
                  value: stats?.totalUsers || 0,
                  label: "Community Members",
                  color: "text-purple-600 dark:text-purple-400",
                  bg: "bg-purple-100 dark:bg-purple-900/30",
                },
                {
                  icon: Eye,
                  value: stats?.totalViews || 0,
                  label: "Total Views",
                  color: "text-green-600 dark:text-green-400",
                  bg: "bg-green-100 dark:bg-green-900/30",
                },
                {
                  icon: MessageSquare,
                  value: stats?.totalComments || 0,
                  label: "Discussions",
                  color: "text-orange-600 dark:text-orange-400",
                  bg: "bg-orange-100 dark:bg-orange-900/30",
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="relative group"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                    <div
                      className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}
                    >
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Mission Section with Illustration */}
      <section className="py-20">
        <div className="container-max section-padding">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Mission Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="relative w-full max-w-[380px]">
                <div
                  className="absolute -inset-8 bg-gradient-to-br from-blue-500/25 via-purple-500/20 to-pink-500/25 blur-3xl"
                  style={{ borderRadius: "70% 30% 30% 70% / 60% 40% 60% 40%" }}
                />
                <div
                  className="absolute -inset-3 border-3 border-dashed border-purple-300/40"
                  style={{ borderRadius: "65% 35% 35% 65% / 55% 45% 55% 45%" }}
                />
                <div
                  className="relative overflow-hidden bg-white dark:bg-gray-800 shadow-2xl p-2"
                  style={{ borderRadius: "70% 30% 30% 70% / 60% 40% 60% 40%" }}
                >
                  <img
                    src={ILLUSTRATIONS.mission}
                    alt="Team Collaboration"
                    className="w-full h-auto object-cover aspect-square"
                    style={{
                      borderRadius: "70% 30% 30% 70% / 60% 40% 60% 40%",
                    }}
                  />
                </div>
                <div className="absolute -top-5 -left-5 w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl rotate-12 opacity-70 shadow-lg" />
                <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-60 shadow-lg" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
                <Target className="w-4 h-4" />
                Our Mission
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Empowering Academic Excellence Through Collaboration
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                To create a dynamic digital platform that facilitates knowledge
                exchange, fosters academic collaboration, and builds a stronger
                university community.
              </p>
              <ul className="space-y-3">
                {[
                  "Connect students, faculty, and alumni worldwide",
                  "Share research and academic insights",
                  "Foster meaningful academic discussions",
                  "Build a knowledge repository for future generations",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/30">
        <div className="container-max section-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div key={index} variants={fadeInUp} className="group">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div
                      className={`w-14 h-14 ${value.bgColor} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={`w-7 h-7 ${value.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Platform Features with Illustrations */}
      <section className="py-20">
        <div className="container-max section-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to share knowledge and grow together
            </p>
          </motion.div>

          <div className="space-y-20">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isEven = index % 2 === 0;
              const shapes = [
                {
                  container: "12% 88% 85% 15% / 15% 12% 88% 85%",
                  bg: "15% 85% 80% 20% / 20% 15% 85% 80%",
                },
                {
                  container: "70% 30% 30% 70% / 60% 40% 60% 40%",
                  bg: "65% 35% 35% 65% / 55% 45% 55% 45%",
                },
                {
                  container: "45% 55% 60% 40% / 40% 60% 40% 60%",
                  bg: "50% 50% 55% 45% / 45% 55% 45% 55%",
                },
                {
                  container: "25% 75% 65% 35% / 55% 35% 65% 45%",
                  bg: "30% 70% 60% 40% / 50% 40% 60% 50%",
                },
              ];
              const currentShape = shapes[index];
              const gradients = [
                "from-purple-500 via-violet-400 to-fuchsia-400",
                "from-yellow-500 via-amber-400 to-orange-400",
                "from-blue-500 via-cyan-400 to-teal-400",
                "from-red-500 via-rose-400 to-pink-400",
              ];

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="grid lg:grid-cols-2 gap-12 items-center"
                >
                  {/* Feature Illustration */}
                  <div
                    className={`flex justify-center ${
                      !isEven ? "lg:order-2" : ""
                    }`}
                  >
                    <div className="relative w-full max-w-[320px]">
                      <div
                        className={`absolute -inset-8 bg-gradient-to-br ${gradients[index]} blur-3xl opacity-30`}
                        style={{ borderRadius: currentShape.bg }}
                      />
                      <div
                        className={`absolute -inset-3 border-3 border-dashed opacity-30 ${
                          index === 0
                            ? "border-purple-400"
                            : index === 1
                            ? "border-yellow-400"
                            : index === 2
                            ? "border-blue-400"
                            : "border-red-400"
                        }`}
                        style={{ borderRadius: currentShape.container }}
                      />
                      <div
                        className="relative overflow-hidden bg-white dark:bg-gray-800 shadow-2xl p-2"
                        style={{ borderRadius: currentShape.container }}
                      >
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-auto object-cover aspect-square"
                          style={{ borderRadius: currentShape.container }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Feature Content */}
                  <div
                    className={`text-center lg:text-left ${
                      !isEven ? "lg:order-1" : ""
                    }`}
                  >
                    <div
                      className={`w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-5 mx-auto lg:mx-0`}
                    >
                      <Icon className={`w-7 h-7 ${feature.color}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top Contributors Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900">
        <div className="container-max section-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-700 dark:text-yellow-300 text-sm font-medium mb-4">
              <Trophy className="w-4 h-4" />
              Top Contributors
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Star Authors
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              The amazing writers shaping our community with their knowledge
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : topAuthors.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            >
              {topAuthors.slice(0, 3).map((author, index) => {
                const rankBadge = getRankBadge(index);
                return (
                  <motion.div
                    key={author._id}
                    variants={fadeInUp}
                    className="group"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 text-center shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-primary-500/10 to-blue-500/10 dark:from-primary-500/20 dark:to-blue-500/20" />
                      {rankBadge && (
                        <div className="absolute top-4 right-4 text-3xl drop-shadow-lg">
                          {rankBadge.text}
                        </div>
                      )}
                      <div className="relative inline-block mb-6 mt-4">
                        <div
                          className={`absolute inset-0 rounded-full ${
                            index === 0
                              ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                              : index === 1
                              ? "bg-gradient-to-r from-gray-300 to-gray-500"
                              : "bg-gradient-to-r from-orange-300 to-orange-500"
                          } blur-md opacity-60 scale-125`}
                        />
                        <img
                          src={getAvatarUrl(author)}
                          alt={author.displayName || author.username}
                          className="relative w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-white dark:ring-gray-700 shadow-xl"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              author.displayName || author.username || "User"
                            )}&background=6366f1&color=fff&size=200&bold=true`;
                          }}
                        />
                        {index === 0 && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl drop-shadow-lg">
                            👑
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                        {author.displayName || author.username}
                      </h3>
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-1">
                        {author.roleTitle || "Top Contributor"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        {author.postCount}{" "}
                        {author.postCount === 1 ? "article" : "articles"}{" "}
                        published
                      </p>
                      <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-900 dark:text-white">
                            <Eye className="w-3 h-3 text-blue-500" />
                            <span className="text-base font-bold">
                              {(author.totalViews || 0).toLocaleString()}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Views
                          </span>
                        </div>
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-900 dark:text-white">
                            <Heart className="w-3 h-3 text-red-500" />
                            <span className="text-base font-bold">
                              {(author.totalLikes || 0).toLocaleString()}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Likes
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <PenTool className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Be the first to contribute! Start writing today.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action with Illustration - Only show for non-authenticated users */}
      {!isAuthenticated && (
        <section className="py-20">
          <div className="container-max section-padding">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 rounded-3xl"
            >
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              </div>

              <div className="relative grid lg:grid-cols-2 gap-12 items-center p-8 lg:p-16">
                <div className="text-white">
                  <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                    Ready to Share Your Knowledge?
                  </h2>
                  <p className="text-xl text-white/80 mb-8 leading-relaxed">
                    Join thousands of students, faculty, and alumni who are
                    already part of our growing community.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg"
                    >
                      Get Started Free <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/blogs"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-xl font-semibold border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
                    >
                      Browse Articles
                    </Link>
                  </div>
                </div>

                {/* CTA Illustration */}
                <div className="hidden lg:flex justify-center">
                  <div className="relative w-full max-w-[300px]">
                    <div
                      className="absolute -inset-10 bg-white/15 blur-2xl"
                      style={{
                        borderRadius: "50% 50% 45% 55% / 60% 60% 40% 40%",
                      }}
                    />
                    <div
                      className="absolute -inset-4 border-3 border-dashed border-white/25"
                      style={{
                        borderRadius: "48% 52% 43% 57% / 58% 62% 38% 42%",
                      }}
                    />
                    <div
                      className="relative overflow-hidden bg-white/15 backdrop-blur-sm p-3 shadow-2xl"
                      style={{
                        borderRadius: "48% 52% 43% 57% / 58% 62% 38% 42%",
                      }}
                    >
                      <img
                        src={ILLUSTRATIONS.cta}
                        alt="Get Started"
                        className="w-full h-auto object-cover aspect-square"
                        style={{
                          borderRadius: "48% 52% 43% 57% / 58% 62% 38% 42%",
                        }}
                      />
                    </div>
                    <div className="absolute -top-5 -left-5 w-14 h-14 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-2xl rotate-12 opacity-80 shadow-lg" />
                    <div className="absolute -bottom-6 -right-4 w-16 h-16 bg-white/30 rounded-full shadow-lg" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};

export default About;
