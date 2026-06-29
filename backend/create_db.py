import asyncio
import asyncpg

async def create_db():
    try:
        # Connect to the default 'postgres' database
        conn = await asyncpg.connect(user='postgres', password='postgres', host='localhost', port=5432, database='postgres')
        # Create database CPFlow
        await conn.execute('CREATE DATABASE "CPFlow"')
        print("Database CPFlow created successfully!")
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(create_db())
