import axios from 'axios';
import { getToken, setToken, removeToken, getRefreshToken } from '../utils/storage';

// Simple in-memory cache for GET requests
const cache = new Map();
const CACHE_DURATION = 30000; // 30 seconds cache

// Create axios instance with optimized settings
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4001/api',
  timeout: 10000, // Reduced to 10 seconds for faster feedback
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeoutErrorMessage: 'Request timeout - the server took too long to respond',
});

// Cache helper functions
const getCacheKey = (config) => `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  // Limit cache size
  if (cache.size > 50) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
};

// Public endpoints that can be cached
const cacheableEndpoints = ['/public/stats', '/categories', '/posts?'];

// Request interceptor - attach token and check cache
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Check cache for GET requests
    if (config.method === 'get') {
      const cacheKey = getCacheKey(config);
      const isCacheable = cacheableEndpoints.some(ep => config.url?.includes(ep));
      
      if (isCacheable) {
        const cachedData = getFromCache(cacheKey);
        if (cachedData) {
          // Return cached response by throwing a special error
          const error = new Error('CACHE_HIT');
          error.cachedResponse = cachedData;
          throw error;
        }
      }
      config._cacheKey = cacheKey;
      config._isCacheable = isCacheable;
    }
    
    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => {
    // Handle cache hit
    if (error.message === 'CACHE_HIT') {
      return Promise.resolve(error.cachedResponse);
    }
    return Promise.reject(error);
  }
);

// Response interceptor - handle caching and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config?._isCacheable && response.config?._cacheKey) {
      setCache(response.config._cacheKey, response);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // List of public endpoints that don't require authentication
    const publicEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh-token',
      '/posts/', // All post reading endpoints
      '/posts?', // Post listing with query params
      '/posts/search',
      '/posts/categories',
      '/posts/tags',
      '/posts/category/',
    ];

    // Check if this is a public endpoint
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      originalRequest.url?.includes(endpoint)
    );

    // Check if this is a GET request (most GET requests should be public)
    const isGetRequest = originalRequest.method?.toLowerCase() === 'get';

    // Handle 401 errors - token expired
    // Only try to refresh token if:
    // 1. It's not a public endpoint
    // 2. It's not a GET request (or it's a protected GET like /user/me)
    // 3. User actually has a token (was logged in)
    if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          // No refresh token - only redirect if this was a protected endpoint
          removeToken();
          // Only redirect to login if user was trying to access a protected resource
          if (!isGetRequest && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:4001/api'}/auth/refresh-token`,
          { refreshToken },
          { withCredentials: true }
        );

        const { accessToken } = response.data;
        setToken(accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login only for protected resources
        removeToken();
        if (!isGetRequest && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error); // Return original error, not refresh error
      }
    }

    // Handle other errors
    const errorMessage = getErrorMessage(error);
    console.error('[API Error]', errorMessage, error);

    // Handle maintenance mode
    if (error.response?.status === 503 && error.response?.data?.maintenanceMode) {
      // Store maintenance mode state
      sessionStorage.setItem('maintenanceMode', 'true');
      // Redirect to a maintenance page or show message
      if (!window.location.pathname.includes('/maintenance')) {
        window.location.href = '/maintenance';
      }
      return Promise.reject(error);
    }

    // Handle registration disabled
    if (error.response?.status === 403 && error.response?.data?.registrationDisabled) {
      // Let the component handle this error
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Helper function to extract error messages
function getErrorMessage(error) {
  // Check for timeout
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Request timed out. The server is taking too long to respond. Please try again.';
  }
  
  if (error.response) {
    // Server responded with error
    return error.response.data?.message || error.response.statusText || 'Server error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'Unable to connect to server. Please check your internet connection.';
  } else {
    // Error in request setup
    return error.message || 'An unexpected error occurred';
  }
}

// Helper function to check if error is a timeout
function isTimeoutError(error) {
  return error.code === 'ECONNABORTED' || error.message?.includes('timeout');
}

export default apiClient;
export { getErrorMessage, isTimeoutError };
