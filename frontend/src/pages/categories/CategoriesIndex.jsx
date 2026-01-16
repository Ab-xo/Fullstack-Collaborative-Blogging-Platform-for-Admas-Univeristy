/**
 * ============================================================================
 * CATEGORIES INDEX PAGE - Enhanced Design
 * ============================================================================
 *
 * A beautifully designed page displaying all available categories with
 * unique icons, post counts, and links to individual category pages.
 *
 * Route: /categories
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  // Academic & Education
  GraduationCap,
  BookOpen,
  FileText,
  Lightbulb,
  Brain,
  Award,
  // Science & Technology
  Code,
  Microscope,
  FlaskConical,
  Atom,
  Rocket,
  Cog,
  Wrench,
  CircuitBoard,
  // Campus & Community
  Users,
  UserCircle,
  Building2,
  Heart,
  // Events & Activities
  CalendarDays,
  PartyPopper,
  Trophy,
  Medal,
  Target,
  // Arts & Culture
  Palette,
  Camera,
  Pen,
  Feather,
  Globe,
  Languages,
  // Career & Professional
  Briefcase,
  TrendingUp,
  Users2,
  // Communication
  Megaphone,
  Bell,
  MessageSquare,
  Newspaper,
  // Navigation & UI
  Search,
  ArrowRight,
  Flame,
  Sparkles,
  Star,
  LayoutGrid,
  List,
  X,
} from "lucide-react";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Enhanced categories with unique icons and styling
const ALL_CATEGORIES = [
  {
    slug: "academic",
    name: "Academic",
    description:
      "Academic articles, study guides, and educational resources for students and faculty.",
    icon: GraduationCap,
    secondaryIcon: Award,
    color: "from-blue-500 via-blue-600 to-indigo-600",
    lightColor: "from-blue-400 to-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    textColor: "text-blue-600 dark:text-blue-400",
    hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-950/20",
    group: "Academic",
  },
  {
    slug: "research",
    name: "Research",
    description:
      "Cutting-edge research findings, publications, and scholarly work.",
    icon: Microscope,
    secondaryIcon: Brain,
    color: "from-purple-500 via-purple-600 to-violet-600",
    lightColor: "from-purple-400 to-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    textColor: "text-purple-600 dark:text-purple-400",
    hoverBg: "hover:bg-purple-50 dark:hover:bg-purple-950/20",
    group: "Academic",
  },
  {
    slug: "thesis",
    name: "Thesis & Dissertations",
    description: "Outstanding thesis projects and dissertations from students.",
    icon: FileText,
    secondaryIcon: BookOpen,
    color: "from-indigo-500 via-indigo-600 to-blue-600",
    lightColor: "from-indigo-400 to-indigo-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    textColor: "text-indigo-600 dark:text-indigo-400",
    hoverBg: "hover:bg-indigo-50 dark:hover:bg-indigo-950/20",
    group: "Academic",
  },
  {
    slug: "tutorials",
    name: "Tutorials & Guides",
    description: "Step-by-step tutorials and comprehensive learning resources.",
    icon: Lightbulb,
    secondaryIcon: Sparkles,
    color: "from-amber-400 via-yellow-500 to-orange-500",
    lightColor: "from-amber-300 to-yellow-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    textColor: "text-amber-600 dark:text-amber-400",
    hoverBg: "hover:bg-amber-50 dark:hover:bg-amber-950/20",
    group: "Academic",
  },
  {
    slug: "campus-life",
    name: "Campus Life",
    description: "Vibrant stories from daily life at Admas University.",
    icon: Building2,
    secondaryIcon: Users,
    color: "from-orange-500 via-orange-600 to-red-500",
    lightColor: "from-orange-400 to-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    textColor: "text-orange-600 dark:text-orange-400",
    hoverBg: "hover:bg-orange-50 dark:hover:bg-orange-950/20",
    group: "Campus",
  },
  {
    slug: "programs",
    name: "Programs",
    description: "Explore diverse academic programs including Accounting, CS, MBA, and TVET levels.",
    icon: GraduationCap,
    secondaryIcon: BookOpen,
    color: "from-blue-600 via-indigo-600 to-violet-600",
    lightColor: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    textColor: "text-blue-600 dark:text-blue-400",
    hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-950/20",
    group: "Academic",
  },
  {
    slug: "events",
    name: "Events & Activities",
    description: "Exciting events, conferences, and campus activities.",
    icon: CalendarDays,
    secondaryIcon: PartyPopper,
    color: "from-red-500 via-rose-500 to-pink-500",
    lightColor: "from-red-400 to-rose-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    textColor: "text-red-600 dark:text-red-400",
    hoverBg: "hover:bg-red-50 dark:hover:bg-red-950/20",
    group: "Campus",
  },
  {
    slug: "clubs",
    name: "Clubs & Organizations",
    description: "Student organizations and extracurricular activities.",
    icon: Users,
    secondaryIcon: Heart,
    color: "from-pink-500 via-pink-600 to-rose-600",
    lightColor: "from-pink-400 to-pink-500",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
    textColor: "text-pink-600 dark:text-pink-400",
    hoverBg: "hover:bg-pink-50 dark:hover:bg-pink-950/20",
    group: "Campus",
  },
  {
    slug: "sports",
    name: "Sports & Athletics",
    description: "Athletic achievements, sports news, and fitness content.",
    icon: Trophy,
    secondaryIcon: Medal,
    color: "from-green-500 via-emerald-500 to-teal-500",
    lightColor: "from-green-400 to-emerald-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    textColor: "text-green-600 dark:text-green-400",
    hoverBg: "hover:bg-green-50 dark:hover:bg-green-950/20",
    group: "Campus",
  },
  {
    slug: "technology",
    name: "Technology",
    description: "Tech trends, coding tutorials, and digital innovation.",
    icon: Code,
    secondaryIcon: CircuitBoard,
    color: "from-cyan-500 via-blue-500 to-indigo-500",
    lightColor: "from-cyan-400 to-blue-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
    textColor: "text-cyan-600 dark:text-cyan-400",
    hoverBg: "hover:bg-cyan-50 dark:hover:bg-cyan-950/20",
    group: "Tech & Science",
  },
  {
    slug: "innovation",
    name: "Innovation & Startups",
    description: "Entrepreneurship, startups, and creative solutions.",
    icon: Rocket,
    secondaryIcon: Target,
    color: "from-amber-500 via-orange-500 to-red-500",
    lightColor: "from-amber-400 to-orange-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    textColor: "text-amber-600 dark:text-amber-400",
    hoverBg: "hover:bg-amber-50 dark:hover:bg-amber-950/20",
    group: "Tech & Science",
  },
  {
    slug: "engineering",
    name: "Engineering",
    description: "Engineering projects and technical articles.",
    icon: Cog,
    secondaryIcon: Wrench,
    color: "from-slate-500 via-gray-600 to-zinc-600",
    lightColor: "from-slate-400 to-gray-500",
    bgColor: "bg-slate-50 dark:bg-slate-950/30",
    textColor: "text-slate-600 dark:text-slate-400",
    hoverBg: "hover:bg-slate-50 dark:hover:bg-slate-950/20",
    group: "Tech & Science",
  },
  {
    slug: "science",
    name: "Science & Discovery",
    description: "Scientific discoveries and breakthrough findings.",
    icon: Atom,
    secondaryIcon: FlaskConical,
    color: "from-emerald-500 via-green-500 to-teal-500",
    lightColor: "from-emerald-400 to-green-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
    hoverBg: "hover:bg-emerald-50 dark:hover:bg-emerald-950/20",
    group: "Tech & Science",
  },
  {
    slug: "culture",
    name: "Culture & Heritage",
    description: "Cultural perspectives, traditions, and global insights.",
    icon: Globe,
    secondaryIcon: Languages,
    color: "from-teal-500 via-cyan-500 to-blue-500",
    lightColor: "from-teal-400 to-cyan-400",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
    textColor: "text-teal-600 dark:text-teal-400",
    hoverBg: "hover:bg-teal-50 dark:hover:bg-teal-950/20",
    group: "Arts & Culture",
  },
  {
    slug: "arts",
    name: "Arts & Creativity",
    description: "Visual arts, music, and creative expression.",
    icon: Palette,
    secondaryIcon: Camera,
    color: "from-rose-500 via-pink-500 to-fuchsia-500",
    lightColor: "from-rose-400 to-pink-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    textColor: "text-rose-600 dark:text-rose-400",
    hoverBg: "hover:bg-rose-50 dark:hover:bg-rose-950/20",
    group: "Arts & Culture",
  },
  {
    slug: "literature",
    name: "Literature & Writing",
    description: "Creative writing, poetry, and book reviews.",
    icon: Feather,
    secondaryIcon: Pen,
    color: "from-violet-500 via-purple-500 to-indigo-500",
    lightColor: "from-violet-400 to-purple-400",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    textColor: "text-violet-600 dark:text-violet-400",
    hoverBg: "hover:bg-violet-50 dark:hover:bg-violet-950/20",
    group: "Arts & Culture",
  },
  {
    slug: "career",
    name: "Career & Professional",
    description: "Career advice and professional development.",
    icon: Briefcase,
    secondaryIcon: TrendingUp,
    color: "from-sky-500 via-blue-500 to-indigo-500",
    lightColor: "from-sky-400 to-blue-400",
    bgColor: "bg-sky-50 dark:bg-sky-950/30",
    textColor: "text-sky-600 dark:text-sky-400",
    hoverBg: "hover:bg-sky-50 dark:hover:bg-sky-950/20",
    group: "Community",
  },
  {
    slug: "alumni",
    name: "Alumni Network",
    description: "Alumni stories and success journeys.",
    icon: UserCircle,
    secondaryIcon: Users2,
    color: "from-lime-500 via-green-500 to-emerald-500",
    lightColor: "from-lime-400 to-green-400",
    bgColor: "bg-lime-50 dark:bg-lime-950/30",
    textColor: "text-lime-600 dark:text-lime-400",
    hoverBg: "hover:bg-lime-50 dark:hover:bg-lime-950/20",
    group: "Community",
  },
  {
    slug: "opinion",
    name: "Opinion & Editorial",
    description: "Editorials and thought-provoking discussions.",
    icon: MessageSquare,
    secondaryIcon: Pen,
    color: "from-fuchsia-500 via-purple-500 to-violet-500",
    lightColor: "from-fuchsia-400 to-purple-400",
    bgColor: "bg-fuchsia-50 dark:bg-fuchsia-950/30",
    textColor: "text-fuchsia-600 dark:text-fuchsia-400",
    hoverBg: "hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/20",
    group: "Community",
  },
  {
    slug: "announcements",
    name: "Announcements",
    description: "Official university news and updates.",
    icon: Megaphone,
    secondaryIcon: Bell,
    color: "from-red-600 via-rose-600 to-pink-600",
    lightColor: "from-red-500 to-rose-500",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    textColor: "text-red-600 dark:text-red-400",
    hoverBg: "hover:bg-red-50 dark:hover:bg-red-950/20",
    group: "Community",
  },
  {
    slug: "news",
    name: "News & Updates",
    description: "Latest news, breaking stories, and updates.",
    icon: Newspaper,
    secondaryIcon: Flame,
    color: "from-red-500 via-orange-500 to-amber-500",
    lightColor: "from-red-400 to-orange-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    textColor: "text-red-600 dark:text-red-400",
    hoverBg: "hover:bg-red-50 dark:hover:bg-red-950/20",
    group: "Community",
  },
  {
    slug: "other",
    name: "Other",
    description: "Miscellaneous content and posts.",
    icon: Sparkles,
    secondaryIcon: Star,
    color: "from-gray-500 via-slate-500 to-zinc-500",
    lightColor: "from-gray-400 to-slate-400",
    bgColor: "bg-gray-50 dark:bg-gray-950/30",
    textColor: "text-gray-600 dark:text-gray-400",
    hoverBg: "hover:bg-gray-50 dark:hover:bg-gray-950/20",
    group: "Community",
  },
];

// Group definitions with icons
const CATEGORY_GROUPS = [
  { id: "all", name: "All Categories", icon: LayoutGrid },
  { id: "Academic", name: "Academic", icon: GraduationCap },
  { id: "Campus", name: "Campus Life", icon: Building2 },
  { id: "Tech & Science", name: "Tech & Science", icon: Code },
  { id: "Arts & Culture", name: "Arts & Culture", icon: Palette },
  { id: "Community", name: "Community", icon: Users },
];

const CategoriesIndex = () => {
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    fetchCategoryCounts();
  }, []);

  const fetchCategoryCounts = async () => {
    try {
      const response = await api.get("/posts/categories");
      const data =
        response.data?.data?.categories || response.data?.data || response.data;

      // Convert array to object for easy lookup
      const counts = {};
      if (Array.isArray(data)) {
        data.forEach((cat) => {
          counts[cat._id || cat.category] = cat.count || 0;
        });
      }
      setCategoryCounts(counts);
    } catch (err) {
      console.error("Error fetching category counts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter categories
  const filteredCategories = ALL_CATEGORIES.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === "all" || cat.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  // Get total posts
  const totalPosts = Object.values(categoryCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  // Get top categories
  const topCategories = [...ALL_CATEGORIES]
    .map((cat) => ({ ...cat, count: categoryCounts[cat.slug] || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center animate-pulse">
            <LayoutGrid className="w-10 h-10 text-white" />
          </div>
          <LoadingSpinner size="lg" text="Loading categories..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800" />

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl" />

          {/* Floating Category Icons */}
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-[20%] opacity-20"
          >
            <Code className="w-16 h-16 text-white" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute top-32 left-[15%] opacity-20"
          >
            <GraduationCap className="w-20 h-20 text-white" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute bottom-32 right-[25%] opacity-20"
          >
            <Palette className="w-14 h-14 text-white" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 12, 0], rotate: [0, -3, 0] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute bottom-20 left-[20%] opacity-20"
          >
            <Trophy className="w-18 h-18 text-white" />
          </motion.div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Discover Amazing Content
            </motion.div>

            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Explore Categories
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
              Discover content across {ALL_CATEGORIES.length} categories with{" "}
              <span className="font-semibold text-white">{totalPosts}+</span>{" "}
              articles from our community
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-12 py-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all text-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-gray-50 dark:fill-gray-900"
            />
          </svg>
        </div>
      </div>

      {/* Trending Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 lg:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Trending Categories
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Most popular categories this month
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {topCategories.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    to={`/category/${cat.slug}`}
                    className={`flex flex-col items-center p-4 rounded-2xl ${cat.bgColor} ${cat.hoverBg} border border-transparent hover:border-current transition-all group`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span
                      className={`font-semibold text-sm ${cat.textColor} text-center`}
                    >
                      {cat.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {cat.count} posts
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Group Filter & View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8"
        >
          {/* Group Pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORY_GROUPS.map((group) => {
              const Icon = group.icon;
              return (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                    selectedGroup === group.id
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {group.name}
                </button>
              );
            })}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-primary-500 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-primary-500 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              title="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Categories Grid/List */}
        <AnimatePresence mode="wait">
          {filteredCategories.length > 0 ? (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {filteredCategories.map((category, index) => {
                const Icon = category.icon;
                const SecondaryIcon = category.secondaryIcon;
                const postCount = categoryCounts[category.slug] || 0;

                return (
                  <motion.div
                    key={category.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.03 }}
                  >
                    <Link
                      to={`/category/${category.slug}`}
                      className={`block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group ${
                        viewMode === "list" ? "flex items-center" : ""
                      }`}
                    >
                      {/* Icon Section */}
                      <div
                        className={`relative ${
                          viewMode === "list"
                            ? "w-32 h-32 flex-shrink-0"
                            : "p-6 pb-0"
                        }`}
                      >
                        <div
                          className={`${
                            viewMode === "list" ? "w-full h-full" : ""
                          } relative`}
                        >
                          <div
                            className={`${
                              viewMode === "list"
                                ? "w-full h-full"
                                : "w-16 h-16"
                            } rounded-2xl bg-gradient-to-br ${
                              category.color
                            } flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                          >
                            <Icon
                              className={`${
                                viewMode === "list" ? "w-10 h-10" : "w-8 h-8"
                              } text-white`}
                            />
                          </div>
                          {viewMode === "grid" && (
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-white dark:bg-gray-800 shadow-md flex items-center justify-center">
                              <SecondaryIcon
                                className={`w-4 h-4 ${category.textColor}`}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div
                        className={`${
                          viewMode === "list" ? "flex-1 p-5" : "p-6 pt-4"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3
                            className={`${
                              viewMode === "list" ? "text-xl" : "text-lg"
                            } font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors`}
                          >
                            {category.name}
                          </h3>
                          {postCount > 0 && (
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${category.bgColor} ${category.textColor}`}
                            >
                              {postCount}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {category.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {postCount}{" "}
                            {postCount === 1 ? "article" : "articles"}
                          </span>
                          <span
                            className={`${category.textColor} group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 text-sm font-medium`}
                          >
                            Explore
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                No categories found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Try adjusting your search or filter
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGroup("all");
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CategoriesIndex;
