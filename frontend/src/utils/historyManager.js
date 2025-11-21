class HistoryManager {
    constructor() {
        this.historyKey = 'farm_history_data';
        this.maxEntries = 336;
        this.lastSaveTime = null;
        this.saveInterval = 30 * 60 * 1000;
        this.lastKnownStats = null;
    }

    initHistory() {
        let history = this.loadHistory();
        return history;
    }

    saveCurrentData(farmData) {
        const now = Date.now();

        if (farmData.summary && !farmData._isOfflineData) {
            this.lastKnownStats = {
                total_miners: farmData.summary.total_miners,
                total_containers: farmData.summary.total_containers,
                online_miners: farmData.summary.online_miners,
                problematic_miners: farmData.summary.problematic_miners
            };
        }

        if (this.lastSaveTime && (now - this.lastSaveTime < this.saveInterval)) {
            return this.loadHistory();
        }

        try {
            const history = this.loadHistory();
            const currentTime = new Date();

            const minutes = currentTime.getMinutes();
            const roundedMinutes = minutes < 30 ? 0 : 30;
            const timestamp = new Date(currentTime);
            timestamp.setMinutes(roundedMinutes, 0, 0);

            const isOffline = farmData._isOfflineData || farmData._dataStatus === 'offline';

            const newEntry = {
                timestamp: timestamp.toISOString(),
                date: timestamp.toLocaleDateString('ru-RU'),
                hour: timestamp.getHours(),
                minute: roundedMinutes,
                time_label: `${timestamp.getHours().toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`,
                total_hashrate: isOffline ? 0 : (farmData.summary?.total_hashrate || 0),
                total_power: isOffline ? 0 : (farmData.summary?.total_power || 0),
                online_miners: isOffline ? 0 : (farmData.summary?.online_miners || 0),
                problematic_count: isOffline ? (this.lastKnownStats?.problematic_miners || 0) : (farmData.summary?.problematic_miners || 0),
                total_miners: this.lastKnownStats?.total_miners || farmData.summary?.total_miners || 0,
                total_containers: this.lastKnownStats?.total_containers || farmData.summary?.total_containers || 0,
                efficiency: isOffline ? 0 : (farmData.summary?.total_hashrate ?
                    parseFloat((farmData.summary.total_hashrate / (farmData.summary.total_power / 1000)).toFixed(3)) : 0),
                is_offline: isOffline
            };

            const existingIndex = history.farm_history.findIndex(entry =>
                entry.time_label === newEntry.time_label &&
                entry.date === newEntry.date
            );

            if (existingIndex !== -1) {
                history.farm_history[existingIndex] = newEntry;
            } else {
                history.farm_history.unshift(newEntry);
            }

            history.farm_history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            if (history.farm_history.length > this.maxEntries) {
                history.farm_history = history.farm_history.slice(-this.maxEntries);
            }

            history.last_update = new Date().toISOString();
            this.saveToStorage(history);
            this.lastSaveTime = now;

            console.log(`💾 ${isOffline ? 'OFFLINE ' : ''}Сохранена запись в историю:`, {
                time: newEntry.time_label,
                hashrate: newEntry.total_hashrate,
                power: newEntry.total_power,
                miners: newEntry.total_miners,
                offline: newEntry.is_offline
            });

            return history;
        } catch (error) {
            console.error('Error saving history:', error);
            return this.loadHistory();
        }
    }

    loadHistory() {
        try {
            const stored = localStorage.getItem(this.historyKey);
            if (stored) {
                const history = JSON.parse(stored);
                if (history.farm_history && history.farm_history.length > 0) {
                    const lastGoodEntry = history.farm_history.find(entry => !entry.is_offline) ||
                        history.farm_history[history.farm_history.length - 1];
                    if (lastGoodEntry) {
                        this.lastKnownStats = {
                            total_miners: lastGoodEntry.total_miners,
                            total_containers: lastGoodEntry.total_containers,
                            online_miners: lastGoodEntry.online_miners,
                            problematic_miners: lastGoodEntry.problematic_count
                        };
                    }
                }
                return history;
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }

        return {
            farm_history: [],
            last_update: new Date().toISOString(),
            created_at: new Date().toISOString()
        };
    }

    saveToStorage(historyData) {
        try {
            localStorage.setItem(this.historyKey, JSON.stringify(historyData));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }

    clearHistory() {
        const emptyHistory = {
            farm_history: [],
            last_update: new Date().toISOString(),
            created_at: new Date().toISOString(),
            cleared_at: new Date().toISOString()
        };
        this.saveToStorage(emptyHistory);
        this.lastSaveTime = null;
        this.lastKnownStats = null;
        return emptyHistory;
    }

    getLastNHours(hours = 24) {
        const history = this.loadHistory();
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

        if (!history.farm_history || history.farm_history.length === 0) {
            return [];
        }

        const filtered = history.farm_history.filter(entry => {
            try {
                return new Date(entry.timestamp) >= cutoffTime;
            } catch {
                return false;
            }
        });

        return filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    getHistoryStats() {
        const history = this.loadHistory();
        const totalEntries = history.farm_history?.length || 0;
        const offlineEntries = history.farm_history?.filter(entry => entry.is_offline).length || 0;

        return {
            total_entries: totalEntries,
            offline_entries: offlineEntries,
            online_entries: totalEntries - offlineEntries,
            last_update: history.last_update,
            date_range: history.farm_history?.length > 0 ? {
                start: history.farm_history[0]?.timestamp,
                end: history.farm_history[history.farm_history.length - 1]?.timestamp
            } : null
        };
    }

    exportHistory() {
        const history = this.loadHistory();
        const dataStr = JSON.stringify(history, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `farm_history_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
}

const historyManager = new HistoryManager();
export default historyManager;