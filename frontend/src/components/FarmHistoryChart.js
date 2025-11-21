import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import FarmHistory from '../utils/farmHistory';
import '../styles/components/FarmHistoryChart.css';

// Регистрируем все компоненты Chart.js
Chart.register(...registerables);

const FarmHistoryChart = ({ historyData, timeRange, currentData }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        if (!historyData || !historyData.farm_history || historyData.farm_history.length === 0) {
            return;
        }

        const getTimeRangeHours = () => {
            switch (timeRange) {
                case '24h': return 24;
                case '48h': return 48;
                case '7d': return 168;
                default: return 24;
            }
        };

        const filteredData = FarmHistory.getLastNHours(historyData, getTimeRangeHours());

        if (filteredData.length === 0) {
            return;
        }

        const ctx = chartRef.current.getContext('2d');

        // Создаем градиент для заливки
        const gradientHashrate = ctx.createLinearGradient(0, 0, 0, 400);
        gradientHashrate.addColorStop(0, 'rgba(255, 140, 0, 0.3)');
        gradientHashrate.addColorStop(1, 'rgba(255, 140, 0, 0.05)');

        const gradientPower = ctx.createLinearGradient(0, 0, 0, 400);
        gradientPower.addColorStop(0, 'rgba(0, 170, 255, 0.3)');
        gradientPower.addColorStop(1, 'rgba(0, 170, 255, 0.05)');

        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: filteredData.map(entry =>
                    new Date(entry.timestamp).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit'
                    })
                ).reverse(),
                datasets: [
                    {
                        label: 'Хешрейт (TH/s)',
                        data: filteredData.map(entry => entry.total_hashrate).reverse(),
                        borderColor: '#ff8c00',
                        backgroundColor: gradientHashrate,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y',
                        pointBackgroundColor: '#ff8c00',
                        pointBorderColor: '#000',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                    {
                        label: 'Потребление (кВт)',
                        data: filteredData.map(entry => entry.total_power / 1000).reverse(),
                        borderColor: '#00aaff',
                        backgroundColor: gradientPower,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y1',
                        pointBackgroundColor: '#00aaff',
                        pointBorderColor: '#000',
                        pointBorderWidth: 2,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#ffffff',
                            font: {
                                size: 12,
                                family: "'Arial', sans-serif",
                                weight: 'bold'
                            },
                            usePointStyle: true,
                            padding: 20,
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 15, 10, 0.95)',
                        titleColor: '#ff8c00',
                        bodyColor: '#ffffff',
                        borderColor: '#ff8c00',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12,
                        usePointStyle: true,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    if (context.dataset.label.includes('Хешрейт')) {
                                        label += context.parsed.y.toFixed(2) + ' TH/s';
                                    } else {
                                        label += context.parsed.y.toFixed(1) + ' кВт';
                                    }
                                }
                                return label;
                            },
                            title: function(tooltipItems) {
                                const dataIndex = tooltipItems[0].dataIndex;
                                const originalIndex = filteredData.length - 1 - dataIndex;
                                const entry = filteredData[originalIndex];
                                return new Date(entry.timestamp).toLocaleString('ru-RU');
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 140, 0, 0.1)',
                            drawBorder: false,
                        },
                        ticks: {
                            color: '#a0a0a0',
                            maxTicksLimit: 8,
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: {
                            color: 'rgba(255, 140, 0, 0.1)',
                            drawBorder: false,
                        },
                        ticks: {
                            color: '#ff8c00',
                            callback: function(value) {
                                return value.toFixed(0) + ' TH/s';
                            },
                            font: {
                                size: 11,
                                weight: 'bold'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Хешрейт (TH/s)',
                            color: '#ff8c00',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            color: '#00aaff',
                            callback: function(value) {
                                return value.toFixed(0) + ' кВт';
                            },
                            font: {
                                size: 11,
                                weight: 'bold'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Потребление (кВт)',
                            color: '#00aaff',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    },
                },
                elements: {
                    point: {
                        hoverBackgroundColor: '#ffffff',
                        hoverBorderColor: '#000000',
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [historyData, timeRange]);

    if (!historyData || !historyData.farm_history || historyData.farm_history.length === 0) {
        return (
            <div className="history-chart-empty">
                <div className="empty-chart-message">
                    <p>📊 Исторические данные пока недоступны</p>
                    <span>Данные появятся после нескольких обновлений</span>
                </div>
            </div>
        );
    }

    const filteredData = FarmHistory.getLastNHours(historyData,
        timeRange === '24h' ? 24 : timeRange === '48h' ? 48 : 168
    );

    if (filteredData.length === 0) {
        return (
            <div className="history-chart-empty">
                <div className="empty-chart-message">
                    <p>⏰ Нет данных за выбранный период</p>
                    <span>Попробуйте выбрать другой временной диапазон</span>
                </div>
            </div>
        );
    }

    return (
        <div className="history-chart-container">
            <div className="chart-wrapper">
                <canvas ref={chartRef} />
            </div>

            {/* Мини-статистика текущих значений */}
            <div className="current-stats-mini">
                <div className="mini-stat">
                    <span className="mini-label">Текущий хешрейт:</span>
                    <span className="mini-value hashrate">
                        {currentData?.total_hashrate?.toFixed(2)} TH/s
                    </span>
                </div>
                <div className="mini-stat">
                    <span className="mini-label">Текущее потребление:</span>
                    <span className="mini-value power">
                        {(currentData?.total_power / 1000)?.toFixed(1)} кВт
                    </span>
                </div>
                <div className="mini-stat">
                    <span className="mini-label">Эффективность:</span>
                    <span className="mini-value efficiency">
                        {((currentData?.total_hashrate / (currentData?.total_power / 1000)) || 0).toFixed(2)} TH/кВт
                    </span>
                </div>
            </div>
        </div>
    );
};

export default FarmHistoryChart;