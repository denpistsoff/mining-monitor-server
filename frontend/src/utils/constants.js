// Константы приложения

export const MINER_TYPES = {
    antminer: {
        name: 'Antminer',
        icon: '⚡',
        color: '#3b82f6'
    },
    whatsminer: {
        name: 'Whatsminer',
        icon: '🔧',
        color: '#10b981'
    },
    unknown: {
        name: 'Неизвестно',
        icon: '❓',
        color: '#6b7280'
    }
};

export const ALERT_TYPES = {
    temperature: {
        name: 'Температура',
        icon: '🌡️',
        severity: 'warning'
    },
    hashrate: {
        name: 'Хешрейт',
        icon: '📉',
        severity: 'warning'
    },
    offline: {
        name: 'Офлайн',
        icon: '🔴',
        severity: 'critical'
    },
    power: {
        name: 'Питание',
        icon: '🔌',
        severity: 'warning'
    },
    fan: {
        name: 'Вентилятор',
        icon: '💨',
        severity: 'warning'
    }
};

export const STATUS_COLORS = {
    online: '#10b981',
    offline: '#ef4444',
    problematic: '#f59e0b',
    warning: '#f59e0b',
    critical: '#dc2626',
    unknown: '#6b7280'
};

export const DEFAULT_SETTINGS = {
    refreshInterval: 30000,
    theme: 'dark',
    language: 'ru',
    notifications: true,
    soundAlerts: false,
    autoRefresh: true
};

export const POOL_NAMES = {
    'antpool.com': 'AntPool',
    'f2pool.com': 'F2Pool',
    'poolin.com': 'Poolin',
    'viabtc.com': 'ViaBTC',
    'btc.com': 'BTC.com',
    'binance.com': 'Binance Pool'
};