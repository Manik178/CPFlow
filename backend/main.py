from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text
import httpx
import os
from dotenv import load_dotenv
import json

load_dotenv()
import hashlib

from contextlib import asynccontextmanager

from database import engine, Base
from routers import users, analytics, contests, execute, learning_hub, workspace, recommendations
from cache import _problem_cache, get_cache, set_cache

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="CPFlow Backend", lifespan=lifespan)

# Enable CORS for the frontend & extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(analytics.router)
app.include_router(contests.router)
app.include_router(execute.router)
app.include_router(learning_hub.router)
app.include_router(workspace.router)
app.include_router(recommendations.router)

class ProblemImportRequest(BaseModel):
    title: str
    url: str
    platform: str
    statement_html: str
    time_limit: float | None = None
    memory_limit: int | None = None
    tags: list[str] = []
    difficulty: str | None = None
    samples: list[dict] = []

from auth.dependencies import RateLimiter
import time

_start_time = time.time()

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to CPFlow API"}

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint that verifies database and Redis connectivity.
    Used by uptime monitors and deployment health checks.
    """
    health = {
        "status": "healthy",
        "uptime_seconds": round(time.time() - _start_time, 1),
        "services": {}
    }

    # Check PostgreSQL
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        health["services"]["database"] = "connected"
    except Exception as e:
        health["services"]["database"] = f"error: {str(e)}"
        health["status"] = "degraded"

    # Check Redis
    try:
        from redis_client import redis_client
        await redis_client.ping()
        health["services"]["redis"] = "connected"
    except Exception as e:
        health["services"]["redis"] = f"error: {str(e)}"
        health["status"] = "degraded"

    # Check Piston
    try:
        piston_url = os.getenv("PISTON_URL", "http://localhost:2000")
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{piston_url}/api/v2/runtimes")
            if resp.status_code == 200:
                health["services"]["piston"] = "connected"
            else:
                health["services"]["piston"] = f"error: status {resp.status_code}"
                health["status"] = "degraded"
    except Exception as e:
        health["services"]["piston"] = f"error: {str(e)}"
        health["status"] = "degraded"

    status_code = 200 if health["status"] == "healthy" else 503
    from fastapi.responses import JSONResponse
    return JSONResponse(content=health, status_code=status_code)

@app.post("/api/problems/import", dependencies=[Depends(RateLimiter(requests=10, window=60))])
async def import_problem(problem: ProblemImportRequest):
    """
    Receives scraped problem data from the extension, caches it, and returns a problem_id.
    The problem is NOT stored in the database — only cached temporarily.
    """
    # Generate a deterministic ID from the problem URL
    problem_id = hashlib.md5(problem.url.encode()).hexdigest()[:12]

    problem_data = problem.model_dump()
    problem_data["problem_id"] = problem_id

    problem_data["problem_id"] = problem_id

    # Cache in memory and Redis (30 days TTL)
    _problem_cache[problem_id] = problem_data
    try:
        await set_cache(f"problem_data:{problem_id}", problem_data, ex=2592000)
    except Exception as e:
        print("Failed to save to redis", e)

    return {"status": "success", "problem_id": problem_id}

@app.get("/api/problems/{problem_id}")
async def get_problem(problem_id: str):
    """
    Retrieves a cached problem by its ID.
    """
    problem = _problem_cache.get(problem_id)
    if not problem:
        try:
            problem = await get_cache(f"problem_data:{problem_id}")
            if problem:
                _problem_cache[problem_id] = problem
        except Exception:
            pass
            
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found or cache expired")
    return problem
