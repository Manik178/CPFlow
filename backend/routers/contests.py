from fastapi import APIRouter, HTTPException
import httpx
from datetime import datetime, timedelta

router = APIRouter(prefix="/contests", tags=["contests"])

# Cache upcoming contests
_contests_cache = {"data": None, "timestamp": datetime.min}
CACHE_TTL = timedelta(hours=1)

@router.get("/")
async def get_upcoming_contests():
    now = datetime.now()
    if now - _contests_cache["timestamp"] < CACHE_TTL and _contests_cache["data"]:
        return _contests_cache["data"]

    contests = []
    async with httpx.AsyncClient() as client:
        try:
            # 1. Codeforces Contests
            cf_res = await client.get("https://codeforces.com/api/contest.list?gym=false")
            cf_data = cf_res.json()
            if cf_data.get("status") == "OK":
                for c in cf_data["result"]:
                    if c["phase"] == "BEFORE":
                        contests.append({
                            "id": f"cf_{c['id']}",
                            "platform": "Codeforces",
                            "name": c["name"],
                            "startTime": c["startTimeSeconds"],
                            "durationSeconds": c["durationSeconds"],
                            "url": f"https://codeforces.com/contest/{c['id']}"
                        })
            
            # 2. LeetCode Contests
            lc_query = "query { topTwoContests { title titleSlug startTime duration } }"
            lc_res = await client.post("https://leetcode.com/graphql", json={"query": lc_query})
            lc_data = lc_res.json()
            if "data" in lc_data and "topTwoContests" in lc_data["data"]:
                for c in lc_data["data"]["topTwoContests"]:
                    if c["startTime"] > now.timestamp():
                        contests.append({
                            "id": f"lc_{c['titleSlug']}",
                            "platform": "LeetCode",
                            "name": c["title"],
                            "startTime": c["startTime"],
                            "durationSeconds": c["duration"],
                            "url": f"https://leetcode.com/contest/{c['titleSlug']}"
                        })

            # 3. CodeChef Contests
            cc_res = await client.get("https://www.codechef.com/api/list/contests/all")
            cc_data = cc_res.json()
            if cc_data.get("status") == "success":
                for c in cc_data.get("future_contests", []):
                    # CodeChef provides start time in ISO or custom string, but we can parse ISO
                    start_iso = c.get("contest_start_date_iso")
                    if start_iso:
                        try:
                            start_time = int(datetime.fromisoformat(start_iso).timestamp())
                            duration = int(c.get("contest_duration", 0)) * 60
                            contests.append({
                                "id": f"cc_{c['contest_code']}",
                                "platform": "CodeChef",
                                "name": c["contest_name"],
                                "startTime": start_time,
                                "durationSeconds": duration,
                                "url": f"https://www.codechef.com/{c['contest_code']}"
                            })
                        except Exception:
                            pass

            # Sort upcoming contests chronologically
            contests.sort(key=lambda x: x["startTime"])
            
            _contests_cache["data"] = contests
            _contests_cache["timestamp"] = now

            return contests

        except Exception as e:
            print("Contest Fetch Error:", e)
            raise HTTPException(status_code=500, detail="Failed to fetch upcoming contests")
