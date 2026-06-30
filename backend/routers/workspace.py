from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from database import get_db
from cache import get_cache
from models import WorkspaceDraft, WorkspaceLayout
from auth.dependencies import get_current_user, CurrentUser, RateLimiter

router = APIRouter(prefix="/api/workspace", tags=["Workspace Sync"])

@router.post("/sync", dependencies=[Depends(RateLimiter(120, 60))])
async def sync_workspace(data: Dict[str, Any], current_user: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Synchronizes drafts and layouts from IndexedDB to PostgreSQL.
    Resolves conflicts using updatedAt timestamps.
    """
    user_id = current_user.id

    drafts = data.get("drafts", [])
    layouts = data.get("layouts", [])
    
    # Process Drafts
    for d in drafts:
        # Check if draft exists
        stmt = select(WorkspaceDraft).where(
            WorkspaceDraft.user_id == user_id,
            WorkspaceDraft.platform == d["platform"],
            WorkspaceDraft.problem_id == d["problemId"],
            WorkspaceDraft.language == d["language"]
        )
        result = await db.execute(stmt)
        existing = result.scalars().first()
        
        client_time = datetime.fromtimestamp(d["updatedAt"] / 1000.0, tz=timezone.utc)
        
        if existing:
            # Simple conflict resolution: last write wins
            if existing.updated_at.timestamp() < client_time.timestamp():
                existing.code = d["code"]
                existing.updated_at = client_time
        else:
            new_draft = WorkspaceDraft(
                user_id=user_id,
                platform=d["platform"],
                problem_id=d["problemId"],
                language=d["language"],
                code=d["code"],
                updated_at=client_time
            )
            db.add(new_draft)

    # Process Layouts
    for l in layouts:
        stmt = select(WorkspaceLayout).where(
            WorkspaceLayout.user_id == user_id,
            WorkspaceLayout.platform == l["platform"],
            WorkspaceLayout.problem_id == l["problemId"]
        )
        result = await db.execute(stmt)
        existing = result.scalars().first()
        
        client_time = datetime.fromtimestamp(l["updatedAt"] / 1000.0, tz=timezone.utc)
        
        if existing:
            if existing.updated_at.timestamp() < client_time.timestamp():
                existing.drawer_height = l["drawerHeight"]
                existing.active_tab = l["activeTab"]
                existing.active_language = l.get("activeLanguage", "cpp")
                existing.updated_at = client_time
        else:
            new_layout = WorkspaceLayout(
                user_id=user_id,
                platform=l["platform"],
                problem_id=l["problemId"],
                drawer_height=l["drawerHeight"],
                active_tab=l["activeTab"],
                active_language=l.get("activeLanguage", "cpp"),
                updated_at=client_time
            )
            db.add(new_layout)

    await db.commit()
    return {"status": "success"}

@router.get("/recent")
async def get_recent_workspaces(limit: int = 50, current_user: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Returns recent workspaces based on drafts to populate 'Continue Solving' in the dashboard.
    """
    stmt = (
        select(WorkspaceDraft.platform, WorkspaceDraft.problem_id, WorkspaceDraft.updated_at, WorkspaceDraft.language)
        .where(WorkspaceDraft.user_id == current_user.id)
        .order_by(WorkspaceDraft.updated_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    results = result.all()
    
    try:
        workspaces = []
        seen = set()
        for row in results:
            key = f"{row.platform}-{row.problem_id}"
            if key in seen:
                continue
            seen.add(key)
            
            title = row.problem_id
            try:
                problem_data = await get_cache(f"problem_data:{row.problem_id}")
                if problem_data and "title" in problem_data:
                    title = problem_data["title"]
            except Exception:
                pass
                
            workspaces.append({
                "platform": row.platform,
                "problemId": row.problem_id,
                "updatedAt": row.updated_at.timestamp() * 1000 if row.updated_at else 0,
                "language": row.language,
                "title": title
            })
        return {"workspaces": workspaces}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/state/{platform}/{problem_id}")
async def get_workspace_state(
    platform: str, 
    problem_id: str, 
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        draft_stmt = select(WorkspaceDraft).where(
            WorkspaceDraft.user_id == current_user.id,
            WorkspaceDraft.platform == platform,
            WorkspaceDraft.problem_id == problem_id
        )
        draft_result = await db.execute(draft_stmt)
        draft = draft_result.scalars().first()
        
        layout_stmt = select(WorkspaceLayout).where(
            WorkspaceLayout.user_id == current_user.id,
            WorkspaceLayout.platform == platform,
            WorkspaceLayout.problem_id == problem_id
        )
        layout_result = await db.execute(layout_stmt)
        layout = layout_result.scalars().first()
        
        return {
            "draft": {
                "code": draft.code,
                "language": draft.language,
                "updatedAt": draft.updated_at.timestamp() * 1000
            } if draft else None,
            "layout": {
                "drawerHeight": layout.drawer_height,
                "activeTab": layout.active_tab,
                "activeLanguage": layout.active_language,
                "updatedAt": layout.updated_at.timestamp() * 1000
            } if layout else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
