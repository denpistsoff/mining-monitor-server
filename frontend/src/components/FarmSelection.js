// ВАШ СУЩЕСТВУЮЩИЙ КОД, только заменяем загрузку данных

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../App';
import { useAuth } from '../contexts/AuthContext'; // ДОБАВЛЯЕМ
import '../styles/components/FarmSelection.css';

const FarmSelection = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth(); // ДОБАВЛЯЕМ

  const loadFarms = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/farms`, {
        headers: getAuthHeaders() // ИСПОЛЬЗУЕМ АВТОРИЗАЦИЮ
      });

      if (response.ok) {
        const farmsData = await response.json();
        setFarms(farmsData);
      } else {
        console.error('Failed to load farms');
      }
    } catch (error) {
      console.error('Error loading farms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
    const interval = setInterval(loadFarms, 60000);
    return () => clearInterval(interval);
  }, []);

  // ВАША СУЩЕСТВУЮЩАЯ ЛОГИКА ОСТАЕТСЯ БЕЗ ИЗМЕНЕНИЙ!
  const handleFarmClick = (farmName) => {
    navigate(`/farm/${farmName}/dashboard`);
  };

  const getStatusInfo = (farm) => {
    if (farm.status === 'online') {
      return { text: 'ОНЛАЙН', class: 'online', icon: '🟢' };
    } else if (farm.status === 'warning') {
      return { text: 'ПРОБЛЕМЫ', class: 'warning', icon: '🟡' };
    } else {
      return { text: 'ОФФЛАЙН', class: 'offline', icon: '🔴' };
    }
  };

  const formatHashrate = (hashrate) => {
    if (hashrate >= 1000) {
      return `${(hashrate / 1000).toFixed(1)} PH/s`;
    }
    return `${hashrate.toFixed(1)} TH/s`;
  };

  // ВАШ СУЩЕСТВУЮЩИЙ JSX ОСТАЕТСЯ БЕЗ ИЗМЕНЕНИЙ!
  return (
    <div className="farm-selection">
      <div className="hero-section">
        <h1 className="hero-title">MINING MONITOR</h1>
        <p className="hero-subtitle">СИСТЕМА МОНИТОРИНГА МАЙНИНГ ФЕРМ</p>
      </div>

      <div className="farms-grid">
        {farms.map(farm => {
          const status = getStatusInfo(farm);

          return (
            <div
              key={farm.name}
              className={`farm-card ${status.class}`}
              onClick={() => handleFarmClick(farm.name)}
            >
              <div className="farm-content">
                <div className="farm-header">
                  <div className="farm-icon">⚡</div>
                  <div className="farm-titles">
                    <h3 className="farm-name">{farm.name}</h3>
                    <div className="farm-display-name">{farm.display_name}</div>
                  </div>
                  <div className="status-icon">{status.icon}</div>
                </div>

                <div className={`status-indicator ${status.class}`}>
                  <span className="status-text">{status.text}</span>
                </div>

                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-value">{farm.stats.online_miners}/{farm.stats.total_miners}</div>
                    <div className="stat-label">МАЙНЕРЫ</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{formatHashrate(farm.stats.total_hashrate)}</div>
                    <div className="stat-label">ХЕШРЕЙТ</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{farm.stats.total_containers}</div>
                    <div className="stat-label">КОНТЕЙНЕРЫ</div>
                  </div>
                </div>

                <button className="action-button">
                  ОТКРЫТЬ ДАШБОРД
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="control-panel">
        <button
          className={`refresh-button ${loading ? 'loading' : ''}`}
          onClick={loadFarms}
          disabled={loading}
        >
          {loading ? 'ОБНОВЛЕНИЕ...' : '🔄 ОБНОВИТЬ'}
        </button>
      </div>
    </div>
  );
};

export default FarmSelection;