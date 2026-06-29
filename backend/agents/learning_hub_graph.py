import os
from typing import TypedDict, Optional, Dict, Any, List
from langgraph.graph import StateGraph, START, END
from langchain_groq import ChatGroq
from langchain_core.output_parsers import JsonOutputParser
from bs4 import BeautifulSoup

from .prompts import (
    OverviewOutput, EditorialOutput, AlternativesOutput, SimilarProblemsOutput, ResourcesOutput, ValidationOutput, ExplainSimplyOutput,
    OVERVIEW_SYSTEM_PROMPT, EDITORIAL_SYSTEM_PROMPT, ALTERNATIVES_SYSTEM_PROMPT, SIMILAR_PROBLEMS_SYSTEM_PROMPT,
    RESOURCES_SYSTEM_PROMPT, VALIDATOR_SYSTEM_PROMPT, EXPLAIN_SIMPLY_SYSTEM_PROMPT
)

# We will use llama-3.3-70b-versatile for complex reasoning (Editorial, Alternatives)
# and smaller models for simpler tasks to avoid Groq's 12,000 TPM limit on the free tier.
def get_large_llm():
    return ChatGroq(model_name="llama-3.3-70b-versatile", temperature=0.2)

def get_fast_llm():
    return ChatGroq(model_name="llama-3.1-8b-instant", temperature=0.2)

class LearningHubState(TypedDict):
    problem: Dict[str, Any]
    overview: Optional[Dict[str, Any]]
    editorial: Optional[Dict[str, Any]]
    alternatives: Optional[Dict[str, Any]]
    similar_problems: Optional[Dict[str, Any]]
    resources: Optional[Dict[str, Any]]
    validation: Optional[Dict[str, Any]]
    errors: Optional[List[str]]
    revision_count: int

def get_context_string(problem: Dict[str, Any]) -> str:
    # Use BeautifulSoup to strip HTML tags, significantly reducing token usage
    raw_html = problem.get('statement_html', '')
    if raw_html:
        soup = BeautifulSoup(raw_html, "html.parser")
        clean_text = soup.get_text(separator="\n", strip=True)
    else:
        clean_text = ""
        
    return f"Problem Title: {problem.get('title')}\nPlatform: {problem.get('platform')}\nTags: {problem.get('tags')}\nStatement: {clean_text}\n"

async def overview_node(state: LearningHubState) -> Dict[str, Any]:
    context = get_context_string(state['problem'])
    model = get_large_llm().with_structured_output(OverviewOutput, method="json_mode")
    parser = JsonOutputParser(pydantic_object=OverviewOutput)
    sys_prompt = OVERVIEW_SYSTEM_PROMPT + "\n\n" + parser.get_format_instructions()
    res = await model.ainvoke([
        {"role": "system", "content": sys_prompt},
        {"role": "user", "content": context}
    ])
    return {"overview": res.dict()}

async def editorial_node(state: LearningHubState) -> Dict[str, Any]:
    context = get_context_string(state['problem'])
    model = get_large_llm().with_structured_output(EditorialOutput, method="json_mode")
    parser = JsonOutputParser(pydantic_object=EditorialOutput)
    sys_prompt = EDITORIAL_SYSTEM_PROMPT + "\n\n" + parser.get_format_instructions()
    res = await model.ainvoke([
        {"role": "system", "content": sys_prompt},
        {"role": "user", "content": context}
    ])
    return {"editorial": res.dict()}

async def alternatives_node(state: LearningHubState) -> Dict[str, Any]:
    context = get_context_string(state['problem'])
    model = get_large_llm().with_structured_output(AlternativesOutput, method="json_mode")
    parser = JsonOutputParser(pydantic_object=AlternativesOutput)
    sys_prompt = ALTERNATIVES_SYSTEM_PROMPT + "\n\n" + parser.get_format_instructions()
    res = await model.ainvoke([
        {"role": "system", "content": sys_prompt},
        {"role": "user", "content": context}
    ])
    return {"alternatives": res.dict()}

async def similar_problems_node(state: LearningHubState) -> Dict[str, Any]:
    context = get_context_string(state['problem'])
    model = get_large_llm().with_structured_output(SimilarProblemsOutput, method="json_mode")
    parser = JsonOutputParser(pydantic_object=SimilarProblemsOutput)
    sys_prompt = SIMILAR_PROBLEMS_SYSTEM_PROMPT + "\n\n" + parser.get_format_instructions()
    res = await model.ainvoke([
        {"role": "system", "content": sys_prompt},
        {"role": "user", "content": context}
    ])
    return {"similar_problems": res.dict()}

async def resources_node(state: LearningHubState) -> Dict[str, Any]:
    context = get_context_string(state['problem'])
    model = get_large_llm().with_structured_output(ResourcesOutput, method="json_mode")
    parser = JsonOutputParser(pydantic_object=ResourcesOutput)
    sys_prompt = RESOURCES_SYSTEM_PROMPT + "\n\n" + parser.get_format_instructions()
    res = await model.ainvoke([
        {"role": "system", "content": sys_prompt},
        {"role": "user", "content": context}
    ])
    return {"resources": res.dict()}

async def validation_node(state: LearningHubState) -> Dict[str, Any]:
    content_to_validate = f"""
    Overview: {state.get('overview')}
    Editorial: {state.get('editorial')}
    Alternatives: {state.get('alternatives')}
    Similar Problems: {state.get('similar_problems')}
    """
    model = get_large_llm().with_structured_output(ValidationOutput, method="json_mode")
    parser = JsonOutputParser(pydantic_object=ValidationOutput)
    sys_prompt = VALIDATOR_SYSTEM_PROMPT + "\n\n" + parser.get_format_instructions()
    res = await model.ainvoke([
        {"role": "system", "content": sys_prompt},
        {"role": "user", "content": content_to_validate}
    ])
    count = state.get('revision_count', 0)
    return {"validation": res.dict(), "revision_count": count + 1}

def should_revise(state: LearningHubState) -> str:
    val = state.get('validation')
    if val and not val.get('is_valid') and state.get('revision_count', 0) < 1:
        return "revise"
    return "end"

# Constructing the graph
workflow = StateGraph(LearningHubState)

workflow.add_node("overview", overview_node)
workflow.add_node("editorial", editorial_node)
workflow.add_node("alternatives", alternatives_node)
workflow.add_node("similar_problems", similar_problems_node)
workflow.add_node("resources", resources_node)
workflow.add_node("validation", validation_node)

# Fan out
workflow.add_edge(START, "overview")
workflow.add_edge(START, "editorial")
workflow.add_edge(START, "alternatives")
workflow.add_edge(START, "similar_problems")
workflow.add_edge(START, "resources")

# Fan in: pass a list of sources to the target
workflow.add_edge(["overview", "editorial", "alternatives", "similar_problems", "resources"], "validation")

workflow.add_conditional_edges("validation", should_revise, {
    "revise": "overview", # simple retry of one node to break loop
    "end": END
})

learning_hub_graph = workflow.compile()

# Explain simply function
async def explain_simply(problem: Dict[str, Any], highlighted_text: str) -> Dict[str, Any]:
    context = get_context_string(problem)
    user_prompt = f"{context}\n\nThe user highlighted the following text:\n\"\"{highlighted_text}\"\"\n\nPlease explain it simply."
    
    model = get_large_llm().with_structured_output(ExplainSimplyOutput, method="json_mode")
    parser = JsonOutputParser(pydantic_object=ExplainSimplyOutput)
    sys_prompt = EXPLAIN_SIMPLY_SYSTEM_PROMPT + "\n\n" + parser.get_format_instructions()
    res = await model.ainvoke([
        {"role": "system", "content": sys_prompt},
        {"role": "user", "content": user_prompt}
    ])
    return res.dict()
