import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Filter,
  ChevronDown,
  Tag,
  Clock,
  TrendingUp,
  Heart,
  Eye,
  SlidersHorizontal,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import Badge from "../common/Badge";

const SORT_OPTIONS = [
  { id: "latest", label: "Latest", icon: Clock },
  { id: "popular", label: "Most Popular", icon: TrendingUp },
  { id: "mostLiked", label: "Most Liked", icon: Heart },
  { id: "mostViewed", label: "Most Viewed", icon: Eye },
];

const STATUS_OPTIONS = [
  { id: "all", label: "All Statuses" },
  { id: "draft", label: "Drafts" },
  { id: "pending", label: "Pending Review" },
  { id: "published", label: "Published" },
  { id: "rejected", label: "Rejected" },
];

/**
 * SearchFilter Component
 *
 * Provides search bar and filter controls for the blog page
 * with GSAP animations and role-based features
 */
const SearchFilter = ({
  searchQuery = "",
  onSearchChange,
  filters = {},
  onFilterChange,
  onClearFilters,
  categories = [],
  tags = [],
  showStatusFilter = false,
  viewMode = "grid",
  onViewModeChange,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const searchInputRef = useRef(null);
  const filterPanelRef = useRef(null);
  const categoryRef = useRef(null);
  const sortRef = useRef(null);
  const statusRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // GSAP animation for search input focus
  useEffect(() => {
    if (!searchInputRef.current) return;

    const input = searchInputRef.current;

    const handleFocus = () => {
      gsap.to(input.parentElement, {
        scale: 1.02,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleBlur = () => {
      gsap.to(input.parentElement, {
        scale: 1,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        duration: 0.3,
        ease: "power2.out",
      });
    };

    input.addEventListener("focus", handleFocus);
    input.addEventListener("blur", handleBlur);

    return () => {
      input.removeEventListener("focus", handleFocus);
      input.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    if (onSearchChange) {
      onSearchChange("");
    }
    searchInputRef.current?.focus();
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    if (onFilterChange) {
      onFilterChange({ category: categoryId === "all" ? null : categoryId });
    }
    setIsCategoryOpen(false);
  };

  // Handle sort selection
  const handleSortSelect = (sortId) => {
    if (onFilterChange) {
      onFilterChange({ sortBy: sortId });
    }
    setIsSortOpen(false);
  };

  // Handle status selection (author only)
  const handleStatusSelect = (statusId) => {
    if (onFilterChange) {
      onFilterChange({ status: statusId === "all" ? null : statusId });
    }
    setIsStatusOpen(false);
  };

  // Handle tag toggle
  const handleTagToggle = (tag) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];

    if (onFilterChange) {
      onFilterChange({ tags: newTags });
    }
  };

  // Check if any filters are active
  const hasActiveFilters =
    filters.category ||
    (filters.tags && filters.tags.length > 0) ||
    filters.status ||
    filters.sortBy !== "latest";

  // Get current sort label
  const currentSort =
    SORT_OPTIONS.find((s) => s.id === filters.sortBy) || SORT_OPTIONS[0];

  // Get current category label
  const currentCategory = categories.find(
    (c) => c.category === filters.category
  );

  return (
    <div className="space-y-4">
      {/* Search Bar and Quick Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search posts by title, content, or tags..."
              className="w-full pl-12 pr-10 py-3 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            <button
              onClick={() => onViewModeChange?.("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange?.("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              title="List view"
            >
              <LayoutList className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
              isFilterOpen || hasActiveFilters
                ? "bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-900/30 dark:border-primary-700 dark:text-primary-400"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary-500" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Filters - Always Visible */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsCategoryOpen(!isCategoryOpen);
              setIsSortOpen(false);
              setIsStatusOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <Filter className="w-4 h-4" />
            <span className="capitalize">
              {currentCategory?.category || "All Categories"}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isCategoryOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {isCategoryOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden max-h-80 overflow-y-auto"
              >
                <button
                  onClick={() => handleCategorySelect("all")}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm ${
                    !filters.category
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.category}
                    onClick={() => handleCategorySelect(cat.category)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex justify-between items-center text-sm ${
                      filters.category === cat.category
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span className="capitalize">{cat.category}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {cat.count}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsSortOpen(!isSortOpen);
              setIsCategoryOpen(false);
              setIsStatusOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <currentSort.icon className="w-4 h-4" />
            <span>{currentSort.label}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isSortOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {isSortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
              >
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSortSelect(option.id)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm ${
                      filters.sortBy === option.id ||
                      (!filters.sortBy && option.id === "latest")
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <option.icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Filter (Author Only) */}
        {showStatusFilter && (
          <div className="relative">
            <button
              onClick={() => {
                setIsStatusOpen(!isStatusOpen);
                setIsCategoryOpen(false);
                setIsSortOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <Tag className="w-4 h-4" />
              <span>
                {
                  STATUS_OPTIONS.find((s) => s.id === (filters.status || "all"))
                    ?.label
                }
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isStatusOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {isStatusOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleStatusSelect(option.id)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm ${
                        (filters.status || "all") === option.id
                          ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Extended Filter Panel - Tags */}
      <AnimatePresence>
        {isFilterOpen && tags.length > 0 && (
          <motion.div
            ref={filterPanelRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Popular Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 15).map((tagItem) => (
                  <button
                    key={tagItem.tag}
                    onClick={() => handleTagToggle(tagItem.tag)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      filters.tags?.includes(tagItem.tag)
                        ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-medium"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    #{tagItem.tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Badges */}
      {hasActiveFilters && !isFilterOpen && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={() => onFilterChange?.({ category: null })}
            >
              <span className="capitalize">{filters.category}</span>
              <X className="w-3 h-3" />
            </Badge>
          )}
          {filters.sortBy && filters.sortBy !== "latest" && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={() => onFilterChange?.({ sortBy: "latest" })}
            >
              <span>{currentSort.label}</span>
              <X className="w-3 h-3" />
            </Badge>
          )}
          {filters.status && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={() => onFilterChange?.({ status: null })}
            >
              <span>
                {STATUS_OPTIONS.find((s) => s.id === filters.status)?.label}
              </span>
              <X className="w-3 h-3" />
            </Badge>
          )}
          {filters.tags?.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={() => handleTagToggle(tag)}
            >
              <span>#{tag}</span>
              <X className="w-3 h-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
