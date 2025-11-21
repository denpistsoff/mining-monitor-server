// ЗАМЕНЯЕМ ваш текущий useFarmData.js на эту версию для работы с API

import { useState, useEffect, useRef } from 'react';
import { API_CONFIG } from '../App';
import { useAuth } from '../contexts/AuthContext';

export const useFarmData = (farmNameProp) => {
  const [farmData, setFarmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataStatus, setDataStatus] = useState('fresh');
  const wsRef = useRef(null);
  const { getAuthHeaders, isAuthenticated } = useAuth();

  const loadData = async (force = false) => {
    if (!farmNameProp || !isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/farms/${farmNameProp}/data`,
        {
          headers: getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status}`);
      }

      const data = await response.json();

      // Сохраняем вашу существующую логику проверки свежести
      const checkDataFreshness = (data) => {
        if (!data.last_update) return 'offline';

        const updateTime = new Date(data.last_update);
        const now = new Date();
        const diffMinutes = (now - updateTime) / (1000 * 60);

        if (diffMinutes > 30) return 'offline';
        if (diffMinutes > 5) return 'stale';
        return 'fresh';
      };

      const freshness = checkDataFreshness(data);
      setDataStatus(freshness);
      setFarmData({ ...data, _dataStatus: freshness });

    } catch (err) {
      console.error('Ошибка загрузки данных фермы:', err);
      setError(err.message);
      setDataStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    if (!farmNameProp || !isAuthenticated || wsRef.current) return;

    const token = localStorage.getItem('access_token');
    const wsUrl = `${API_CONFIG.WS_URL}/farms/${farmNameProp}?token=${token}`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log(`WebSocket connected for farm: ${farmNameProp}`);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'farm_update') {
          setFarmData(prev => ({
            ...prev,
            ...message.data,
            _dataStatus: 'fresh'
          }));
        } else if (message.type === 'alert') {
          // Обработка оповещений
          console.log('New alert:', message.alert);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      wsRef.current = null;
      setTimeout(connectWebSocket, 5000);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  useEffect(() => {
    if (farmNameProp && isAuthenticated) {
      loadData(true);
      connectWebSocket();

      const interval = setInterval(loadData, 60000);

      return () => {
        clearInterval(interval);
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      };
    }
  }, [farmNameProp, isAuthenticated]);

  const refresh = () => {
    loadData(true);
  };

  return {
    farmData,
    loading,
    error,
    refresh,
    dataStatus
  };
};