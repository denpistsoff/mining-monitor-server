#!/bin/bash

set -e

echo "🚀 Запуск полного деплоя Mining Monitor..."

# Создание директорий
mkdir -p mining-monitor-fullstack/{server,frontend,nginx,deploy,logs}
cd mining-monitor-fullstack

# Копирование всех файлов (предполагается, что файлы уже в текущей директории)
cp -r ../server/* server/
cp -r ../frontend/* frontend/
cp ../nginx/nginx.conf nginx/
cp ../docker-compose.yml .

# Сборка фронтенда
echo "📦 Сборка фронтенда..."
cd frontend
npm install
npm run build
cd ..

# Запуск Docker Compose
echo "🐳 Запуск контейнеров..."
docker-compose up -d

echo "✅ Деплой завершен!"
echo "🌐 Приложение доступно по адресу: http://localhost"
echo "📊 API документация: http://localhost/api/docs"