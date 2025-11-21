import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off, set } from 'firebase/database';

// Конфигурация Firebase
const firebaseConfig = {
    databaseURL: 'https://mining-monitor-api-default-rtdb.firebaseio.com/'
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

export class MiningMonitorAPI {
    constructor(farmName) {
        this.farmName = farmName;
        this.listeners = new Map();
    }

    // Реальная подписка на данные фермы
    subscribeToFarmData(callback) {
        const farmRef = ref(database, `farms/${this.farmName}`);
        
        const unsubscribe = onValue(farmRef, (snapshot) => {
            const data = snapshot.val();
            callback(data);
        }, (error) => {
            console.error('Ошибка подписки на данные фермы:', error);
        });

        this.listeners.set('farmData', unsubscribe);
        return unsubscribe;
    }

    // Подписка на данные майнеров
    subscribeToMiners(callback) {
        const minersRef = ref(database, `miners/${this.farmName}`);
        
        const unsubscribe = onValue(minersRef, (snapshot) => {
            const data = snapshot.val();
            callback(data);
        }, (error) => {
            console.error('Ошибка подписки на данные майнеров:', error);
        });

        this.listeners.set('miners', unsubscribe);
        return unsubscribe;
    }

    // Подписка на оповещения
    subscribeToAlerts(callback) {
        const alertsRef = ref(database, `alerts/${this.farmName}`);
        
        const unsubscribe = onValue(alertsRef, (snapshot) => {
            const data = snapshot.val();
            callback(data || {});
        }, (error) => {
            console.error('Ошибка подписки на оповещения:', error);
        });

        this.listeners.set('alerts', unsubscribe);
        return unsubscribe;
    }

    // Отметить оповещение как прочитанное
    markAlertRead(alertId) {
        const alertRef = ref(database, `alerts/${this.farmName}/${alertId}/read`);
        set(alertRef, true).catch(error => {
            console.error('Ошибка отметки оповещения:', error);
        });
    }

    // Отправить команду майнеру
    sendMinerCommand(minerIp, command) {
        const commandRef = ref(database, `commands/${this.farmName}/${minerIp}`);
        return set(commandRef, {
            command: command,
            timestamp: Date.now(),
            status: 'pending'
        });
    }

    // Отписаться от всех обновлений
    unsubscribeAll() {
        this.listeners.forEach((unsubscribe, key) => {
            unsubscribe();
            console.log(`Отписались от: ${key}`);
        });
        this.listeners.clear();
    }

    // Получить историю данных
    getHistoricalData(days = 7) {
        // Здесь можно добавить логику для получения исторических данных
        return new Promise((resolve) => {
            resolve([]);
        });
    }
}

// Вспомогательные функции
export const formatHashrate = (hashrate) => {
    if (!hashrate) return '0 TH/s';
    
    if (hashrate >= 1000) {
        return `${(hashrate / 1000).toFixed(2)} PH/s`;
    }
    return `${hashrate.toFixed(2)} TH/s`;
};

export const formatPower = (power) => {
    if (!power) return '0 Вт';
    
    if (power >= 1000) {
        return `${(power / 1000).toFixed(1)} кВт`;
    }
    return `${power} Вт`;
};

export const calculateEfficiency = (hashrate, power) => {
    if (!hashrate || !power || power === 0) return 0;
    return (hashrate / power) * 1000; // J/TH
};

export const getStatusColor = (status) => {
    const colors = {
        online: '#10b981',
        offline: '#ef4444',
        problematic: '#f59e0b',
        warning: '#f59e0b',
        critical: '#dc2626'
    };
    return colors[status] || '#6b7280';
};