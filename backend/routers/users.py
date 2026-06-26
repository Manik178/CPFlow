from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any

from database import get_db
from models import User, LinkedHandles, Preferences

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.post("/onboard")
async def onboard_user(data: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Called after successful Auth.js login to ensure the user exists in our DB,
    and updates their handles if provided during onboarding.
    """
    user_id = data.get("id")
    email = data.get("email")
    name = data.get("name")
    
    if not user_id or not email:
        raise HTTPException(status_code=400, detail="Missing user_id or email")
        
    # Check if user exists
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        # Create new user
        user = User(id=user_id, email=email, name=name, image=data.get("image"))
        db.add(user)
        # Create default handles and preferences
        handles = LinkedHandles(user_id=user_id)
        prefs = Preferences(user_id=user_id)
        db.add(handles)
        db.add(prefs)
        await db.commit()
    
    # Update handles if provided
    handles_data = data.get("handles", {})
    if handles_data:
        result = await db.execute(select(LinkedHandles).where(LinkedHandles.user_id == user_id))
        handles = result.scalars().first()
        if handles:
            if "codeforces" in handles_data: handles.codeforces = handles_data["codeforces"]
            if "codechef" in handles_data: handles.codechef = handles_data["codechef"]
            if "cses" in handles_data: handles.cses = handles_data["cses"]
            if "leetcode" in handles_data: handles.leetcode = handles_data["leetcode"]
            await db.commit()
            
    return {"status": "success", "message": "User onboarded"}

@router.get("/{user_id}/profile")
async def get_profile(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get user profile including linked handles and preferences"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    handles_res = await db.execute(select(LinkedHandles).where(LinkedHandles.user_id == user_id))
    handles = handles_res.scalars().first()
    
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "handles": {
            "codeforces": handles.codeforces if handles else None,
            "codechef": handles.codechef if handles else None,
            "cses": handles.cses if handles else None,
            "leetcode": handles.leetcode if handles else None,
        } if handles else {}
    }

@router.put("/{user_id}/profile")
async def update_profile(user_id: str, data: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """Update user handles and preferences"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    handles_res = await db.execute(select(LinkedHandles).where(LinkedHandles.user_id == user_id))
    handles = handles_res.scalars().first()
    
    if not handles:
        handles = LinkedHandles(user_id=user_id)
        db.add(handles)
        
    handles_data = data.get("handles", {})
    if "codeforces" in handles_data: handles.codeforces = handles_data["codeforces"]
    if "codechef" in handles_data: handles.codechef = handles_data["codechef"]
    if "cses" in handles_data: handles.cses = handles_data["cses"]
    if "leetcode" in handles_data: handles.leetcode = handles_data["leetcode"]
    
    await db.commit()
    return {"status": "success"}
