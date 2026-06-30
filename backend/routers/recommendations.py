from fastapi import APIRouter, HTTPException, Depends
from auth.dependencies import get_current_user, CurrentUser
from database import get_db
from models import LinkedHandles
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import httpx
import json
import random
from routers.analytics import get_codeforces_analytics, get_codechef_analytics, get_leetcode_analytics

router = APIRouter(prefix="/api/analytics", tags=["recommendations"])

@router.get("/recommendations")
async def get_recommendations(current_user: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LinkedHandles).where(LinkedHandles.user_id == current_user.id))
    handles = result.scalars().first()
    
    cf_handle = handles.codeforces if handles else None
    cc_handle = handles.codechef if handles else None
    lc_handle = handles.leetcode if handles else None
    
    max_rating = 1000
    weaknesses = {}
    
    # 1. Gather Ratings & Weaknesses
    if cf_handle:
        try:
            cf_data = await get_codeforces_analytics(cf_handle, current_user)
            if cf_data.get("rating", 0) > max_rating:
                max_rating = cf_data["rating"]
            topics = cf_data.get("topicDistribution", [])
            least_solved = sorted(topics, key=lambda x: x["value"])[:5]
            for t in least_solved:
                weaknesses[t["name"]] = weaknesses.get(t["name"], 0) + 1
        except Exception:
            pass
            
    if cc_handle:
        try:
            cc_data = await get_codechef_analytics(cc_handle, current_user)
            cc_rating = cc_data.get("rating", 0)
            if cc_rating * 0.9 > max_rating:
                max_rating = int(cc_rating * 0.9)
        except Exception:
            pass
            
    if lc_handle:
        try:
            lc_data = await get_leetcode_analytics(lc_handle, current_user)
            lc_rating = lc_data.get("rating", 0)
            if lc_rating * 0.85 > max_rating:
                max_rating = int(lc_rating * 0.85)
        except Exception:
            pass

    # 2. Fetch Codeforces Problemset
    target_rating = max(1000, max_rating + 100)
    target_upper = target_rating + 200
    
    async with httpx.AsyncClient() as client:
        res = await client.get("https://codeforces.com/api/problemset.problems")
        if res.status_code != 200:
            raise HTTPException(status_code=502, detail="Codeforces API error")
        data = res.json()
        if data.get("status") != "OK":
            raise HTTPException(status_code=502, detail="Codeforces API error")
            
        all_problems = data["result"]["problems"]
        
    filtered_problems = []
    for p in all_problems:
        rating = p.get("rating")
        if rating and target_rating <= rating <= target_upper:
            filtered_problems.append({
                "id": f"{p.get('contestId')}{p.get('index')}",
                "contestId": p.get("contestId"),
                "index": p.get("index"),
                "name": p.get("name"),
                "rating": rating,
                "tags": p.get("tags", [])
            })
            
    filtered_problems.sort(key=lambda x: x["contestId"], reverse=True)
    top_50 = filtered_problems[:50]
    
    # 3. Use AI to pick top 5
    from langchain_groq import ChatGroq
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.output_parsers import JsonOutputParser
    from pydantic import BaseModel
    
    class Recommendation(BaseModel):
        id: str
        contestId: int
        index: str
        name: str
        rating: int
        tags: list[str]
        justification: str
        
    class RecOutput(BaseModel):
        recommendations: list[Recommendation]
        
    llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0.2)
    parser = JsonOutputParser(pydantic_object=RecOutput)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert competitive programming coach. Choose the 10 BEST problems for the user from the provided list based on their weak topics. Focus on providing diverse tags. Justify why each is recommended in 1-2 short sentences. Return ONLY valid JSON matching the format instructions."),
        ("user", "User Weaknesses: {weaknesses}\n\nCandidate Problems: {problems}\n\n{format_instructions}")
    ])
    
    chain = prompt | llm | parser
    
    try:
        response = await chain.ainvoke({
            "weaknesses": list(weaknesses.keys()) if weaknesses else ["Dynamic Programming", "Graphs", "Math"],
            "problems": json.dumps(top_50),
            "format_instructions": parser.get_format_instructions()
        })
        return response
    except Exception as e:
        print("AI Error:", e)
        fallback = random.sample(top_50, min(10, len(top_50)))
        return {
            "recommendations": [
                {
                    "id": p["id"],
                    "contestId": p["contestId"],
                    "index": p["index"],
                    "name": p["name"],
                    "rating": p["rating"],
                    "tags": p["tags"],
                    "justification": "Recommended based on your current rating level."
                } for p in fallback
            ]
        }
