import asyncio
from database import AsyncSessionLocal
from models import WorkspaceDraft
from sqlalchemy.future import select
from datetime import datetime

async def main():
    async with AsyncSessionLocal() as db:
        stmt = select(WorkspaceDraft).where(
            WorkspaceDraft.user_id == "123",
            WorkspaceDraft.platform == "cses",
            WorkspaceDraft.problem_id == "123",
            WorkspaceDraft.language == "cpp"
        )
        result = await db.execute(stmt)
        existing = result.scalars().first()

        client_time = datetime.fromtimestamp(1700000000000 / 1000.0)
        
        if existing:
            if not existing.updated_at.tzinfo:
                client_time = client_time.replace(tzinfo=None)
            
            if existing.updated_at < client_time or existing.updated_at.timestamp() < 1700000000:
                existing.code = "test"
                existing.updated_at = client_time
        else:
            new_draft = WorkspaceDraft(
                user_id="123",
                platform="cses",
                problem_id="123",
                language="cpp",
                code="test",
                updated_at=client_time
            )
            db.add(new_draft)

        await db.commit()
        print("Success")

asyncio.run(main())
