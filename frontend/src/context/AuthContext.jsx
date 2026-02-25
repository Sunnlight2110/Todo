import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import apiClient from '../api/client';
import { clearSessionUUID } from '../utils/sessionUUID';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfileLoaded, setUserProfileLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Fetch user profile from /auth/me endpoint
  const fetchUserProfile = useCallback(async (authToken) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: authToken },
      });
      
      const userData = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
      };
      
      setUser(userData);
      localStorage.setItem('authUser', JSON.stringify(userData));
      setUserProfileLoaded(true);
      return userData;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setUserProfileLoaded(true);
      throw err;
    }
  }, []);

  // Attempt to refresh token
  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const { access_token } = response.data;
      const fullToken = `Bearer ${access_token}`;
      
      setToken(fullToken);
      localStorage.setItem('authToken', fullToken);
      
      return fullToken;
    } catch (err) {
      console.error('Token refresh failed:', err);
      throw err;
    }
  }, []);

  // Initialize auth on app load - CRITICAL for UX
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        
        // If we have both token and user in storage, use them immediately
        if (storedToken && storedUser) {
          try {
            setToken(storedToken);
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setUserProfileLoaded(true);
            
            // Verify token is still valid by calling /me
            try {
              await axios.get(`${API_BASE_URL}/auth/me`, {
                headers: { Authorization: storedToken },
              });
              // Token is valid, we're authenticated
              setIsInitialized(true);
              return;
            } catch (meErr) {
              // Token might be expired, try to refresh
              if (meErr.response?.status === 401) {
                try {
                  const newToken = await refreshAccessToken();
                  // Token refreshed, try /me again
                  await axios.get(`${API_BASE_URL}/auth/me`, {
                    headers: { Authorization: newToken },
                  });
                  setIsInitialized(true);
                  return;
                } catch (refreshErr) {
                  // Refresh failed, clear auth
                  setToken(null);
                  setUser(null);
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('authUser');
                  localStorage.removeItem('refreshToken');
                  setIsInitialized(true);
                  return;
                }
              }
              throw meErr;
            }
          } catch (err) {
            console.error('Failed to initialize auth from storage:', err);
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            localStorage.removeItem('refreshToken');
          }
        }
        
        setIsInitialized(true);
      } catch (err) {
        console.error('Auth initialization error:', err);
        setIsInitialized(true);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [refreshAccessToken]);

  const register = useCallback(async (username, email, password) => {
    try {
      setError(null);
      clearSessionUUID(); // Clear old session UUID before new login
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username,
        email,
        password,
      });
      
      // Auto-login after registration
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password,
      });

      const { access_token, token_type, refresh_token } = loginResponse.data;
      const fullToken = `${token_type} ${access_token}`;
      
      setToken(fullToken);
      
      // Store tokens
      localStorage.setItem('authToken', fullToken);
      if (refresh_token) {
        localStorage.setItem('refreshToken', refresh_token);
      }
      
      // Fetch user profile to get complete data
      try {
        await fetchUserProfile(fullToken);
      } catch (profileErr) {
        // Fallback if profile fetch fails
        const userData = {
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
        };
        setUser(userData);
        localStorage.setItem('authUser', JSON.stringify(userData));
        setUserProfileLoaded(true);
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchUserProfile]);

  const login = useCallback(async (username, password) => {
    try {
      setError(null);
      clearSessionUUID(); // Clear old session UUID before new login
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password,
      });

      const { access_token, token_type, refresh_token } = response.data;
      const fullToken = `${token_type} ${access_token}`;
      
      setToken(fullToken);
      
      // Store tokens
      localStorage.setItem('authToken', fullToken);
      if (refresh_token) {
        localStorage.setItem('refreshToken', refresh_token);
      }

      // Fetch user profile
      try {
        await fetchUserProfile(fullToken);
      } catch (profileErr) {
        console.error('Failed to fetch profile, continuing with basic auth');
        setUserProfileLoaded(true);
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchUserProfile]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    setUserProfileLoaded(false);
    clearSessionUUID(); // Clear session UUID on logout
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('refreshToken');
  }, []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated,
        isInitialized,
        userProfileLoaded,
        showProfileModal,
        setShowProfileModal,
        fetchUserProfile,
        refreshAccessToken,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
