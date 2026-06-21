from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os

from contextlib import asynccontextmanager

from database import engine, Base
from routers import users

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="CPFlow Backend", lifespan=lifespan)

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)


# Judge0 config
JUDGE0_URL = os.getenv("JUDGE0_URL", "https://judge0-ce.p.rapidapi.com")
JUDGE0_API_KEY = os.getenv("JUDGE0_API_KEY", "")

class CodeExecutionRequest(BaseModel):
    source_code: str
    language_id: int
    stdin: str | None = None
    expected_output: str | None = None

class ProblemImportRequest(BaseModel):
    title: str
    url: str
    platform: str
    statement_html: str
    time_limit: float | None = None
    memory_limit: int | None = None
    samples: list[dict] = []

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to CPFlow API"}

@app.post("/api/run")
async def run_code(request: CodeExecutionRequest):
    """
    Submits code to Judge0 for execution and waits for the result.
    """
    if not JUDGE0_API_KEY:
        # Mock response for local development if API key is not set
        return {
            "stdout": "Hello CPFlow!\n",
            "time": "0.012",
            "memory": 2048,
            "status": {"id": 3, "description": "Accepted"}
        }

    headers = {
        "x-rapidapi-key": JUDGE0_API_KEY,
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json"
    }
    
    payload = {
        "source_code": request.source_code,
        "language_id": request.language_id,
        "stdin": request.stdin,
        "expected_output": request.expected_output,
    }

    async with httpx.AsyncClient() as client:
        try:
            # Submit submission with wait=true to get synchronous results
            response = await client.post(
                f"{JUDGE0_URL}/submissions?base64_encoded=false&wait=true",
                json=payload,
                headers=headers,
                timeout=15.0
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Judge0 API error: {str(e)}")

@app.post("/api/problems/import")
async def import_problem(problem: ProblemImportRequest):
    """
    Endpoint for the Plasmo extension to send parsed problem data.
    """
    # In a real implementation, this would save to PostgreSQL
    return {"status": "success", "problem_id": "mock_uuid_123", "message": "Problem imported successfully"}
