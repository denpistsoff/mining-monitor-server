import React, { useState, useMemo } from 'react';
import { useFarmData } from '../hooks/useFarmData';
import MinerCard from './MinerCard';
import '../styles/components/MinerView.css';

const MinersView = ({ farmNameProp }) => {
    const { farmData, loading, error } = useFarmData(farmNameProp);
    const [selectedContainer, setSelectedContainer] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [cardSize, setCardSize] = useState('medium'); // 'small', 'medium', 'large'

    // Сбор всех майнеров из всех контейнеров
    const allMiners = useMemo(() => {
        if (!farmData?.containers) return [];

        const miners = [];
        Object.entries(farmData.containers).forEach(([containerId, container]) => {
            Object.entries(container.miners || {}).forEach(([minerIp, miner]) => {
                miners.push({
                    ...miner,
                    containerId,
                    ip: minerIp
                });
            });
        });
        return miners;
    }, [farmData]);

    // Фильтрация майнеров
    const filteredMiners = useMemo(() => {
        return allMiners.filter(miner => {
            const containerMatch = selectedContainer === 'all' || miner.containerId === selectedContainer;
            const statusMatch = selectedStatus === 'all' || miner.status === selectedStatus;
            return containerMatch && statusMatch;
        });
    }, [allMiners, selectedContainer, selectedStatus]);

    // Статистика для отображения
    const stats = useMemo(() => {
        const online = allMiners.filter(m => m.status === 'online' || m.status === 'problematic' ).length;
        const problematic = allMiners.filter(m => m.status === 'problematic').length;
        const offline = allMiners.filter(m => m.status === 'offline').length;
        const total = allMiners.length;

        return { online, problematic, offline, total };
    }, [allMiners]);

    // Уникальные контейнеры для фильтра
    const containers = useMemo(() => {
        const uniqueContainers = [...new Set(allMiners.map(m => m.containerId))];
        return ['all', ...uniqueContainers];
    }, [allMiners]);

    const handleMassRestart = () => {
        alert('Функция "Массовый перезапуск" в разработке');
    };

    const handleRefreshData = () => {
        alert('обновляю...');
    };

    if (loading) {
        return (
            <div className="miners-view">
                <div className="dashboard-loading">
                    <div className="loading-spinner large"></div>
                    <p>ЗАГРУЗКА ДАННЫХ АСИКОВ</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="miners-view">
                <div className="dashboard-error">
                    <div className="error-title">ОШИБКА ЗАГРУЗКИ АСИКОВ</div>
                    <div className="error-message">{error}</div>
                    <button className="retry-button" onClick={() => window.location.reload()}>
                        ПОВТОРИТЬ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="miners-view">
            <div className="miners-header">
                <h1>МОНИТОРИНГ АСИКОВ - {farmNameProp}</h1>
                <div className="miners-stats">
                    <div className="stat-item online">
                        ОНЛАЙН: <strong>{stats.online}</strong>
                    </div>
                    <div className="stat-item problematic">
                        ПРОБЛЕМЫ: <strong>{stats.problematic}</strong>
                    </div>
                    <div className="stat-item offline">
                        ОФФЛАЙН: <strong>{stats.offline}</strong>
                    </div>
                    <div className="stat-item">
                        ВСЕГО: <strong>{stats.total}</strong>
                    </div>
                </div>
            </div>

            <div className="filters-panel">
                <div className="container-filter">
                    <label>КОНТЕЙНЕР:</label>
                    <select
                        value={selectedContainer}
                        onChange={(e) => setSelectedContainer(e.target.value)}
                    >
                        {containers.map(container => (
                            <option key={container} value={container}>
                                {container === 'all' ? 'ВСЕ КОНТЕЙНЕРЫ' : container}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="tab-buttons">
                    <button
                        className={`tab-btn ${selectedStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedStatus('all')}
                    >
                        ВСЕ АСИКИ ({stats.total})
                    </button>
                    <button
                        className={`tab-btn ${selectedStatus === 'online' ? 'active' : ''}`}
                        onClick={() => setSelectedStatus('online')}
                    >
                        ОНЛАЙН ({stats.online})
                    </button>
                    <button
                        className={`tab-btn ${selectedStatus === 'problematic' ? 'active' : ''}`}
                        onClick={() => setSelectedStatus('problematic')}
                    >
                        ПРОБЛЕМЫ ({stats.problematic})
                    </button>
                    <button
                        className={`tab-btn ${selectedStatus === 'offline' ? 'active' : ''}`}
                        onClick={() => setSelectedStatus('offline')}
                    >
                        ОФФЛАЙН ({stats.offline})
                    </button>
                </div>

                <div className="size-controls">
                    <label>РАЗМЕР КАРТОЧЕК:</label>
                    <div className="size-buttons">
                        <button
                            className={`size-btn ${cardSize === 'small' ? 'active' : ''}`}
                            onClick={() => setCardSize('small')}
                            title="Компактный вид"
                        >
                            🔘 Маленький
                        </button>
                        <button
                            className={`size-btn ${cardSize === 'medium' ? 'active' : ''}`}
                            onClick={() => setCardSize('medium')}
                            title="Стандартный вид"
                        >
                            🔘🔘 Средний
                        </button>
                        <button
                            className={`size-btn ${cardSize === 'large' ? 'active' : ''}`}
                            onClick={() => setCardSize('large')}
                            title="Подробный вид"
                        >
                            🔘🔘🔘 Большой
                        </button>
                    </div>
                </div>
            </div>

            <div className="actions-panel">
                <button className="action-btn primary" onClick={handleRefreshData}>
                    ОБНОВИТЬ ДАННЫЕ
                </button>
                <button className="action-btn warning" onClick={handleMassRestart}>
                    МАССОВЫЙ ПЕРЕЗАПУСК
                </button>
            </div>

            <div className="miners-grid">
                {filteredMiners.length === 0 ? (
                    <div className="no-miners-message">
                        <h3>АСИКИ НЕ НАЙДЕНЫ</h3>
                        <p>Попробуйте изменить параметры фильтрации</p>
                    </div>
                ) : (
                    filteredMiners.map(miner => (
                        <MinerCard
                            key={miner.ip}
                            miner={miner}
                            showContainer={selectedContainer === 'all'}
                            size={cardSize}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default MinersView;