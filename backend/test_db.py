import asyncio
from database import engine, Base
import models

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("Created all!")

asyncio.run(main())
