#!/bin/bash
set -e

echo "🚀 БЫСТРЫЙ ДЕПЛОЙ MINING MONITOR..."

# Создаем директории
mkdir -p /opt/mining-monitor/{server,frontend,logs,ssl}

# Копируем файлы проекта
cd /opt/mining-monitor
git clone <https://github.com/denpistsoff/mining-monitor-server> .

# Устанавливаем Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Устанавливаем Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Настраиваем firewall
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable

# Собираем и запускаем
docker-compose up -d

echo "✅ Деплой завершен!"
echo "🌐 Сайт: http://$(curl -s ifconfig.me)"
echo "📊 API: http://$(curl -s ifconfig.me)/api/docs"