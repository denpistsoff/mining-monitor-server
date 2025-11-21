// Вспомогательные функции для приложения

// Форматирование чисел
export const formatNumber = (num, decimals = 2) => {
    if (!num && num !== 0) return 'N/A';
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
};

// Форматирование времени
export const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString('ru-RU');
};

export const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('ru-RU');
};

export const timeAgo = (timestamp) => {
    if (!timestamp) return 'неизвестно';
    
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    const intervals = {
        год: 31536000,
        месяц: 2592000,
        неделя: 604800,
        день: 86400,
        час: 3600,
        минуту: 60,
        секунду: 1
    };
    
    for (const [name, secondsIn] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsIn);
        if (interval >= 1) {
            return `${interval} ${name}${interval > 1 ? (name === 'неделя' ? 'ель' : (name === 'минуту' ? 'ы' : 'а')) : ''} назад`;
        }
    }
    
    return 'только что';
};

// Валидация IP адреса
export const isValidIP = (ip) => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;
    
    return ip.split('.').every(segment => {
        const num = parseInt(segment, 10);
        return num >= 0 && num <= 255;
    });
};

// Генерация случайного цвета
export const generateColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
};

// Дебаунс функция
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Локализация статусов
export const localizeStatus = (status) => {
    const statusMap = {
        'online': 'Онлайн',
        'offline': 'Офлайн',
        'problematic': 'Проблемы',
        'warning': 'Предупреждение',
        'critical': 'Критично',
        'pending': 'Ожидание'
    };
    
    return statusMap[status] || status;
};

// Расчет эффективности
export const calculateProfitability = (hashrate, power, electricityCost = 0.05) => {
    // Упрощенный расчет (замени на реальные данные)
    const dailyRevenue = hashrate * 0.0001; // Упрощенная формула
    const dailyCost = (power * 24 * electricityCost) / 1000;
    return dailyRevenue - dailyCost;
};