from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import datetime

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    last_login = Column(DateTime)


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    display_name = Column(String(100))
    location = Column(String(200))
    total_hashrate = Column(Float, default=0.0)
    total_power = Column(Float, default=0.0)
    total_miners = Column(Integer, default=0)
    online_miners = Column(Integer, default=0)
    status = Column(String(20), default="offline")
    last_update = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    config = Column(JSON)  # Дополнительные настройки фермы


class Container(Base):
    __tablename__ = "containers"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, index=True, nullable=False)
    container_id = Column(String(50), nullable=False)
    name = Column(String(100))
    total_hashrate = Column(Float, default=0.0)
    total_power = Column(Float, default=0.0)
    total_miners = Column(Integer, default=0)
    online_miners = Column(Integer, default=0)
    status = Column(String(20), default="offline")
    last_update = Column(DateTime)


class Miner(Base):
    __tablename__ = "miners"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, index=True, nullable=False)
    container_id = Column(String(50), index=True)
    ip_address = Column(String(15), nullable=False)
    model = Column(String(50))
    hashrate = Column(Float, default=0.0)
    ideal_hashrate = Column(Float, default=0.0)
    power = Column(Float, default=0.0)
    temperature = Column(Float)
    fan_speed = Column(Integer)
    uptime = Column(Integer)  # в секундах
    status = Column(String(20), default="offline")
    pool = Column(String(200))
    algorithm = Column(String(50))
    problem_reason = Column(Text)
    last_update = Column(DateTime)
    created_at = Column(DateTime, default=func.now())


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, index=True)
    miner_id = Column(Integer, index=True)
    type = Column(String(50), nullable=False)  # temperature, hashrate, offline, etc.
    severity = Column(String(20), nullable=False)  # info, warning, critical
    message = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())


class HistoricalData(Base):
    __tablename__ = "historical_data"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, index=True, nullable=False)
    timestamp = Column(DateTime, default=func.now())
    total_hashrate = Column(Float)
    total_power = Column(Float)
    online_miners = Column(Integer)
    total_miners = Column(Integer)
    efficiency = Column(Float)  # TH/s per kW