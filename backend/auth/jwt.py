import jwt
import os
from typing import Optional
from fastapi import HTTPException, status

INTERNAL_API_SECRET = os.getenv("INTERNAL_API_SECRET", "super-secret-internal-key-for-dev")
ALGORITHM = "HS256"

class CurrentUser:
    def __init__(self, user_id: str, email: Optional[str] = None):
        self.id = user_id
        self.email = email

def verify_token(token: str) -> CurrentUser:
    """
    Decodes the JWT and returns the CurrentUser.
    Raises HTTPException if invalid or expired.
    """
    try:
        payload = jwt.decode(token, INTERNAL_API_SECRET, algorithms=[ALGORITHM])
        user_id = payload.get("userId")
        email = payload.get("email")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials (missing user ID)",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        return CurrentUser(user_id=user_id, email=email)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
