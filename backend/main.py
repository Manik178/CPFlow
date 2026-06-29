from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv
import json

load_dotenv()
import hashlib

from contextlib import asynccontextmanager

from database import engine, Base
from routers import users, analytics, contests, execute, learning_hub
from cache import _problem_cache

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

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to CPFlow API"}

@app.post("/api/problems/import")
async def import_problem(problem: ProblemImportRequest):
    """
    Receives scraped problem data from the extension, caches it, and returns a problem_id.
    The problem is NOT stored in the database — only cached temporarily.
    """
    # Generate a deterministic ID from the problem URL
    problem_id = hashlib.md5(problem.url.encode()).hexdigest()[:12]

    problem_data = problem.model_dump()
    problem_data["problem_id"] = problem_id

    # Cache in memory (Redis replacement for local dev)
    _problem_cache[problem_id] = problem_data

    return {"status": "success", "problem_id": problem_id}

@app.get("/api/problems/{problem_id}")
async def get_problem(problem_id: str):
    """
    Retrieves a cached problem by its ID.
    """
    problem = _problem_cache.get(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found or cache expired")
    return problem
