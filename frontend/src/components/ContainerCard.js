import React, { useState } from 'react';
import MinerCard from './MinerCard';
import '../styles/components/ContainerCard.css';

const ContainerCard = ({ containerId, container }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const { stats, miners } = container;

    const onlineCount = stats?.online_miners || 0;
    const offlineCount = stats?.offline_miners || 0;
    const problematicCount = stats?.problematic_miners || 0;

    return (
        <div className="container-card">
            <div
                className="container-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="container-info">
                    <h3 className="container-title">КОНТЕЙНЕР {containerId}</h3>
                    <div className="container-stats">
                        <span className="stat-badge online">
                            ОНЛАЙН: {onlineCount}
                        </span>
                        <span className="stat-badge offline">
                            ОФФЛАЙН: {offlineCount}
                        </span>
                        <span className="stat-badge problematic">
                            ПРОБЛЕМЫ: {problematicCount}
                        </span>
                    </div>
                </div>

                <div className="container-summary">
                    <div className="hashrate">
                        <strong>{stats?.total_hashrate?.toFixed(2) || 0} TH/S</strong>
                    </div>
                    <div className="power">
                        {stats?.total_power || 0} ВТ
                    </div>
                    <button className="expand-btn">
                        {isExpanded ? '▲' : '▼'}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="container-content">
                    <div className="miners-list">
                        {miners?.map((miner, index) => (
                            <MinerCard
                                key={`${miner.ip}-${index}`}
                                miner={miner}
                                showContainer={false}
                            />
                        ))}
                    </div>

                    {(!miners || miners.length === 0) && (
                        <div className="no-miners">
                            НЕТ МАЙНЕРОВ В КОНТЕЙНЕРЕ
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ContainerCard;