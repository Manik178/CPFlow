from pydantic import BaseModel, Field
from typing import List, Optional

class OverviewOutput(BaseModel):
    summary: str = Field(description="A concise 1-2 sentence summary of what the problem is asking.")
    concepts: List[str] = Field(description="Core concepts required to solve the problem (e.g., Dynamic Programming, Graph Theory).")
    tags: List[str] = Field(description="Tags associated with the problem.")
    difficulty: str = Field(description="Estimated difficulty of the problem.")
    expected_time_complexity: str = Field(description="The expected time complexity of an optimal solution.")
    expected_space_complexity: str = Field(description="The expected space complexity of an optimal solution.")
    key_insight: str = Field(description="The 'aha' moment or key insight required to solve it, in 1-2 sentences.")

class EditorialOutput(BaseModel):
    markdown_content: str = Field(description="A full, production-quality editorial written in Markdown. Include step-by-step explanations, math notation where appropriate, and clean code blocks.")

class AlternativeApproach(BaseModel):
    name: str = Field(description="Name of the approach.")
    algorithm: str = Field(description="Explanation of the algorithm.")
    time_complexity: str = Field(description="Time complexity.")
    space_complexity: str = Field(description="Space complexity.")
    advantages: str = Field(description="Advantages of this approach.")
    disadvantages: str = Field(description="Disadvantages of this approach.")
    when_to_use: str = Field(description="When is this approach preferred over others?")

class AlternativesOutput(BaseModel):
    approaches: List[AlternativeApproach] = Field(description="List of alternative correct approaches.")

class SimilarProblem(BaseModel):
    name: str = Field(description="Problem name/title.")
    url: str = Field(description="Link to the problem.")
    platform: str = Field(description="Platform (e.g., Codeforces, CSES).")
    relation: str = Field(description="How is it related? ('Easier', 'Similar', 'Harder').")
    reasoning: str = Field(description="Brief reason why it's recommended.")

class SimilarProblemsOutput(BaseModel):
    problems: List[SimilarProblem] = Field(description="List of similar problems.")

class Resource(BaseModel):
    title: str = Field(description="Title of the resource (e.g., 'Official Editorial').")
    url: str = Field(description="URL to the resource.")
    type: str = Field(description="Type of resource ('Video', 'Blog', 'Tutorial').")

class ResourcesOutput(BaseModel):
    resources: List[Resource] = Field(description="List of high quality external resources.")

class ValidationOutput(BaseModel):
    is_valid: bool = Field(description="True if all generated content is accurate and safe.")
    feedback: str = Field(description="Feedback on what needs to be fixed if invalid.")

class ExplainSimplyOutput(BaseModel):
    markdown_content: str = Field(description="Simplified explanation of the highlighted text.")


OVERVIEW_SYSTEM_PROMPT = """You are an expert competitive programming instructor.
Given the problem statement, constraints, and samples, generate a concise overview.
Do not write code. Keep the summary and insight extremely concise (max 30 seconds reading time).
You must output strictly in JSON format.
"""

EDITORIAL_SYSTEM_PROMPT = """You are an elite competitive programming educator.
Write a production-quality editorial for the provided problem.
It must teach the intuition and step-by-step logic.
Use Markdown formatting, LaTeX for math, and clear code blocks.
Do not just provide a solution; explain *why* it works.
You must output strictly in JSON format.
"""

ALTERNATIVES_SYSTEM_PROMPT = """You are a senior algorithmic strategist.
Analyze the problem and provide multiple distinct, correct approaches.
Compare their time/space complexities and trade-offs.
Do not invent hallucinated or invalid approaches. If there is only one reasonable approach, just list that one.
You must output strictly in JSON format.
"""

SIMILAR_PROBLEMS_SYSTEM_PROMPT = """You are an expert problem curator.
Based on the problem concepts, recommend 3-5 genuinely related problems from Codeforces, CSES, CodeChef, or Leetcode.
Group them as Easier, Similar, or Harder. Provide real problem names. 
If the problem is on Codeforces, provide the direct Codeforces URL (e.g., https://codeforces.com/contest/...). 
For all other platforms, DO NOT GUESS the direct link as it will result in a 404. Instead, YOU MUST provide a Google search link formatted exactly like this: https://www.google.com/search?q=[Platform]+[Problem+Name] (replace spaces with +).
You must output strictly in JSON format.
"""

RESOURCES_SYSTEM_PROMPT = """You are a competitive programming librarian.
Given the problem details, curate a list of high-quality external resources (e.g., official editorials, specific algorithm tutorials).
Only recommend real, trusted sites (Codeforces blogs, CP-Algorithms, USACO Guide).
For the `url` field, DO NOT GUESS the direct link as it will result in a 404. Instead, YOU MUST provide a Google search link formatted exactly like this: https://www.google.com/search?q=[Topic]+[Site+Name] (replace spaces with +).
You must output strictly in JSON format.
"""

VALIDATOR_SYSTEM_PROMPT = """You are a strict quality control agent.
Review the outputs produced by other agents.
Verify complexity claims, check for hallucinations, and ensure no unintended contest hints or direct code generation for active contests are leaked.
If everything is accurate and educational, return is_valid=True. Otherwise, provide specific feedback to correct it.
You must output strictly in JSON format.
"""

EXPLAIN_SIMPLY_SYSTEM_PROMPT = """You are a patient, intuitive programming tutor.
The user has highlighted a specific part of a problem or editorial and wants it explained simply.
Simplify the explanation, focus on intuition, and explain why it works.
Never generate an entirely new solution code. Just explain the highlighted concept clearly.
You must output strictly in JSON format.
"""
