from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from server.app.database.database import get_db
from server.app.database.models import Farm, Container, Miner, HistoricalData
from server.app.core.auth import get_current_active_user
from server.app.core.rate_limiter import rate_limiter
from pydantic import BaseModel
from datetime import datetime, timedelta

router = APIRouter()


class FarmStats(BaseModel):
    total_containers: int
    total_miners: int
    online_miners: int
    problematic_miners: int
    offline_miners: int
    total_hashrate: float
    total_power: float


class FarmResponse(BaseModel):
    id: int
    name: str
    display_name: str
    location: Optional[str]
    status: str
    last_update: Optional[datetime]
    stats: FarmStats


@router.get("/farms", response_model=List[FarmResponse])
async def get_farms(
        current_user=Depends(get_current_active_user),
        db: Session = Depends(get_db),
        request: Request = None
):
    # Применяем rate limiting
    await rate_limiter(request, "farms_list")

    farms = db.query(Farm).all()
    result = []

    for farm in farms:
        # Рассчитываем статистику в реальном времени
        containers = db.query(Container).filter(Container.farm_id == farm.id).all()
        miners = db.query(Miner).filter(Miner.farm_id == farm.id).all()

        stats = FarmStats(
            total_containers=len(containers),
            total_miners=len(miners),
            online_miners=sum(1 for m in miners if m.status == "online"),
            problematic_miners=sum(1 for m in miners if m.status == "problematic"),
            offline_miners=sum(1 for m in miners if m.status == "offline"),
            total_hashrate=sum(c.total_hashrate for c in containers),
            total_power=sum(c.total_power for c in containers)
        )

        result.append(FarmResponse(
            id=farm.id,
            name=farm.name,
            display_name=farm.display_name or farm.name,
            location=farm.location,
            status=farm.status,
            last_update=farm.last_update,
            stats=stats
        ))

    return result


@router.get("/farms/{farm_name}/data")
async def get_farm_data(
        farm_name: str,
        current_user=Depends(get_current_active_user),
        db: Session = Depends(get_db),
        request: Request = None
):
    await rate_limiter(request, f"farm_data_{farm_name}")

    farm = db.query(Farm).filter(Farm.name == farm_name).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    containers = db.query(Container).filter(Container.farm_id == farm.id).all()
    miners = db.query(Miner).filter(Miner.farm_id == farm.id).all()

    # Формируем данные в формате для фронтенда
    containers_data = {}
    for container in containers:
        container_miners = [m for m in miners if m.container_id == container.container_id]

        containers_data[container.container_id] = {
            "stats": {
                "total_hashrate": container.total_hashrate,
                "total_power": container.total_power,
                "total_miners": len(container_miners),
                "online_miners": sum(1 for m in container_miners if m.status == "online"),
                "problematic_miners": sum(1 for m in container_miners if m.status == "problematic"),
                "offline_miners": sum(1 for m in container_miners if m.status == "offline")
            },
            "miners": [
                {
                    "ip": miner.ip_address,
                    "type": miner.model,
                    "hashrate": miner.hashrate,
                    "temperature": miner.temperature,
                    "power": miner.power,
                    "pool": miner.pool,
                    "status": miner.status,
                    "problem_reason": miner.problem_reason,
                    "algorithm": miner.algorithm,
                    "fans": miner.fan_speed,
                    "uptime": miner.uptime
                }
                for miner in container_miners
            ]
        }

    summary = FarmStats(
        total_containers=len(containers),
        total_miners=len(miners),
        online_miners=sum(1 for m in miners if m.status == "online"),
        problematic_miners=sum(1 for m in miners if m.status == "problematic"),
        offline_miners=sum(1 for m in miners if m.status == "offline"),
        total_hashrate=sum(c.total_hashrate for c in containers),
        total_power=sum(c.total_power for c in containers)
    )

    return {
        "farm_name": farm.display_name or farm.name,
        "timestamp": datetime.utcnow().timestamp(),
        "last_update": farm.last_update.isoformat() if farm.last_update else None,
        "summary": summary.dict(),
        "containers": containers_data,
        "_dataStatus": "fresh"
    }


@router.get("/farms/{farm_name}/history")
async def get_farm_history(
        farm_name: str,
        hours: int = Query(24, ge=1, le=168),
        current_user=Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    farm = db.query(Farm).filter(Farm.name == farm_name).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    since = datetime.utcnow() - timedelta(hours=hours)
    history_data = db.query(HistoricalData).filter(
        HistoricalData.farm_id == farm.id,
        HistoricalData.timestamp >= since
    ).order_by(HistoricalData.timestamp).all()

    return [
        {
            "timestamp": data.timestamp.isoformat(),
            "time_label": data.timestamp.strftime("%H:%M"),
            "total_hashrate": data.total_hashrate,
            "total_power": data.total_power,
            "online_miners": data.online_miners,
            "total_miners": data.total_miners,
            "efficiency": data.efficiency
        }
        for data in history_data
    ]