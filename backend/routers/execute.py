from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import os

router = APIRouter()

PISTON_URL = os.getenv("PISTON_URL", "http://localhost:2000")
RUN_TIMEOUT = int(os.getenv("PISTON_RUN_TIMEOUT", "3"))        # seconds
COMPILE_TIMEOUT = int(os.getenv("PISTON_COMPILE_TIMEOUT", "10"))  # seconds

# Map our language keys → Piston language names + versions
LANGUAGE_MAP: dict[str, dict[str, str]] = {
    "cpp": {"language": "c++", "version": "10.2.0"},
    "python": {"language": "python", "version": "3.10.0"},
    "java": {"language": "java", "version": "15.0.2"},
}

# Judge0-compatible status codes (frontend depends on these)
STATUS_ACCEPTED = {"id": 3, "description": "Accepted"}
STATUS_TLE = {"id": 5, "description": "Time Limit Exceeded"}
STATUS_MLE = {"id": 6, "description": "Memory Limit Exceeded"}
STATUS_RTE = {"id": 10, "description": "Runtime Error"}
STATUS_CE = {"id": 11, "description": "Compilation Error"}
STATUS_INTERNAL_ERROR = {"id": 13, "description": "Internal Error"}


class CodeExecutionRequest(BaseModel):
    source_code: str
    language: str  # "cpp", "python", or "java"
    stdin: str | None = None
    expected_output: str | None = None


@router.post("/api/run")
async def run_code(request: CodeExecutionRequest):
    """
    Executes code via the Piston execution engine.
    Piston runs everything inside isolated containers with no network access.
    """
    lang = request.language.lower()

    lang_config = LANGUAGE_MAP.get(lang)
    if not lang_config:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language: '{lang}'. Supported: {list(LANGUAGE_MAP.keys())}"
        )

    piston_payload = {
        "language": lang_config["language"],
        "version": lang_config["version"],
        "files": [
            {"content": request.source_code}
        ],
        "stdin": request.stdin or "",
        "run_timeout": RUN_TIMEOUT * 1000,        # Piston expects ms
        "compile_timeout": COMPILE_TIMEOUT * 1000,
        "compile_memory_limit": 256_000_000,       # 256 MB
        "run_memory_limit": 256_000_000,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{PISTON_URL}/api/v2/execute", json=piston_payload)

        if resp.status_code != 200:
            error_detail = resp.text
            raise HTTPException(
                status_code=502,
                detail=f"Piston returned {resp.status_code}: {error_detail}"
            )

        data = resp.json()

    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Execution engine is offline. Please ensure Piston is running (docker compose up -d)."
        )
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Execution engine timed out."
        )

    # Parse Piston response into our Judge0-compatible shape
    compile_phase = data.get("compile")
    run_phase = data.get("run")

    # Check for compilation errors first
    if compile_phase and compile_phase.get("code") is not None and compile_phase["code"] != 0:
        return {
            "stdout": None,
            "stderr": None,
            "compile_output": (compile_phase.get("stderr") or compile_phase.get("output") or "Compilation failed"),
            "time": "0.0",
            "memory": 0,
            "status": STATUS_CE,
        }

    # Determine run status
    stdout = run_phase.get("stdout", "") if run_phase else ""
    stderr = run_phase.get("stderr", "") if run_phase else ""
    run_signal = run_phase.get("signal") if run_phase else None
    run_code = run_phase.get("code") if run_phase else None

    if run_signal == "SIGKILL" and run_phase.get("message", ""):
        # Piston kills with SIGKILL on timeout or memory limit
        msg = run_phase.get("message", "").lower()
        if "time" in msg or "timeout" in msg:
            status = STATUS_TLE
        elif "memory" in msg:
            status = STATUS_MLE
        else:
            status = STATUS_TLE
        stderr = run_phase.get("message", "Time Limit Exceeded")
    elif run_signal == "SIGKILL":
        status = STATUS_TLE
        stderr = stderr or "Time Limit Exceeded"
    elif run_code is not None and run_code != 0:
        status = STATUS_RTE
    else:
        if request.expected_output is not None:
            # Compare output ignoring trailing whitespace
            if stdout.strip() == request.expected_output.strip():
                status = STATUS_ACCEPTED
            else:
                status = {"id": 4, "description": "Wrong Answer"}
        else:
            status = STATUS_ACCEPTED

    return {
        "stdout": stdout or None,
        "stderr": stderr or None,
        "compile_output": None,
        "time": "0.000",  # Piston doesn't return wall-clock time; could be measured if needed
        "memory": 0,
        "status": status,
        "passed": status["id"] == 3,
    }


@router.get("/api/runtimes")
async def get_runtimes():
    """
    Passthrough to Piston's runtimes endpoint.
    Returns all installed language runtimes.
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{PISTON_URL}/api/v2/runtimes")
        return resp.json()
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Execution engine is offline."
        )


@router.get("/api/health/piston")
async def piston_health():
    """
    Health check for the Piston execution engine.
    """
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{PISTON_URL}/api/v2/runtimes")
        if resp.status_code == 200:
            runtimes = resp.json()
            installed = [f"{r['language']} {r['version']}" for r in runtimes]
            return {"status": "online", "runtimes": installed}
        return {"status": "degraded", "detail": f"Piston returned {resp.status_code}"}
    except Exception:
        return {"status": "offline"}
