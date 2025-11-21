import React, { useState } from 'react';
import '../styles/components/MinerCard.css';

const MinerCard = ({ miner, showContainer = false, size = 'medium' }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        ip,
        type,
        hashrate,
        temperature,
        power,
        pool,
        status,
        problem_reason,
        containerId,
        algorithm,
        fans,
        uptime
    } = miner;

    const getStatusInfo = () => {
        switch (status) {
            case 'online': return { text: 'ОНЛАЙН', class: 'online', color: '#10b981' };
            case 'offline': return { text: 'ОФФЛАЙН', class: 'offline', color: '#ef4444' };
            case 'problematic': return { text: 'ПРОБЛЕМЫ', class: 'problematic', color: '#f59e0b' };
            default: return { text: 'НЕИЗВЕСТНО', class: 'unknown', color: '#6b7280' };
        }
    };

    const statusInfo = getStatusInfo();

    const renderSmallCard = () => (
        <div className="miner-stats compact">
            <div className="stat-row">
                <div className="stat-item">
                    <span className="stat-value">
                        {hashrate ? `${hashrate.toFixed(1)}T` : 'N/A'}
                    </span>
                    <span className="stat-label">ХЕШ</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">
                        {temperature ? `${temperature}°` : 'N/A'}
                    </span>
                    <span className="stat-label">ТЕМП</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">
                        {power ? `${power}W` : 'N/A'}
                    </span>
                    <span className="stat-label">ПИТ</span>
                </div>
            </div>
        </div>
    );

    const renderMediumCard = () => (
        <div className="miner-stats">
            <div className="stat-row">
                <div className="stat-item">
                    <span className="stat-label">ХЕШРЕЙТ</span>
                    <span className="stat-value">
                        {hashrate ? `${hashrate.toFixed(2)} TH/S` : 'N/A'}
                    </span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">ТЕМПЕРАТУРА</span>
                    <span className="stat-value">
                        {temperature ? `${temperature}°C` : 'N/A'}
                    </span>
                </div>
            </div>
            <div className="stat-row">
                <div className="stat-item">
                    <span className="stat-label">ПИТАНИЕ</span>
                    <span className="stat-value">
                        {power ? `${power} ВТ` : 'N/A'}
                    </span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">АЛГОРИТМ</span>
                    <span className="stat-value">
                        {algorithm || 'SHA-256'}
                    </span>
                </div>
            </div>
        </div>
    );

    const renderLargeCard = () => (
        <div className="miner-stats detailed">
            <div className="stat-row">
                <div className="stat-item">
                    <span className="stat-label">ХЕШРЕЙТ</span>
                    <span className="stat-value">
                        {hashrate ? `${hashrate.toFixed(2)} TH/S` : 'N/A'}
                    </span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">ТЕМПЕРАТУРА</span>
                    <span className="stat-value">
                        {temperature ? `${temperature}°C` : 'N/A'}
                    </span>
                </div>
            </div>
            <div className="stat-row">
                <div className="stat-item">
                    <span className="stat-label">ПИТАНИЕ</span>
                    <span className="stat-value">
                        {power ? `${power} ВТ` : 'N/A'}
                    </span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">АЛГОРИТМ</span>
                    <span className="stat-value">
                        {algorithm || 'SHA-256'}
                    </span>
                </div>
            </div>
            <div className="stat-row">
                <div className="stat-item">
                    <span className="stat-label">ВЕНТИЛЯТОРЫ</span>
                    <span className="stat-value">
                        {fans ? `${fans} RPM` : 'N/A'}
                    </span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">ПУЛ</span>
                    <span className="stat-value pool" title={pool}>
                        {pool ? (pool.length > 15 ? `${pool.substring(0, 15)}...` : pool) : 'N/A'}
                    </span>
                </div>
            </div>
        </div>
    );

    const renderStats = () => {
        switch (size) {
            case 'small': return renderSmallCard();
            case 'medium': return renderMediumCard();
            case 'large': return renderLargeCard();
            default: return renderMediumCard();
        }
    };

    return (
        <div className={`miner-card miner-${statusInfo.class} size-${size}`}>
            <div className="miner-header">
                <div className="miner-identity">
                    <div
                        className="miner-icon"
                        style={{ backgroundColor: statusInfo.color }}
                    >
                        {type === 'antminer' ? 'A' :
                            type === 'whatsminer' ? 'W' :
                                type === 'avalon' ? 'V' : 'M'}
                    </div>
                    <div className="miner-info">
                        <div className="miner-ip">{ip}</div>
                        {size !== 'small' && (
                            <div className="miner-meta">
                                <span className="miner-type">{type || 'UNKNOWN'}</span>
                                {showContainer && containerId && size !== 'small' && (
                                    <span className="miner-container">КОНТЕЙНЕР: {containerId}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="miner-status">
                    <span
                        className={`status-indicator ${statusInfo.class}`}
                        style={{ color: statusInfo.color }}
                        title={statusInfo.text}
                    >
                        {size === 'small' ? '●' : statusInfo.text}
                    </span>
                </div>
            </div>

            {renderStats()}

            {problem_reason && size !== 'small' && (
                <div className="miner-problem">
                    <div className="problem-icon">⚠</div>
                    <div className="problem-text">
                        <strong>ПРОБЛЕМА:</strong> {problem_reason}
                    </div>
                </div>
            )}

            {size !== 'small' && (
                <div className="miner-actions">
                    <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? 'СКРЫТЬ' : 'ПОДРОБНО'}
                    </button>
                </div>
            )}

            {isExpanded && size !== 'small' && (
                <div className="miner-details">
                    <div className="detail-section">
                        <h4>ДЕТАЛЬНАЯ ИНФОРМАЦИЯ</h4>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <span>IP АДРЕС:</span>
                                <strong>{ip}</strong>
                            </div>
                            <div className="detail-item">
                                <span>ТИП:</span>
                                <strong>{type || 'UNKNOWN'}</strong>
                            </div>
                            <div className="detail-item">
                                <span>СТАТУС:</span>
                                <strong className={`status-${statusInfo.class}`}>
                                    {statusInfo.text}
                                </strong>
                            </div>
                            {containerId && (
                                <div className="detail-item">
                                    <span>КОНТЕЙНЕР:</span>
                                    <strong>{containerId}</strong>
                                </div>
                            )}
                            {algorithm && (
                                <div className="detail-item">
                                    <span>АЛГОРИТМ:</span>
                                    <strong>{algorithm}</strong>
                                </div>
                            )}
                            {pool && (
                                <div className="detail-item full-width">
                                    <span>ПУЛ:</span>
                                    <strong>{pool}</strong>
                                </div>
                            )}
                            {uptime && (
                                <div className="detail-item">
                                    <span>UPTIME:</span>
                                    <strong>{uptime}</strong>
                                </div>
                            )}
                            {problem_reason && (
                                <div className="detail-item full-width">
                                    <span>ПРОБЛЕМА:</span>
                                    <strong className="problem">{problem_reason}</strong>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MinerCard;