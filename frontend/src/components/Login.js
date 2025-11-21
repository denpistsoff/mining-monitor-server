// ВАШ СУЩЕСТВУЮЩИЙ КОД, только заменяем handleLogin

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // ДОБАВЛЯЕМ
import '../styles/components/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth(); // ИСПОЛЬЗУЕМ ХУК

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(username, password);

    if (!result.success) {
      setError(result.error);
    }

    setIsLoading(false);
  };

  // ВАШ СУЩЕСТВУЮЩИЙ JSX ОСТАЕТСЯ БЕЗ ИЗМЕНЕНИЙ!
  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <h1 className="login-title">MINING MONITOR</h1>
          <p className="login-subtitle">Система мониторинга майнинг ферм</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Логин"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'ВХОД...' : 'ВОЙТИ В СИСТЕМУ'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;