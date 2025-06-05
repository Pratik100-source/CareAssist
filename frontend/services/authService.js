import axios from 'axios';
import { store } from '../store';
import { setUserInfo, logout } from '../features/userSlice';

// Create a base instance of axios
const API_URL = 'http://localhost:3003/api'; // Corrected port to match backend server

// Main axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Function to refresh the token
const refreshToken = async () => {
  try {
    const response = await axios.post(`${API_URL}/auth/refresh-token`, {
      refreshToken: localStorage.getItem('refreshToken'),
    });
    
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    // Save the new tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    
    // Update the store with new token
    const currentUser = store.getState().user;
    store.dispatch(setUserInfo({
      ...currentUser,
      token: accessToken
    }));
    
    return accessToken;
  } catch (error) {
    // If refresh token fails, logout the user
    store.dispatch(logout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/';
    return null;
  }
};

// Request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      // For debugging
      console.log(`Request to ${config.url} with token: ${accessToken.substring(0, 10)}...`);
    } else {
      console.warn(`AUTH WARNING: No access token for request to: ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and ban status
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data || error.message);
    
    const originalRequest = error.config;
    
    // Handle ban status
    if (error.response?.status === 403 && error.response?.data?.status) {
      const status = error.response.data.status;
      const message = error.response.data.message;
      
      // Store the ban status in localStorage
      localStorage.setItem('accountStatus', status);
      
      // If user is blocked or inactive, force logout
      if (status === 'blocked' || status === 'inactive') {
        // Clear user data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        store.dispatch(logout());
        
        // Show message and redirect
        alert(message);
        window.location.href = '/';
        return Promise.reject(error);
      }
    }
    
    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Attempting token refresh...');
      originalRequest._retry = true;
      
      const newToken = await refreshToken();
      if (newToken) {
        console.log('Token refreshed, retrying request');
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth service functions
const authService = {
  // Login user and store tokens
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token: accessToken, refreshToken, userType, user } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Update Redux store
      store.dispatch(setUserInfo({
        userType,
        token: accessToken,
        basic_info: user
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  },
  
  // Logout user and clear tokens
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    store.dispatch(logout());
  },
  
  // Get current user info from token
  getCurrentUser: () => {
    const user = store.getState().user;
    return user.token ? user : null;
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  }
};

export { api, authService }; 