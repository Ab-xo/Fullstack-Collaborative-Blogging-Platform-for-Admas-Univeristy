import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

/**
 * Pagination Component
 *
 * Displays page navigation with GSAP transitions
 * and smooth scroll to top on page change
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 9,
  onPageChange,
  scrollToTop = true,
}) => {
  const paginationRef = useRef(null);

  // GSAP entrance animation - with visibility fallback
  useEffect(() => {
    if (!paginationRef.current) return;

    // Ensure pagination is visible even if animation fails
    paginationRef.current.style.opacity = "1";
    paginationRef.current.style.transform = "translateY(0)";

    const ctx = gsap.context(() => {
      gsap.fromTo(
        paginationRef.current,
        { opacity: 0.5, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }, paginationRef);

    return () => ctx.revert();
  }, []);

  // Handle page change with scroll
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    // Animate out current content
    if (paginationRef.current) {
      gsap.to(paginationRef.current, {
        opacity: 0.5,
        duration: 0.2,
        onComplete: () => {
          if (onPageChange) {
            onPageChange(page);
          }

          // Scroll to top
          if (scrollToTop) {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }

          // Animate back in
          gsap.to(paginationRef.current, {
            opacity: 1,
            duration: 0.3,
          });
        },
      });
    } else {
      if (onPageChange) {
        onPageChange(page);
      }
      if (scrollToTop) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Don't render if only one page
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      ref={paginationRef}
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700"
    >
      {/* Results Info */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Showing <span className="font-medium">{startItem}</span> to{" "}
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalItems}</span> posts
      </p>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </motion.button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-2 text-gray-400"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              );
            }

            const isActive = page === currentPage;

            return (
              <motion.button
                key={page}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handlePageChange(page)}
                className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-500 text-white shadow-md"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {page}
              </motion.button>
            );
          })}
        </div>

        {/* Next Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};

export default Pagination;
