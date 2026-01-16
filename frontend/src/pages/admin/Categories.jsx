/**
 * Categories Management Page - Clean & Simple
 */

import { useState, useEffect } from "react";
import { FolderOpen, Search, FileText, Hash, TrendingUp } from "lucide-react";
import { postsAPI } from "../../api/posts";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import toast from "react-hot-toast";

// Category colors - Admas University Programs
const categoryColors = {
  // Business & Finance
  accounting: "#059669",
  finance: "#10B981",
  "business-management": "#3B82F6",
  marketing: "#8B5CF6",
  economics: "#6366F1",

  // Technology
  "computer-science": "#06B6D4",
  programming: "#0EA5E9",
  "software-engineering": "#64748B",
  technology: "#0891B2",
  innovation: "#FBBF24",

  // Agriculture & Education
  "agricultural-economics": "#22C55E",
  "educational-planning": "#4F46E5",
  "education-management": "#7C3AED",
  research: "#8B5CF6",
  academic: "#3B82F6",

  // Campus Life
  "campus-life": "#F97316",
  events: "#F59E0B",
  "student-clubs": "#EC4899",
  sports: "#EF4444",
  alumni: "#7C3AED",

  // Career & More
  career: "#0D9488",
  internships: "#0EA5E9",
  opinion: "#6366F1",
  news: "#DC2626",
  culture: "#A855F7",
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getCategories();

      if (response.success && response.data) {
        const mapped = response.data.map((cat) => ({
          id: cat._id || cat.slug,
          name: formatName(cat._id || cat.slug),
          slug: cat._id || cat.slug,
          postCount: cat.count || 0,
          color: categoryColors[cat._id || cat.slug] || "#6B7280",
        }));
        setCategories(mapped);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const formatName = (slug) => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const filtered = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPosts = categories.reduce((sum, cat) => sum + cat.postCount, 0);

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-600 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Categories
              </h1>
              <p className="text-sm text-gray-500">
                {categories.length} categories • {totalPosts} total posts
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <FolderOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((category) => (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.name.charAt(0)}
                  </div>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${category.color}20`,
                      color: category.color,
                    }}
                  >
                    {category.postCount} posts
                  </span>
                </div>

                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  {category.name}
                </h3>

                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Hash className="w-3 h-3" />
                  <span>{category.slug}</span>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (category.postCount /
                            Math.max(
                              ...categories.map((c) => c.postCount),
                              1
                            )) *
                            100,
                          100
                        )}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Note */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                About Categories
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Categories are predefined to maintain consistency across the
                platform. Posts are automatically organized into these
                categories when authors create content.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Categories;
