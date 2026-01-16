import { X } from "lucide-react";

const CATEGORIES = [
  { value: "technology", label: "Technology" },
  { value: "academic", label: "Academic" },
  { value: "campus-life", label: "Campus Life" },
  { value: "career", label: "Career" },
  { value: "research", label: "Research" },
  { value: "business-management", label: "Business" },
  { value: "programming", label: "Programming" },
  { value: "innovation", label: "Innovation" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "mostLiked", label: "Most Liked" },
  { value: "mostViewed", label: "Most Viewed" },
];

const FeedFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const hasActiveFilters = filters.category || filters.sortBy !== "newest";

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Category Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={filters.category || ""}
            onChange={(e) =>
              onFilterChange({ category: e.target.value || null })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
          {filters.category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {CATEGORIES.find((c) => c.value === filters.category)?.label}
              <button
                onClick={() => onFilterChange({ category: null })}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.sortBy !== "newest" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
              {SORT_OPTIONS.find((s) => s.value === filters.sortBy)?.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedFilters;
