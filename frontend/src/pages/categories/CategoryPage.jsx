/**
 * ============================================================================
 * CATEGORY PAGE COMPONENT - Enhanced Design
 * ============================================================================
 *
 * A beautifully designed component that displays blog posts filtered by category.
 * Features unique icons, gradient backgrounds, and modern UI elements.
 *
 * Routes: /category/:slug (e.g., /category/technology, /category/research)
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
  ArrowLeft,
  ArrowRight,
  Search,
  Grid3X3,
  LayoutList,
  Clock,
  Eye,
  ThumbsUp,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Star,
  Bookmark,
  Share2,
} from "lucide-react";
import { format } from "date-fns";
import api from "../../services/api";
import programService from "../../services/programService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Avatar from "../../components/common/Avatar";

// Enhanced Category configuration with unique icons and styling
const CATEGORY_CONFIG = {
  academic: {
    name: "Academic",
    description:
      "Academic articles, study guides, and educational resources for students and faculty at Admas University.",
    icon: GraduationCap,
    secondaryIcon: Award,
    color: "from-blue-500 via-blue-600 to-indigo-600",
    lightColor: "from-blue-400 to-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    pattern: "academic",
  },
  research: {
    name: "Research",
    description:
      "Cutting-edge research findings, publications, and scholarly work from our academic community.",
    icon: Microscope,
    secondaryIcon: Brain,
    color: "from-purple-500 via-purple-600 to-violet-600",
    lightColor: "from-purple-400 to-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    textColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
    pattern: "research",
  },
  programs: {
    name: "Programs",
    description:
      "Explore our wide range of academic programs, from undergraduate degrees to vocational training.",
    icon: GraduationCap,
    secondaryIcon: BookOpen,
    color: "from-blue-600 via-indigo-600 to-violet-600",
    lightColor: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    pattern: "programs",
  },
  thesis: {
    name: "Thesis & Dissertations",
    description:
      "Outstanding thesis projects, dissertations, and academic papers from our talented students.",
    icon: FileText,
    secondaryIcon: BookOpen,
    color: "from-indigo-500 via-indigo-600 to-blue-600",
    lightColor: "from-indigo-400 to-indigo-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    textColor: "text-indigo-600 dark:text-indigo-400",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    pattern: "thesis",
  },
  tutorials: {
    name: "Tutorials & Guides",
    description:
      "Step-by-step tutorials, how-to guides, and comprehensive learning resources.",
    icon: Lightbulb,
    secondaryIcon: Sparkles,
    color: "from-amber-400 via-yellow-500 to-orange-500",
    lightColor: "from-amber-300 to-yellow-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800",
    pattern: "tutorials",
  },
  "campus-life": {
    name: "Campus Life",
    description:
      "Vibrant stories and experiences from daily life at Admas University campus.",
    icon: Building2,
    secondaryIcon: Users,
    color: "from-orange-500 via-orange-600 to-red-500",
    lightColor: "from-orange-400 to-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    textColor: "text-orange-600 dark:text-orange-400",
    borderColor: "border-orange-200 dark:border-orange-800",
    pattern: "campus",
  },
  events: {
    name: "Events & Activities",
    description:
      "Exciting upcoming and past events, conferences, workshops, and campus activities.",
    icon: CalendarDays,
    secondaryIcon: PartyPopper,
    color: "from-red-500 via-rose-500 to-pink-500",
    lightColor: "from-red-400 to-rose-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    textColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    pattern: "events",
  },
  clubs: {
    name: "Clubs & Organizations",
    description:
      "Student organizations, clubs, societies, and extracurricular activities.",
    icon: Users,
    secondaryIcon: Heart,
    color: "from-pink-500 via-pink-600 to-rose-600",
    lightColor: "from-pink-400 to-pink-500",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
    textColor: "text-pink-600 dark:text-pink-400",
    borderColor: "border-pink-200 dark:border-pink-800",
    pattern: "clubs",
  },
  sports: {
    name: "Sports & Athletics",
    description:
      "Athletic achievements, sports news, fitness content, and championship highlights.",
    icon: Trophy,
    secondaryIcon: Medal,
    color: "from-green-500 via-emerald-500 to-teal-500",
    lightColor: "from-green-400 to-emerald-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    textColor: "text-green-600 dark:text-green-400",
    borderColor: "border-green-200 dark:border-green-800",
    pattern: "sports",
  },
  technology: {
    name: "Technology",
    description:
      "Latest tech trends, coding tutorials, software development, AI, and digital innovation.",
    icon: Code,
    secondaryIcon: CircuitBoard,
    color: "from-cyan-500 via-blue-500 to-indigo-500",
    lightColor: "from-cyan-400 to-blue-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
    textColor: "text-cyan-600 dark:text-cyan-400",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    pattern: "technology",
  },
  innovation: {
    name: "Innovation & Startups",
    description:
      "Entrepreneurship, startups, creative solutions, and groundbreaking new ideas.",
    icon: Rocket,
    secondaryIcon: Target,
    color: "from-amber-500 via-orange-500 to-red-500",
    lightColor: "from-amber-400 to-orange-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800",
    pattern: "innovation",
  },
  engineering: {
    name: "Engineering",
    description:
      "Engineering projects, technical articles, design principles, and practical applications.",
    icon: Cog,
    secondaryIcon: Wrench,
    color: "from-slate-500 via-gray-600 to-zinc-600",
    lightColor: "from-slate-400 to-gray-500",
    bgColor: "bg-slate-50 dark:bg-slate-950/30",
    textColor: "text-slate-600 dark:text-slate-400",
    borderColor: "border-slate-200 dark:border-slate-800",
    pattern: "engineering",
  },
  science: {
    name: "Science & Discovery",
    description:
      "Scientific discoveries, experiments, natural world exploration, and breakthrough findings.",
    icon: Atom,
    secondaryIcon: FlaskConical,
    color: "from-emerald-500 via-green-500 to-teal-500",
    lightColor: "from-emerald-400 to-green-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    pattern: "science",
  },
  culture: {
    name: "Culture & Heritage",
    description:
      "Cultural perspectives, traditions, heritage, and global insights from diverse communities.",
    icon: Globe,
    secondaryIcon: Languages,
    color: "from-teal-500 via-cyan-500 to-blue-500",
    lightColor: "from-teal-400 to-cyan-400",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
    textColor: "text-teal-600 dark:text-teal-400",
    borderColor: "border-teal-200 dark:border-teal-800",
    pattern: "culture",
  },
  arts: {
    name: "Arts & Creativity",
    description:
      "Visual arts, music, theater, photography, and creative expression in all forms.",
    icon: Palette,
    secondaryIcon: Camera,
    color: "from-rose-500 via-pink-500 to-fuchsia-500",
    lightColor: "from-rose-400 to-pink-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    textColor: "text-rose-600 dark:text-rose-400",
    borderColor: "border-rose-200 dark:border-rose-800",
    pattern: "arts",
  },
  literature: {
    name: "Literature & Writing",
    description:
      "Creative writing, poetry, book reviews, literary analysis, and storytelling.",
    icon: Feather,
    secondaryIcon: Pen,
    color: "from-violet-500 via-purple-500 to-indigo-500",
    lightColor: "from-violet-400 to-purple-400",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    textColor: "text-violet-600 dark:text-violet-400",
    borderColor: "border-violet-200 dark:border-violet-800",
    pattern: "literature",
  },
  career: {
    name: "Career & Professional",
    description:
      "Career advice, job opportunities, professional development, and industry insights.",
    icon: Briefcase,
    secondaryIcon: TrendingUp,
    color: "from-sky-500 via-blue-500 to-indigo-500",
    lightColor: "from-sky-400 to-blue-400",
    bgColor: "bg-sky-50 dark:bg-sky-950/30",
    textColor: "text-sky-600 dark:text-sky-400",
    borderColor: "border-sky-200 dark:border-sky-800",
    pattern: "career",
  },
  alumni: {
    name: "Alumni Network",
    description:
      "Alumni stories, success journeys, networking opportunities, and community connections.",
    icon: UserCircle,
    secondaryIcon: Users2,
    color: "from-lime-500 via-green-500 to-emerald-500",
    lightColor: "from-lime-400 to-green-400",
    bgColor: "bg-lime-50 dark:bg-lime-950/30",
    textColor: "text-lime-600 dark:text-lime-400",
    borderColor: "border-lime-200 dark:border-lime-800",
    pattern: "alumni",
  },
  opinion: {
    name: "Opinion & Editorial",
    description:
      "Editorials, perspectives, thought-provoking discussions, and community voices.",
    icon: MessageSquare,
    secondaryIcon: Pen,
    color: "from-fuchsia-500 via-purple-500 to-violet-500",
    lightColor: "from-fuchsia-400 to-purple-400",
    bgColor: "bg-fuchsia-50 dark:bg-fuchsia-950/30",
    textColor: "text-fuchsia-600 dark:text-fuchsia-400",
    borderColor: "border-fuchsia-200 dark:border-fuchsia-800",
    pattern: "opinion",
  },
  announcements: {
    name: "Announcements",
    description:
      "Official university news, important updates, notices, and institutional communications.",
    icon: Megaphone,
    secondaryIcon: Bell,
    color: "from-red-600 via-rose-600 to-pink-600",
    lightColor: "from-red-500 to-rose-500",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    textColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    pattern: "announcements",
  },
  news: {
    name: "News & Updates",
    description:
      "Latest news, breaking stories, and updates from the university community.",
    icon: Newspaper,
    secondaryIcon: Flame,
    color: "from-red-500 via-orange-500 to-amber-500",
    lightColor: "from-red-400 to-orange-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    textColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    pattern: "news",
  },
  other: {
    name: "Other",
    description:
      "Miscellaneous content and posts that don't fit into other categories.",
    icon: Sparkles,
    secondaryIcon: Star,
    color: "from-gray-500 via-slate-500 to-zinc-500",
    lightColor: "from-gray-400 to-slate-400",
    bgColor: "bg-gray-50 dark:bg-gray-950/30",
    textColor: "text-gray-600 dark:text-gray-400",
    borderColor: "border-gray-200 dark:border-gray-800",
    pattern: "other",
  },
};



// Sort options
const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent", icon: Clock },
  { value: "popular", label: "Most Popular", icon: Flame },
  { value: "views", label: "Most Viewed", icon: Eye },
  { value: "likes", label: "Most Liked", icon: ThumbsUp },
];

const CategoryPage = () => {
  const { slug } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [programs, setPrograms] = useState([]);
  const postsPerPage = 12;

  // Fetch programs for dynamic display
  useEffect(() => {
    if (slug === 'programs') {
      const loadPrograms = async () => {
        try {
          const data = await programService.getAllPrograms({ activeOnly: true });
          setPrograms(data.data || []);
        } catch (err) {
          console.error("Failed to load programs:", err);
        }
      };
      loadPrograms();
    }
  }, [slug]);

  // Get category config or default - with safe fallback
  const getCategoryConfig = () => {
    if (!slug) {
      return {
        name: "Category",
        description: "Browse posts by category.",
        icon: BookOpen,
        secondaryIcon: Sparkles,
        color: "from-gray-500 via-gray-600 to-slate-600",
        lightColor: "from-gray-400 to-gray-500",
        bgColor: "bg-gray-50 dark:bg-gray-950/30",
        textColor: "text-gray-600 dark:text-gray-400",
        borderColor: "border-gray-200 dark:border-gray-800",
        pattern: "default",
      };
    }

    return (
      CATEGORY_CONFIG[slug] || {
        name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " "),
        description: `Browse all posts in the ${slug.replace(
          /-/g,
          " "
        )} category.`,
        icon: BookOpen,
        secondaryIcon: Sparkles,
        color: "from-gray-500 via-gray-600 to-slate-600",
        lightColor: "from-gray-400 to-gray-500",
        bgColor: "bg-gray-50 dark:bg-gray-950/30",
        textColor: "text-gray-600 dark:text-gray-400",
        borderColor: "border-gray-200 dark:border-gray-800",
        pattern: "default",
      }
    );
  };

  const category = getCategoryConfig();
  const CategoryIcon = category.icon || BookOpen;
  const SecondaryIcon = category.secondaryIcon || Sparkles;
  const currentSort =
    SORT_OPTIONS.find((s) => s.value === sortBy) || SORT_OPTIONS[0];

  const fetchPosts = async () => {
    if (!slug) return;

    setLoading(true);
    setError(null);
    try {
      console.log("[CategoryPage] Fetching posts for category:", slug);
      const response = await api.get("/posts", {
        params: {
          category: slug,
          page: currentPage,
          limit: postsPerPage,
          sort: sortBy,
        },
      });

      console.log("[CategoryPage] API Response:", response.data);

      // Handle different response structures
      const responseData = response.data?.data || response.data;
      const postsData = responseData?.posts || responseData || [];
      const paginationData = responseData?.pagination || {};

      setPosts(Array.isArray(postsData) ? postsData : []);
      setTotalPages(paginationData?.pages || paginationData?.totalPages || 1);
      setTotalPosts(
        paginationData?.total ||
          paginationData?.totalPosts ||
          postsData.length ||
          0
      );

      console.log("[CategoryPage] Posts loaded:", postsData.length);
    } catch (err) {
      console.error("[CategoryPage] Error fetching posts:", err);
      console.error("[CategoryPage] Error details:", err.response?.data);
      setError(
        err.response?.data?.message || "Failed to load posts. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, currentPage, sortBy]);

  // Filter posts by search query
  const filteredPosts = posts.filter(
    (post) =>
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date) => {
    try {
      return format(new Date(date), "MMM d, yyyy");
    } catch {
      return "Unknown date";
    }
  };

  const getReadingTime = (content) => {
    if (!content) return "1 min read";
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  // If no slug, show loading
  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" text="Loading category..." />
      </div>
    );
  }

  // Ensure category has all required properties
  const safeCategory = {
    name: category?.name || "Category",
    description: category?.description || "Browse posts by category.",
    color: category?.color || "from-gray-500 via-gray-600 to-slate-600",
    lightColor: category?.lightColor || "from-gray-400 to-gray-500",
    bgColor: category?.bgColor || "bg-gray-50 dark:bg-gray-950/30",
    textColor: category?.textColor || "text-gray-600 dark:text-gray-400",
    borderColor:
      category?.borderColor || "border-gray-200 dark:border-gray-800",
  };

  const renderProgramIcon = (iconName) => {
     // Dynamic icon rendering
     const IconMap = {
      GraduationCap, BookOpen, Code, Briefcase, TrendingUp, Award, 
      CircuitBoard, FileText, Wrench, Globe, Palette, Users, Lightbulb
     };
     const IconComponent = IconMap[iconName] || GraduationCap;
     return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${safeCategory.color} opacity-95`}
        />

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />

          {/* Floating Icons */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-[15%] opacity-20"
          >
            <CategoryIcon className="w-24 h-24 text-white" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-20 left-[10%] opacity-20"
          >
            <SecondaryIcon className="w-20 h-20 text-white" />
          </motion.div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm mb-8">
              <Link
                to="/home"
                className="text-white/70 hover:text-white transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-white/50" />
              <Link
                to="/categories"
                className="text-white/70 hover:text-white transition-colors"
              >
                Categories
              </Link>
              <ChevronRight className="w-4 h-4 text-white/50" />
              <span className="text-white font-medium">
                {safeCategory.name}
              </span>
            </nav>

            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              {/* Icon Container */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/30">
                  <CategoryIcon className="w-14 h-14 lg:w-16 lg:h-16 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-xl bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <SecondaryIcon className="w-6 h-6 text-white" />
                </div>
              </motion.div>

              {/* Content */}
              <div className="flex-1">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4"
                >
                  {safeCategory.name}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-lg lg:text-xl text-white/80 max-w-2xl mb-6"
                >
                  {safeCategory.description}
                </motion.p>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex flex-wrap items-center gap-6"
                >
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <BookOpen className="w-5 h-5 text-white" />
                    <span className="text-white font-medium">
                      {totalPosts} {totalPosts === 1 ? "Article" : "Articles"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Users className="w-5 h-5 text-white" />
                    <span className="text-white font-medium">
                      Active Community
                    </span>
                  </div>
                </motion.div>
              </div>
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

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* Programs Sub-categories Grid */}
        {slug === "programs" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              Available Programs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {programs.map((program, index) => (
                <motion.div
                  key={program._id || index}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSearchQuery(program.name)}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${program.color}`}>
                    {renderProgramIcon(program.icon)}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {program.name}
                  </h3>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Enhanced Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border ${safeCategory.borderColor} p-4 lg:p-6 mb-8`}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search in ${safeCategory.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                  safeCategory.borderColor
                } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-offset-0 focus:border-transparent transition-all ${safeCategory.textColor.replace(
                  "text-",
                  "focus:ring-"
                )}`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* Sort Dropdown */}
              <div className="relative flex-1 lg:flex-none">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${safeCategory.borderColor} bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full lg:w-auto justify-between lg:justify-start`}
                >
                  <currentSort.icon className="w-4 h-4" />
                  <span className="font-medium">{currentSort.label}</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      showSortDropdown ? "rotate-90" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showSortDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 lg:right-auto mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20 min-w-[180px]"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSortDropdown(false);
                          }}
                          className={`flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            sortBy === option.value
                              ? `${safeCategory.bgColor} ${safeCategory.textColor}`
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <option.icon className="w-4 h-4" />
                          <span className="font-medium">{option.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* View Toggle */}
              <div
                className={`flex items-center bg-gray-50 dark:bg-gray-900 rounded-xl border ${safeCategory.borderColor} p-1`}
              >
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? `bg-gradient-to-r ${safeCategory.lightColor} text-white shadow-md`
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  title="Grid view"
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === "list"
                      ? `bg-gradient-to-r ${safeCategory.lightColor} text-white shadow-md`
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  title="List view"
                >
                  <LayoutList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${safeCategory.color} flex items-center justify-center mb-4 animate-pulse`}
            >
              <CategoryIcon className="w-8 h-8 text-white" />
            </div>
            <LoadingSpinner
              size="lg"
              text={`Loading ${safeCategory.name} posts...`}
            />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <CategoryIcon className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={fetchPosts}
              className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${safeCategory.color} text-white rounded-xl hover:opacity-90 transition-opacity font-medium shadow-lg`}
            >
              <ArrowRight className="w-4 h-4" />
              Try Again
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div
              className={`w-24 h-24 mx-auto mb-6 rounded-3xl ${safeCategory.bgColor} flex items-center justify-center`}
            >
              <CategoryIcon
                className={`w-12 h-12 ${safeCategory.textColor} opacity-50`}
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {searchQuery ? "No matching posts" : "No posts yet"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {searchQuery
                ? `We couldn't find any posts matching "${searchQuery}" in ${safeCategory.name}`
                : `Be the first to share your thoughts in ${safeCategory.name}!`}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Clear Search
                </button>
              )}
              <Link
                to="/blogs"
                className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${safeCategory.color} text-white rounded-xl hover:opacity-90 transition-opacity font-medium shadow-lg`}
              >
                <ArrowLeft className="w-4 h-4" />
                Browse All Posts
              </Link>
            </div>
          </motion.div>
        )}

        {/* Posts Grid/List */}
        {!loading && !error && filteredPosts.length > 0 && (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                  : "space-y-6"
              }
            >
              {filteredPosts.map((post, index) => (
                <Link
                  key={post._id}
                  to={`/posts/${post._id}`}
                  className="block"
                >
                  <motion.article
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className={`group cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        : "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 flex"
                    }`}
                  >
                    {/* Featured Image */}
                    <div
                      className={
                        viewMode === "list" ? "w-64 flex-shrink-0" : ""
                      }
                    >
                      <div
                        className={`relative ${
                          viewMode === "grid"
                            ? "aspect-[16/10]"
                            : "h-full min-h-[200px]"
                        } bg-gradient-to-br ${
                          safeCategory.color
                        } overflow-hidden`}
                      >
                        {post.featuredImage ? (
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <CategoryIcon className="w-16 h-16 text-white/30" />
                          </div>
                        )}

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Quick Actions */}
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={(e) => e.preventDefault()}
                            className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg"
                          >
                            <Bookmark className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                          </button>
                          <button
                            onClick={(e) => e.preventDefault()}
                            className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg"
                          >
                            <Share2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                          </button>
                        </div>

                        {/* Reading Time Badge */}
                        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="px-3 py-1 bg-white/90 dark:bg-gray-800/90 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getReadingTime(post.content)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div
                      className={`p-5 lg:p-6 flex-1 flex flex-col ${
                        viewMode === "list" ? "justify-center" : ""
                      }`}
                    >
                      {/* Category Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${safeCategory.bgColor} ${safeCategory.textColor}`}
                        >
                          <CategoryIcon className="w-3 h-3" />
                          {safeCategory.name}
                        </span>
                        {post.featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                            <Star className="w-3 h-3" />
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h2
                        className={`text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors`}
                      >
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-grow">
                        {post.excerpt ||
                          "Click to read more about this interesting article..."}
                      </p>

                      {/* Author & Meta */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={post.author?.profile?.avatar}
                            alt={post.author?.firstName}
                            fallback={post.author?.email}
                            size="sm"
                            className="ring-2 ring-transparent group-hover:ring-primary-500 transition-all"
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {post.author?.firstName} {post.author?.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(post.publishedAt || post.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span
                            className="flex items-center gap-1"
                            title="Views"
                          >
                            <Eye className="w-4 h-4" />
                            {post.views || 0}
                          </span>
                          <span
                            className="flex items-center gap-1"
                            title="Likes"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            {post.likesCount || 0}
                          </span>
                          <span
                            className="flex items-center gap-1"
                            title="Comments"
                          >
                            <MessageCircle className="w-4 h-4" />
                            {post.commentsCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex justify-center items-center gap-2 mt-12"
              >
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`p-3 rounded-xl border ${safeCategory.borderColor} disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-11 h-11 rounded-xl font-medium transition-all ${
                          currentPage === pageNum
                            ? `bg-gradient-to-r ${safeCategory.color} text-white shadow-lg`
                            : `border ${safeCategory.borderColor} hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300`
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`p-3 rounded-xl border ${safeCategory.borderColor} disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
