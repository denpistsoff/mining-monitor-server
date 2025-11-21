// Telegram Web App Integration
class MiningMonitorTelegramApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.isTelegram = !!this.tg;
        this.init();
    }

    init() {
        if (!this.isTelegram) {
            console.log('🌐 Режим браузера');
            return;
        }

        try {
            // Основные настройки
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            this.tg.setHeaderColor('#1a1a1a');
            this.tg.setBackgroundColor('#0f0f0f');
            
            // Применяем тему Telegram
            this.applyTheme();
            
            console.log('✅ Telegram Web App инициализирован');
            
        } catch (error) {
            console.error('Ошибка инициализации Telegram Web App:', error);
        }
    }

    applyTheme() {
        const theme = this.tg.themeParams;
        
        // Создаем CSS переменные для темы
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --tg-bg-color: ${theme.bg_color || '#0f0f0f'};
                --tg-section-bg: ${theme.secondary_bg_color || '#1a1a1a'};
                --tg-text-color: ${theme.text_color || '#ffffff'};
                --tg-hint-color: ${theme.hint_color || '#888888'};
                --tg-link-color: ${theme.link_color || '#3b82f6'};
                --tg-button-color: ${theme.button_color || '#3b82f6'};
                --tg-button-text-color: ${theme.button_text_color || '#ffffff'};
            }
        `;
        document.head.appendChild(style);
    }

    // Получить данные пользователя
    getUser() {
        return this.tg?.initDataUnsafe?.user;
    }

    // Отправить данные боту
    sendToBot(action, data = {}) {
        if (!this.isTelegram) return;

        const payload = {
            action: action,
            data: data,
            user: this.getUser(),
            timestamp: Date.now()
        };
        
        this.tg.sendData(JSON.stringify(payload));
    }

    // Настройка главной кнопки
    setupMainButton(text, onClick) {
        if (!this.isTelegram) return;

        this.tg.MainButton
            .setText(text)
            .show()
            .onClick(onClick);
    }

    // Показать уведомление
    showAlert(message) {
        if (this.isTelegram) {
            this.tg.showAlert(message);
        } else {
            alert(message);
        }
    }

    // Закрыть приложение
    close() {
        if (this.isTelegram) {
            this.tg.close();
        }
    }
}

// Глобальный экземпляр
const tgApp = new MiningMonitorTelegramApp();
window.tgApp = tgApp;