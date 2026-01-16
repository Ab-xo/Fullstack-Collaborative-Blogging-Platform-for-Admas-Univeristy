import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for fetching and caching analytics data
 * @param {Function} fetchFunction - The API function to call
 * @param {Object} params - Parameters to pass to the fetch function
 * @param {Object} options - Hook options (polling, dependencies, etc.)
 */
export const useAnalyticsData = (fetchFunction, params = {}, options = {}) => {
  const {
    pollInterval = null,
    enabled = true,
    dependencies = []
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction(params);
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, params, enabled, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling mechanism
  useEffect(() => {
    if (!pollInterval || !enabled) return;

    const interval = setInterval(() => {
      fetchData();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval, enabled, fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch
  };
};

/**
 * Custom hook for polling data with pause/resume on visibility change
 * @param {Function} fetchFunction - The API function to call
 * @param {number} interval - Polling interval in milliseconds
 * @param {Object} params - Parameters to pass to the fetch function
 */
export const usePolling = (fetchFunction, interval, params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction(params);
      setData(result);
    } catch (err) {
      console.error('Polling error:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, params]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling logic
  useEffect(() => {
    if (!isPolling || !interval) return;

    intervalRef.current = setInterval(() => {
      fetchData();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPolling, interval, fetchData]);

  // Pause polling when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPolling(false);
      } else {
        setIsPolling(true);
        fetchData(); // Fetch immediately when returning
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData]);

  const pause = useCallback(() => {
    setIsPolling(false);
  }, []);

  const resume = useCallback(() => {
    setIsPolling(true);
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    isPolling,
    pause,
    resume,
    refetch: fetchData
  };
};

/**
 * Custom hook for transforming data for chart consumption
 * @param {*} rawData - Raw data from API
 * @param {Function} transformer - Function to transform data
 */
export const useChartData = (rawData, transformer) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!rawData || !transformer) {
      setChartData(null);
      return;
    }

    try {
      const transformed = transformer(rawData);
      setChartData(transformed);
    } catch (err) {
      console.error('Error transforming chart data:', err);
      setChartData(null);
    }
  }, [rawData, transformer]);

  return chartData;
};

/**
 * Custom hook for managing filter state
 * @param {Object} initialFilters - Initial filter values
 */
export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    const active = Object.entries(filters)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => ({ key, value }));
    setActiveFilters(active);
  }, [filters]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const removeFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  return {
    filters,
    activeFilters,
    updateFilter,
    removeFilter,
    clearFilters
  };
};

export default {
  useAnalyticsData,
  usePolling,
  useChartData,
  useFilters
};
