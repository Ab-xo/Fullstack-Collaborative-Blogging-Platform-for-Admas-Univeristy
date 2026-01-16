import axios from 'axios';
import { getToken, removeToken } from '../utils/storage';

// Use relative path - Vite proxy handles the routing to backend
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

// Public endpoints that don't require authentication
const publicEndpoints = [
  '/posts',
  '/posts/',
  '/auth/login',
  '/auth/register',
];

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    // Check if this is a public endpoint or GET request
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      originalRequest?.url?.startsWith(endpoint)
    );
    const isGetRequest = originalRequest?.method?.toLowerCase() === 'get';
    
    // Only redirect to login for 401 on protected endpoints
    if (error.response?.status === 401 && !isPublicEndpoint && !isGetRequest) {
      removeToken();
      // Don't redirect if already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;