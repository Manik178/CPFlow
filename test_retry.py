import asyncio
import redis.asyncio as redis
from redis.backoff import ExponentialBackoff
from redis.retry import Retry
from redis.exceptions import ConnectionError, TimeoutError

async def main():
    retry = Retry(ExponentialBackoff(cap=2, base=0.1), 3)
    r = redis.from_url("redis://localhost:6379", retry=retry, retry_on_error=[ConnectionError, TimeoutError], retry_on_timeout=True)
    await r.ping()
    print("Success")

asyncio.run(main())
