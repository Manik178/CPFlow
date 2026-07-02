import os
import redis.asyncio as redis
from dotenv import load_dotenv

load_dotenv()

from redis.backoff import ExponentialBackoff
from redis.retry import Retry
from redis.exceptions import ConnectionError, TimeoutError

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
retry_strategy = Retry(ExponentialBackoff(cap=2, base=0.1), 3)

# Create a Redis connection pool
redis_pool = redis.ConnectionPool.from_url(
    REDIS_URL, 
    decode_responses=True,
    health_check_interval=30,
    socket_keepalive=True,
    socket_timeout=5,
    retry_on_timeout=True,
    retry=retry_strategy,
    retry_on_error=[ConnectionError, TimeoutError]
)

def get_redis() -> redis.Redis:
    """Dependency to get Redis client."""
    return redis.Redis(connection_pool=redis_pool)
