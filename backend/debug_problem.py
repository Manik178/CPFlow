import asyncio
import asyncpg
import json

async def check_problem():
    conn = await asyncpg.connect(user='postgres', password='postgres', host='localhost', port=5432, database='CPFlow')
    row = await conn.fetchrow('SELECT * FROM problems LIMIT 1')
    if row:
        problem = dict(row)
        html = problem.get('statement_html', '')
        print(f"HTML length: {len(html)} characters")
        print("First 500 chars:", html[:500])
    else:
        print("No problems found")
    await conn.close()

asyncio.run(check_problem())
