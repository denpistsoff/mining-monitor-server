import React, { useState, useEffect } from 'react';
import '../styles/components/AlertsPanel.css';

const AlertsPanel = ({ farmNameProp, isOpen, onClose }) => {
    const [alerts, setAlerts] = useState([]);

    // Заглушка для оповещений
    useEffect(() => {
        // Временные данные для демонстрации
        const mockAlerts = [
            {
                id: 1,
                message: 'Высокая температура на майнере 192.168.80.59',
                severity: 'warning',
                timestamp: Date.now() - 3600000
            },
            {
                id: 2,
                message: 'Майнер 192.168.80.60 отключен',
                severity: 'critical',
                timestamp: Date.now() - 7200000
            },
            {
                id: 3,
                message: 'Низкий хешрейт на майнере 192.168.80.61',
                severity: 'warning',
                timestamp: Date.now() - 1800000
            }
        ];
        setAlerts(mockAlerts);
    }, [farmNameProp]);

    const getAlertIcon = (severity) => {
        switch (severity) {
            case 'critical': return '🔴';
            case 'warning': return '🟡';
            case 'info': return '🔵';
            default: return '⚪';
        }
    };

    const getSeverityText = (severity) => {
        switch (severity) {
            case 'critical': return 'КРИТИЧЕСКИЙ';
            case 'warning': return 'ПРЕДУПРЕЖДЕНИЕ';
            case 'info': return 'ИНФОРМАЦИЯ';
            default: return 'УВЕДОМЛЕНИЕ';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="alerts-overlay">
            <div className="alerts-panel">
                <div className="alerts-header">
                    <div className="alerts-title">
                        <span>ОПОВЕЩЕНИЯ - {farmNameProp}</span>
                        {alerts.length > 0 && (
                            <span className="alerts-count">{alerts.length}</span>
                        )}
                    </div>
                    <button className="alerts-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="alerts-content">
                    {alerts.length === 0 ? (
                        <div className="no-alerts">
                            <div className="no-alerts-icon">✅</div>
                            <span>НЕТ АКТИВНЫХ ОПОВЕЩЕНИЙ</span>
                            <p>Все системы работают в штатном режиме</p>
                        </div>
                    ) : (
                        <div className="alerts-list">
                            {alerts.map(alert => (
                                <div key={alert.id} className={`alert-item alert-${alert.severity}`}>
                                    <div className="alert-icon">
                                        {getAlertIcon(alert.severity)}
                                    </div>
                                    <div className="alert-content">
                                        <div className="alert-severity">
                                            {getSeverityText(alert.severity)}
                                        </div>
                                        <div className="alert-message">{alert.message}</div>
                                        <div className="alert-time">
                                            {new Date(alert.timestamp).toLocaleString('ru-RU')}
                                        </div>
                                    </div>
                                    <button
                                        className="alert-dismiss"
                                        onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                                        title="Отметить прочитанным"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="alerts-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => setAlerts([])}
                        disabled={alerts.length === 0}
                    >
                        ОЧИСТИТЬ ВСЕ
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        ЗАКРЫТЬ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertsPanel;