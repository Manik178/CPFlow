import os
import json
import redis.asyncio as redis
from dotenv import load_dotenv

load_dotenv()

from redis.backoff import ExponentialBackoff
from redis.retry import Retry
from redis.exceptions import ConnectionError, TimeoutError

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
retry_strategy = Retry(ExponentialBackoff(cap=2, base=0.1), 3)

redis_client = redis.from_url(
    REDIS_URL, 
    decode_responses=True,
    health_check_interval=30,
    socket_keepalive=True,
    socket_timeout=5,
    retry_on_timeout=True,
    retry=retry_strategy,
    retry_on_error=[ConnectionError, TimeoutError]
)

# Legacy fallback for local dev
_problem_cache: dict[str, dict] = {}

async def get_cache(key: str) -> dict | None:
    try:
        data = await redis_client.get(key)
        if data:
            return json.loads(data)
    except Exception as e:
        print(f"Redis get_cache error: {e}")
    return None

async def set_cache(key: str, data: dict, ex: int = 3600):
    try:
        await redis_client.set(key, json.dumps(data), ex=ex)
    except Exception as e:
        print(f"Redis set_cache error: {e}")
