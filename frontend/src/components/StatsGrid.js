import React from 'react';
import '../styles/components/StatsGrid.css';

const StatsGrid = ({ summary }) => {
    const stats = [
        {
            title: 'КОНТЕЙНЕРЫ',
            value: summary?.total_containers || 0,
            color: 'primary'
        },
        {
            title: 'МАЙНЕРЫ',
            value: `${summary?.online_miners || 0}/${summary?.total_miners || 0}`,
            color: 'secondary'
        },
        {
            title: 'ХЕШРЕЙТ',
            value: `${(summary?.total_hashrate || 0).toLocaleString('ru-RU')} TH/S`,
            color: 'accent'
        },
        {
            title: 'МОЩНОСТЬ',
            value: `${(summary?.total_power || 0).toLocaleString('ru-RU')} ВТ`,
            color: 'warning'
        }
    ];

    return (
        <div className="stats-grid">
            {stats.map((stat, index) => (
                <div key={index} className={`stat-card stat-${stat.color}`}>
                    <div className="stat-content">
                        <div className="stat-title">{stat.title}</div>
                        <div className="stat-value">{stat.value}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsGrid;