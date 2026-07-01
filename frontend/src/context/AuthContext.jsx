import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast Handler
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, 4000);
  };

  // Perform silent auth check on initial boot
  const checkAuth = async () => {
    try {
      const res = await api.get('/api/v1/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // User is not authenticated, fails silently
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Register action
  const register = async (username, email, password, role, humanCheck = {}) => {
    try {
      setLoading(true);
      const res = await api.post('/api/v1/auth/register', {
        username,
        email,
        password,
        role,
        ...humanCheck
      });
      if (res.data.success) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        showToast('Registration successful! Welcome.', 'success');
        return { success: true };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      const validationErrors = error.response?.data?.errors;
      
      if (validationErrors && validationErrors.length > 0) {
        validationErrors.forEach(err => showToast(err.message, 'error'));
      } else {
        showToast(errorMsg, 'error');
      }
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Login action
  const login = async (email, password, humanCheck = {}) => {
    try {
      setLoading(true);
      const res = await api.post('/api/v1/auth/login', {
        email,
        password,
        ...humanCheck
      });
      if (res.data.success) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        showToast('Logged in successfully!', 'success');
        return { success: true };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      showToast(errorMsg, 'error');
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout action
  const logout = async () => {
    try {
      setLoading(true);
      await api.post('/api/v1/auth/logout');
      setUser(null);
      setIsAuthenticated(false);
      showToast('Logged out successfully', 'info');
    } catch (error) {
      showToast('Logout failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        toasts,
        showToast,
        register,
        login,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
