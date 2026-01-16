// Token storage utilities
// Using sessionStorage for security - tokens are isolated per browser tab/window
// and automatically cleared when the browser is closed
const TOKEN_KEY = 'admas_access_token';
const REFRESH_TOKEN_KEY = 'admas_refresh_token';
const USER_KEY = 'admas_user';
const REMEMBER_ME_KEY = 'admas_remember_me';

// Helper to get the appropriate storage based on "remember me" preference
const getStorage = () => {
  try {
    // Check if user opted for "remember me" - only then use localStorage
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
    return rememberMe ? localStorage : sessionStorage;
  } catch {
    return sessionStorage;
  }
};

// Set remember me preference
export const setRememberMe = (remember) => {
  try {
    if (remember) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  } catch (error) {
    console.error('Error setting remember me:', error);
  }
};

// Access Token
export const getToken = () => {
  try {
    // Check sessionStorage first (current session), then localStorage (remember me)
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const setToken = (token) => {
  try {
    const storage = getStorage();
    storage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

export const removeToken = () => {
  try {
    // Clear from both storages
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// Refresh Token
export const getRefreshToken = () => {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

export const setRefreshToken = (token) => {
  try {
    const storage = getStorage();
    storage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting refresh token:', error);
  }
};

// User Data
export const getUser = () => {
  try {
    const user = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const setUser = (user) => {
  try {
    const storage = getStorage();
    storage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error setting user:', error);
  }
};

// Clear all auth data
export const clearAuth = () => {
  try {
    // Remove from both storages
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);

    // Clear any other potential auth-related keys from both storages
    const clearStorage = (storage) => {
      const keysToRemove = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && (key.includes('admas') || key.includes('auth') || key.includes('token'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => storage.removeItem(key));
    };
    
    clearStorage(localStorage);
    clearStorage(sessionStorage);

    console.log('Auth data cleared successfully');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};


// Migration: Clear old localStorage tokens if no remember me preference was set
// This ensures users who logged in before the security update are logged out
export const migrateToSessionStorage = () => {
  try {
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY);
    
    // If there's no remember me preference but there are tokens in localStorage,
    // it means the user logged in before this security update
    // Clear them to enforce the new security behavior
    if (!rememberMe && localStorage.getItem(TOKEN_KEY)) {
      console.log('Migrating auth storage: clearing old localStorage tokens for security');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return true; // Migration happened
    }
    return false; // No migration needed
  } catch (error) {
    console.error('Error during storage migration:', error);
    return false;
  }
};
