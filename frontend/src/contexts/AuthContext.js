import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { API_CONFIG } from '../App';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const login = async (username, password) => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/token`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token_expires', Date.now() + (data.expires_in * 1000));

        const userResponse = await fetch(`${API_CONFIG.BASE_URL}/auth/me`, {
          headers: getAuthHeaders()
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          setIsAuthenticated(true);
          return { success: true };
        }
      }

      return { success: false, error: 'Неверный логин или пароль' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Ошибка соединения с сервером' };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expires');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    const expires = localStorage.getItem('token_expires');

    if (!token || !expires || Date.now() > parseInt(expires)) {
      logout();
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/me`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    checkAuth,
    getAuthHeaders
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};