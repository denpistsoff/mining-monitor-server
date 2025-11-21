// ВАШ СУЩЕСТВУЮЩИЙ КОД ОСТАЕТСЯ ПРАКТИЧЕСКИ БЕЗ ИЗМЕНЕНИЙ!
// Только добавляем AuthProvider

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FarmSelection from './components/FarmSelection';
import FarmLayout from './components/FarmLayout';
import Login from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // ДОБАВЛЯЕМ
import './styles/dark-theme.css';
import './App.css';

// API configuration
export const API_CONFIG = {
  BASE_URL: window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : '/api',
  WS_URL: window.location.hostname === 'localhost'
    ? 'ws://localhost:8000/ws'
    : `wss://${window.location.host}/ws`
};

// Ваш существующий компонент AppContent остается БЕЗ ИЗМЕНЕНИЙ
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth(); // ИСПОЛЬЗУЕМ ХУК

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p style={{ color: '#ff8c00', marginTop: '16px' }}>Загрузка системы...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/"
          element={isAuthenticated ? <FarmSelection /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/farm/:farmName/*"
          element={isAuthenticated ? <FarmLayout /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// Оборачиваем в AuthProvider
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;