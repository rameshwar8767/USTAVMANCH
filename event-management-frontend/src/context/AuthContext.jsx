import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    validateToken();
  }, []);

  const validateToken = async () => {
    try {
      // Check if token exists in localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      const response = await api.get('/validate');
      if (response.data && response.data.user) {
        setUser(response.data.user);
      } else {
        // If validation fails, clear the token
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Token validation error:', error);
      // If validation fails, clear the token
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      if (response.data && response.data.user) {
        setUser(response.data.user);
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/register', userData);
      if (response.data && response.data.user) {
        setUser(response.data.user);
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const updateUser = (userData) => {
    if (userData && userData.user) {
      setUser(userData.user);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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

export default AuthContext;
