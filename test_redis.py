import asyncio
from backend.cache import redis_client
async def main():
    try:
        await redis_client.ping()
        print("Ping success")
    except Exception as e:
        print(f"Error: {e}")
asyncio.run(main())
