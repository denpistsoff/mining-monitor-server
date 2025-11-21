import React from 'react';
import '../styles/components/Header.css';

const Header = ({ activeTab, onTabChange, farmName, onLogout, unreadAlertsCount = 0 }) => {
    const tabs = [
        { id: 'dashboard', label: 'ДАШБОРД' },
        { id: 'miners', label: 'АСИКИ' }
    ];

    const handleBack = () => {
        window.location.href = 'https://denpistsoff.github.io/mining-monitor-web/';
    };

    const handleAction = (action) => {
        alert(`Функция "${action}" в разработке`);
    };

    const handleAlertsClick = () => {
        onTabChange('alerts');
    };

    return (
        <header className="header">
            <div className="header-top">
                <div className="header-left">
                    <button className="back-button" onClick={handleBack}>
                        ← НАЗАД К ФЕРМАМ
                    </button>
                    <div className="header-title-section">
                        <h1 className="header-title">MINING MONITOR</h1>
                        <div className="farm-display">{farmName}</div>
                    </div>
                </div>

                <div className="header-controls">
                    <div className="action-buttons">
                        <button
                            className={`alerts-button ${unreadAlertsCount > 0 ? 'has-alerts' : ''}`}
                            onClick={handleAlertsClick}
                            title="Оповещения"
                        >
                            🔔
                            {unreadAlertsCount > 0 && (
                                <span className="alerts-badge">{unreadAlertsCount}</span>
                            )}
                        </button>

                        <button
                            className="action-btn small"
                            onClick={() => handleAction('Перезапуск')}
                            title="Перезапуск"
                        >
                            🔄
                        </button>
                        <button
                            className="action-btn small"
                            onClick={() => handleAction('Диагностика')}
                            title="Диагностика"
                        >
                            ⚡
                        </button>
                    </div>

                    <button className="logout-button" onClick={onLogout}>
                        ВЫХОД
                    </button>
                </div>
            </div>

            <nav className="header-nav">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        <span className="tab-text">{tab.label}</span>
                        <div className="tab-indicator"></div>
                    </button>
                ))}
            </nav>
        </header>
    );
};

export default Header;