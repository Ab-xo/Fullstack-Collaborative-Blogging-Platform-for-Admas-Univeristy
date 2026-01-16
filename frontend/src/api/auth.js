import apiClient from './client';

// Authentication API endpoints
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await apiClient.get('/auth/logout');
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await apiClient.put('/auth/reset-password', { token, password });
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email) => {
    const response = await apiClient.post('/auth/resend-verification', { email });
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/auth/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwords) => {
    const response = await apiClient.put('/auth/change-password', passwords);
    return response.data;
  },

  // Google registration
  googleRegister: async (userData) => {
    const response = await apiClient.post('/auth/google-register', userData);
    return response.data;
  },
};

export default authAPI;
