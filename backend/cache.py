# In-memory problem cache (acts as Redis fallback for local dev without Redis)
# In production, this would be replaced by Redis entirely.
_problem_cache: dict[str, dict] = {}
