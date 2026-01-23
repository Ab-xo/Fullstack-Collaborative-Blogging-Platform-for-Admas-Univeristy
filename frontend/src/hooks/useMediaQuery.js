import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current viewport is mobile size
 * @returns {boolean} true if viewport width is less than 1024px
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

/**
 * Hook to detect the current breakpoint
 * @returns {string} Current breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 */
export const useBreakpoint = () => {
  const getBreakpoint = (width) => {
    if (width < 640) return 'xs';
    if (width < 768) return 'sm';
    if (width < 1024) return 'md';
    if (width < 1280) return 'lg';
    return 'xl';
  };

  const [breakpoint, setBreakpoint] = useState(
    typeof window !== 'undefined' ? getBreakpoint(window.innerWidth) : 'xl'
  );

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};

/**
 * Hook to check if viewport matches a specific media query
 * @param {string} query - Media query string (e.g., '(min-width: 768px)')
 * @returns {boolean} true if media query matches
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = (e) => setMatches(e.matches);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};
