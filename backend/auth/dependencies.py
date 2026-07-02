from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
import os
import time

from auth.jwt import verify_token, CurrentUser

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> CurrentUser:
    """
    Dependency to get the current authenticated user.
    Uses the token from the Authorization header.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return verify_token(token)

from cache import redis_client

# Basic redis-based token bucket for rate limiting
async def _redis_rate_limit(request: Request, key_prefix: str, limit: int, period: int):
    try:
        if not redis_client:
            return
            
        client_ip = request.client.host if request.client else "127.0.0.1"
        key = f"rate_limit:{key_prefix}:{client_ip}"
        
        current_time = int(time.time())
        window = current_time // period
        window_key = f"{key}:{window}"
        
        try:
            count = await redis_client.incr(window_key)
        except Exception:
            await redis_client.connection_pool.disconnect()
            count = await redis_client.incr(window_key)
            
        if count == 1:
            try:
                await redis_client.expire(window_key, period * 2)
            except Exception:
                pass
            
        if count > limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Maximum {limit} requests per {period} seconds."
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Rate limiting failed: {e}")

class RateLimiter:
    def __init__(self, requests: int, window: int):
        self.requests = requests
        self.window = window

    async def __call__(self, request: Request):
        await _redis_rate_limit(request, request.url.path, self.requests, self.window)
