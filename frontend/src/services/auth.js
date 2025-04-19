import api from './api';

const AUTH_TOKEN_KEY = 'token';
const USER_INFO_KEY = 'user_info';

const authService = {
  // Login user and save token
  login: async (identifier, password) => {
    try {
      const response = await api.login(identifier, password);
      
      if (response && response.token) {
        // Save token and user info to localStorage
        localStorage.setItem(AUTH_TOKEN_KEY, response.token);
        localStorage.setItem(USER_INFO_KEY, JSON.stringify({
          id: response.userId,
          username: response.username,
          email: response.email
        }));
        return response;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const response = await api.signup(userData);
      
      if (response && response.token) {
        // Save token and user info to localStorage
        localStorage.setItem(AUTH_TOKEN_KEY, response.token);
        localStorage.setItem(USER_INFO_KEY, JSON.stringify({
          id: response.userId,
          username: response.username,
          email: response.email
        }));
        return response;
      }
      return null;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Logout user and clear storage
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    // Optional: navigate to login page
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },

  // Get current user info
  getCurrentUser: () => {
    const userInfo = localStorage.getItem(USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  },

  // Get JWT token
  getToken: () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
};

export default authService; 