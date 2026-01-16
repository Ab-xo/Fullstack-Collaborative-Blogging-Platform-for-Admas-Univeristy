import { useState } from 'react';

export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const hasMore = page < totalPages;
  const hasPrevious = page > 1;

  const nextPage = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const previousPage = () => {
    if (hasPrevious) {
      setPage((prev) => prev - 1);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  };

  const reset = () => {
    setPage(initialPage);
  };

  const updatePagination = (data) => {
    if (data.totalPages) setTotalPages(data.totalPages);
    if (data.totalItems) setTotalItems(data.totalItems);
    if (data.currentPage) setPage(data.currentPage);
  };

  return {
    page,
    limit,
    totalPages,
    totalItems,
    hasMore,
    hasPrevious,
    setPage,
    setLimit,
    nextPage,
    previousPage,
    goToPage,
    reset,
    updatePagination,
  };
};

export default usePagination;
