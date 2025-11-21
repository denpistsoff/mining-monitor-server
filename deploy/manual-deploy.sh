#!/bin/bash
set -e

echo "🚀 РУЧНОЙ ДЕПЛОЙ MINING MONITOR..."

# Создаем структуру
mkdir -p /opt/mining-monitor/{server,frontend,nginx,deploy,logs,ssl}
cd /opt/mining-monitor

# Устанавливаем Docker
if ! command -v docker &> /dev/null; then
    echo "📦 Устанавливаем Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
fi

# Устанавливаем Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Устанавливаем Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Создаем базовые файлы если их нет
if [ ! -f "docker-compose.yml" ]; then
    echo "📁 Создаем docker-compose.yml..."
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: mining_monitor
      POSTGRES_USER: mining_user
      POSTGRES_PASSWORD: secure_password123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - mining-network

  redis:
    image: redis:7-alpine
    networks:
      - mining-network

  api:
    build: ./server
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://mining_user:secure_password123@postgres/mining_monitor
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=your-super-secret-key-change-in-production-$(openssl rand -hex 32)
    depends_on:
      - postgres
      - redis
    networks:
      - mining-network
    volumes:
      - ./logs:/app/logs

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
      - ./frontend/build:/var/www/html
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    networks:
      - mining-network

volumes:
  postgres_data:

networks:
  mining-network:
    driver: bridge
EOF
fi

# Создаем nginx конфиг
mkdir -p nginx
cat > nginx/nginx.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public";
    }

    # API proxy
    location /api/ {
        proxy_pass http://api:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # WebSocket proxy
    location /ws/ {
        proxy_pass http://api:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # Static files
    location /static/ {
        alias /var/www/html/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Настраиваем firewall
echo "🔒 Настраиваем firewall..."
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable

echo "✅ Базовая настройка завершена!"
echo "📝 Теперь нужно настроить сервер и фронтенд"
EOF