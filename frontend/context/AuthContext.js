import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add a state to track if initial auth check has completed
  const [authInitialized, setAuthInitialized] = useState(false);

  // Function to force a refresh of the auth state
  const refreshAuth = async () => {
    await checkAuth();
  };

  useEffect(() => {
    // Initial auth check when component mounts
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('Checking authentication state...');
    setLoading(true);
    
    try {
      // Check if token exists first
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.log('No authentication token found');
        setUser(null);
        return;
      }
      
      console.log('Token found, fetching current user');
      const userData = await authAPI.getCurrentUser();
      
      if (!userData || !userData._id) {
        console.error('Invalid user data received:', userData);
        throw new Error('Invalid user data');
      }
      
      console.log('Authentication successful:', userData.username);
      setUser(userData);
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token
      await AsyncStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
      setAuthInitialized(true);
      console.log('Auth check completed, initialized:', true);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('Attempting login with credentials:', { ...credentials, password: '[REDACTED]' });
      setLoading(true);
      
      // Clear any existing token first to prevent conflicts
      await AsyncStorage.removeItem('token');
      
      const response = await authAPI.login(credentials);
      
      if (!response || !response.token || !response.user) {
        console.error('Invalid login response:', response);
        throw new Error('Invalid login response from server');
      }
      
      const { token, user } = response;
      
      // Validate user object
      if (!user._id) {
        console.error('User object missing ID:', user);
        throw new Error('Invalid user data received');
      }
      
      console.log('Login successful, storing token and user data');
      await AsyncStorage.setItem('token', token);
      setUser(user);
      
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      // Clear any partial data
      await AsyncStorage.removeItem('token');
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const { token, user } = await authAPI.register(userData);
      await AsyncStorage.setItem('token', token);
      setUser(user);
      return user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      authInitialized,
      login, 
      register, 
      logout,
      refreshAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Utility function for debugging - can be called from anywhere to clear the token
export const clearAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
    console.log('Authentication token cleared successfully');
    return true;
  } catch (error) {
    console.error('Failed to clear authentication token:', error);
    return false;
  }
}; 