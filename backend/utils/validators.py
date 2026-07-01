import httpx
import asyncio

async def check_codeforces(handle: str) -> bool:
    if not handle: return True
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            resp = await client.get(f"https://codeforces.com/api/user.info?handles={handle}")
            if resp.status_code == 200:
                data = resp.json()
                if data.get("status") == "OK":
                    return True
            return False
        except Exception:
            return False

async def check_leetcode(handle: str) -> bool:
    if not handle: return True
    query = """
    query getUserProfile($username: String!) {
        matchedUser(username: $username) {
            username
        }
    }
    """
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            resp = await client.post(
                "https://leetcode.com/graphql", 
                json={"query": query, "variables": {"username": handle}},
                headers={"Content-Type": "application/json"}
            )
            if resp.status_code == 200:
                data = resp.json()
                if data.get("data") and data["data"].get("matchedUser"):
                    return True
            return False
        except Exception:
            return False

async def check_codechef(handle: str) -> bool:
    if not handle: return True
    # CodeChef might block bots, so we'll do a simple GET and accept 200.
    # If we get a 404, we assume it's invalid. If we get something else (like 403), we might want to just accept it to avoid false negatives.
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            resp = await client.get(f"https://www.codechef.com/users/{handle}")
            if resp.status_code == 404:
                return False
            # Anything else (200, 403) we'll assume it exists or we can't tell, so let it pass
            return True
        except Exception:
            return True # Don't block on network error

async def check_cses(handle: str) -> bool:
    if not handle: return True
    # CSES validation is tricky, so we'll just do a basic length check for now
    return len(handle) >= 3

async def validate_handles(handles: dict) -> list[str]:
    """
    Validates a dictionary of handles.
    Returns a list of invalid platforms.
    """
    tasks = []
    platforms = []
    
    if "codeforces" in handles and handles["codeforces"]:
        tasks.append(check_codeforces(handles["codeforces"]))
        platforms.append("Codeforces")
    
    if "leetcode" in handles and handles["leetcode"]:
        tasks.append(check_leetcode(handles["leetcode"]))
        platforms.append("LeetCode")
        
    if "codechef" in handles and handles["codechef"]:
        tasks.append(check_codechef(handles["codechef"]))
        platforms.append("CodeChef")
        
    if "cses" in handles and handles["cses"]:
        tasks.append(check_cses(handles["cses"]))
        platforms.append("CSES")
        
    results = await asyncio.gather(*tasks)
    
    invalid_platforms = []
    for is_valid, platform in zip(results, platforms):
        if not is_valid:
            invalid_platforms.append(platform)
            
    return invalid_platforms
