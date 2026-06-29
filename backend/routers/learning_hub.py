from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any
import traceback
import json
# It seems it's in main.py, which causes circular imports.
# I will import it conditionally or fetch from Redis.
# But for now, we'll try to import _problem_cache from main.
from cache import _problem_cache
from agents.learning_hub_graph import learning_hub_graph, explain_simply

router = APIRouter(prefix="/api/problems", tags=["Learning Hub"])

class ExplainRequest(BaseModel):
    highlighted_text: str

@router.get("/{problem_id}/learning-hub")
async def get_learning_hub(problem_id: str):
    problem = _problem_cache.get(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found in cache. Please open it via the extension again.")

    # Initialize state
    initial_state = {
        "problem": problem,
        "revision_count": 0
    }
    
    # Run the graph using astream
    async def event_generator():
        try:
            merged_state = {}
            async for output in learning_hub_graph.astream(initial_state):
                for node_name, state_update in output.items():
                    if node_name == "__end__":
                        continue
                    merged_state.update(state_update)
                    yield f"data: {json.dumps({'node': node_name})}\n\n"
            
            final_payload = {
                "overview": merged_state.get("overview", {}),
                "editorial": merged_state.get("editorial", {}),
                "alternatives": merged_state.get("alternatives", {}),
                "similarProblems": merged_state.get("similar_problems", {}),
                "resources": merged_state.get("resources", {})
            }
            yield f"data: {json.dumps({'status': 'complete', 'final_data': final_payload})}\n\n"
        except Exception as e:
            traceback.print_exc()
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/{problem_id}/explain")
async def explain_text(problem_id: str, req: ExplainRequest):
    problem = _problem_cache.get(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found.")

    try:
        explanation = await explain_simply(problem, req.highlighted_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    return explanation
