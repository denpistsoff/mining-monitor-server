FROM python:3.10-slim

WORKDIR /app

# Установка зависимостей
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-dev \
    && rm -rf /var/lib/apt/lists/*

# Копирование зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование кода
COPY . .

# Создание директории для логов
RUN mkdir -p /app/logs

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]