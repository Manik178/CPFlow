from fastapi import APIRouter, HTTPException, Depends
from auth.dependencies import get_current_user, CurrentUser
import httpx
from bs4 import BeautifulSoup
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

# Simple in-memory cache to prevent Codeforces API rate-limiting
_analytics_cache = {}
CACHE_TTL = timedelta(hours=1)

@router.get("/codeforces/{handle}")
async def get_codeforces_analytics(handle: str, current_user: CurrentUser = Depends(get_current_user)):
    now = datetime.now()
    if handle in _analytics_cache and "codeforces" in _analytics_cache[handle]:
        cached_data, timestamp = _analytics_cache[handle]["codeforces"]
        if now - timestamp < CACHE_TTL:
            return cached_data

    async with httpx.AsyncClient() as client:
        try:
            # 1. Fetch user info
            info_res = await client.get(f"https://codeforces.com/api/user.info?handles={handle}")
            if info_res.status_code != 200:
                raise HTTPException(status_code=502, detail="Codeforces API is currently unavailable or rate limiting.")
            
            try:
                info_data = info_res.json()
            except Exception:
                raise HTTPException(status_code=502, detail="Codeforces returned invalid JSON.")
                
            if info_data.get("status") != "OK":
                raise HTTPException(status_code=400, detail="User not found")
            user_info = info_data["result"][0]

            # 2. Fetch rating history
            rating_res = await client.get(f"https://codeforces.com/api/user.rating?handle={handle}")
            rating_history = rating_res.json().get("result", [])

            # 3. Fetch submissions (for topics and heatmap)
            status_res = await client.get(f"https://codeforces.com/api/user.status?handle={handle}")
            submissions = status_res.json().get("result", [])

            # Aggregate stats
            topic_counts = {}
            solved_problems = set()
            heatmap_data = {}

            for sub in submissions:
                if sub.get("verdict") == "OK":
                    # Unique problem identifier
                    prob = sub.get("problem", {})
                    prob_id = f"{prob.get('contestId', '')}{prob.get('index', '')}"
                    
                    if prob_id not in solved_problems:
                        solved_problems.add(prob_id)
                        # Aggregate topics
                        for tag in prob.get("tags", []):
                            topic_counts[tag] = topic_counts.get(tag, 0) + 1
                    
                    # Aggregate heatmap (count solves per day)
                    date_str = datetime.fromtimestamp(sub["creationTimeSeconds"]).strftime("%Y-%m-%d")
                    heatmap_data[date_str] = heatmap_data.get(date_str, 0) + 1

            # Format for frontend Recharts
            formatted_topics = [{"name": k, "value": v} for k, v in topic_counts.items()]
            # Sort top 10 topics
            formatted_topics = sorted(formatted_topics, key=lambda x: x["value"], reverse=True)[:10]

            formatted_history = [{
                "contestName": r["contestName"],
                "rating": r["newRating"],
                "date": datetime.fromtimestamp(r["ratingUpdateTimeSeconds"]).strftime("%Y-%m-%d")
            } for r in rating_history]

            result = {
                "handle": handle,
                "rating": user_info.get("rating", 0),
                "maxRating": user_info.get("maxRating", 0),
                "rank": user_info.get("rank", "unrated"),
                "totalSolved": len(solved_problems),
                "ratingHistory": formatted_history,
                "topicDistribution": formatted_topics,
                "heatmap": [{"date": k, "count": v} for k, v in heatmap_data.items()]
            }

            # Update cache
            if handle not in _analytics_cache:
                _analytics_cache[handle] = {}
            _analytics_cache[handle]["codeforces"] = (result, now)

            return result

        except Exception as e:
            print("Analytics Fetch Error:", e)
            raise HTTPException(status_code=500, detail="Failed to fetch analytics from Codeforces")


@router.get("/leetcode/{handle}")
async def get_leetcode_analytics(handle: str, current_user: CurrentUser = Depends(get_current_user)):
    now = datetime.now()
    if handle in _analytics_cache and "leetcode" in _analytics_cache[handle]:
        cached_data, timestamp = _analytics_cache[handle]["leetcode"]
        if now - timestamp < CACHE_TTL:
            return cached_data

    # LeetCode GraphQL API payload
    query = """
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        profile {
          ranking
        }
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
        userCalendar {
          submissionCalendar
        }
      }
      userContestRanking(username: $username) {
        rating
        globalRanking
      }
    }
    """
    
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(
                "https://leetcode.com/graphql",
                json={"query": query, "variables": {"username": handle}}
            )
            data = res.json().get("data", {})
            user_data = data.get("matchedUser")
            
            if not user_data:
                raise HTTPException(status_code=400, detail="LeetCode user not found")

            # Extract submissions
            submissions = user_data.get("submitStats", {}).get("acSubmissionNum", [])
            total_solved = next((item["count"] for item in submissions if item["difficulty"] == "All"), 0)
            easy_solved = next((item["count"] for item in submissions if item["difficulty"] == "Easy"), 0)
            med_solved = next((item["count"] for item in submissions if item["difficulty"] == "Medium"), 0)
            hard_solved = next((item["count"] for item in submissions if item["difficulty"] == "Hard"), 0)

            # Extract heatmap calendar
            calendar_data = user_data.get("userCalendar", {}).get("submissionCalendar", "{}")
            import json
            try:
                calendar_dict = json.loads(calendar_data)
                heatmap = []
                for timestamp, count in calendar_dict.items():
                    date_str = datetime.fromtimestamp(int(timestamp)).strftime("%Y-%m-%d")
                    heatmap.append({"date": date_str, "count": count})
            except:
                heatmap = []

            # Extract rating
            contest_data = data.get("userContestRanking") or {}
            rating = round(contest_data.get("rating", 0))

            result = {
                "handle": handle,
                "rating": rating,
                "totalSolved": total_solved,
                "difficultyDistribution": [
                    {"name": "Easy", "value": easy_solved, "fill": "#10B981"},
                    {"name": "Medium", "value": med_solved, "fill": "#F59E0B"},
                    {"name": "Hard", "value": hard_solved, "fill": "#EF4444"}
                ],
                "heatmap": heatmap
            }

            if handle not in _analytics_cache:
                _analytics_cache[handle] = {}
            _analytics_cache[handle]["leetcode"] = (result, now)

            return result

        except Exception as e:
            print("LeetCode Fetch Error:", e)
            raise HTTPException(status_code=500, detail="Failed to fetch analytics from LeetCode")

@router.get("/codechef/{handle}")
async def get_codechef_analytics(handle: str, current_user: CurrentUser = Depends(get_current_user)):
    now = datetime.now()
    if handle in _analytics_cache and "codechef" in _analytics_cache[handle]:
        cached_data, timestamp = _analytics_cache[handle]["codechef"]
        if now - timestamp < CACHE_TTL:
            return cached_data

    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"https://www.codechef.com/users/{handle}", follow_redirects=True)
            if res.status_code != 200:
                raise HTTPException(status_code=400, detail="CodeChef user not found")

            soup = BeautifulSoup(res.text, "html.parser")
            
            # Extract Rating
            rating_el = soup.select_one(".rating-number")
            rating = 0
            if rating_el:
                rating_str = rating_el.text.strip().replace("?", "")
                rating = int(rating_str) if rating_str.isdigit() else 0

            # Extract Global Rank
            rank = "Unrated"
            rank_el = soup.select_one(".rating-ranks .inline-list li a")
            if rank_el:
                rank = rank_el.text.strip()

            # Extract Total Solved
            total_solved = 0
            for h3 in soup.select("h3"):
                if "Total Problems Solved" in h3.text:
                    parts = h3.text.split(":")
                    if len(parts) > 1:
                        try:
                            total_solved = int(parts[1].strip())
                        except ValueError:
                            pass
                    break

            result = {
                "handle": handle,
                "rating": rating,
                "rank": rank,
                "totalSolved": total_solved
            }

            if handle not in _analytics_cache:
                _analytics_cache[handle] = {}
            _analytics_cache[handle]["codechef"] = (result, now)

            return result

        except Exception as e:
            print("CodeChef Fetch Error:", e)
            raise HTTPException(status_code=500, detail="Failed to fetch analytics from CodeChef")
