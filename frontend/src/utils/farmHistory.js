// utils/farmHistory.js
class FarmHistory {
    constructor() {
        this.historyFile = 'farm_history.json';
        this.maxEntries = 336; // 14 дней * 24 часа (увеличил для большего охвата)
        this.historyData = null;
    }

    // Инициализация истории
    initHistory() {
        if (!this.historyData) {
            this.historyData = this.loadFromLocalStorage();
        }
        return this.historyData;
    }

    // Загрузить из localStorage
    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem(this.historyFile);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Error loading history from localStorage:', error);
        }
        return this.getDefaultHistory();
    }

    // Сохранить в localStorage
    saveToLocalStorage(historyData) {
        try {
            localStorage.setItem(this.historyFile, JSON.stringify(historyData));
        } catch (error) {
            console.warn('Error saving history to localStorage:', error);
        }
    }

    // Сохранить текущие данные (только если данные свежие)
    saveCurrentData(farmData) {
        try {
            // Не сохраняем offline данные в историю
            if (farmData._isOfflineData || farmData._dataStatus === 'offline') {
                console.log('🔄 Пропускаем сохранение offline данных в историю');
                return this.historyData;
            }

            const history = this.historyData || this.getDefaultHistory();
            const newEntry = {
                timestamp: new Date().toISOString(),
                time_label: new Date().toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                total_hashrate: farmData.summary?.total_hashrate || 0,
                total_power: farmData.summary?.total_power || 0,
                online_miners: farmData.summary?.online_miners || 0,
                problematic_miners: farmData.summary?.problematic_miners || 0,
                efficiency: farmData.summary?.total_hashrate && farmData.summary.total_power ?
                    (farmData.summary.total_hashrate / (farmData.summary.total_power / 1000)) : 0
            };

            // Проверяем, не дублируем ли мы запись (за последние 25 минут)
            const lastEntry = history.farm_history[0];
            if (lastEntry) {
                const lastTime = new Date(lastEntry.timestamp);
                const currentTime = new Date();
                const diffMinutes = (currentTime - lastTime) / (1000 * 60);

                if (diffMinutes < 25) {
                    console.log('🔄 Пропускаем дублирующую запись в историю');
                    return history;
                }
            }

            // Добавляем новую запись в начало
            history.farm_history.unshift(newEntry);

            // Ограничиваем количество записей
            if (history.farm_history.length > this.maxEntries) {
                history.farm_history = history.farm_history.slice(0, this.maxEntries);
            }

            // Сохраняем в localStorage
            this.saveToLocalStorage(history);
            this.historyData = history;

            console.log('💾 Сохранена новая запись в историю:', newEntry);
            return history;

        } catch (error) {
            console.error('Error saving history:', error);
            return this.historyData || this.getDefaultHistory();
        }
    }

    getDefaultHistory() {
        return {
            farm_history: []
        };
    }

    // Получить данные за последние N часов
    getLastNHours(hours = 24) {
        const history = this.historyData || this.getDefaultHistory();

        if (!history || !history.farm_history || history.farm_history.length === 0) {
            return [];
        }

        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        return history.farm_history.filter(entry => {
            try {
                return new Date(entry.timestamp) >= cutoffTime;
            } catch {
                return false;
            }
        });
    }

    // Получить статистику истории
    getHistoryStats() {
        const history = this.historyData || this.getDefaultHistory();
        const total_entries = history.farm_history ? history.farm_history.length : 0;

        return {
            total_entries,
            first_entry: history.farm_history?.[total_entries - 1]?.timestamp || null,
            last_entry: history.farm_history?.[0]?.timestamp || null
        };
    }

    // Очистить историю
    clearHistory() {
        const clearedHistory = this.getDefaultHistory();
        this.historyData = clearedHistory;
        this.saveToLocalStorage(clearedHistory);
        console.log('🗑️ История очищена');
        return clearedHistory;
    }

    // Экспорт истории
    exportHistory() {
        const history = this.historyData || this.getDefaultHistory();
        const dataStr = JSON.stringify(history, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `farm_history_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('📥 История экспортирована');
    }
}

export default new FarmHistory();