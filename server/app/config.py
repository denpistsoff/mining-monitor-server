import os
from decouple import config

class Settings:
    DATABASE_URL = config("DATABASE_URL", default="postgresql://mining_user:secure_password123@localhost/mining_monitor")
    SECRET_KEY = config("SECRET_KEY", default="your-secret-key-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
    REDIS_URL = config("REDIS_URL", default="redis://localhost:6379/0")

settings = Settings()