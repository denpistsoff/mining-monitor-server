from fastapi import HTTPException, Request
import redis
from server.app.config import settings

redis_client = redis.from_url(settings.REDIS_URL)


async def rate_limiter(request: Request, key: str = "default", limit: int = None):
    if limit is None:
        limit = settings.RATE_LIMIT_PER_MINUTE

    # Используем IP + путь как ключ
    identifier = f"{request.client.host}:{key}"

    current = redis_client.get(identifier)
    if current is None:
        redis_client.setex(identifier, 60, 1)
    elif int(current) < limit:
        redis_client.incr(identifier)
    else:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Try again in 60 seconds."
        )