"""Admin authentication and authorization"""

from fastapi import HTTPException, status, Depends, Header
from typing import Optional
import os
from app.core.database import get_supabase_client


async def verify_admin_user(authorization: Optional[str] = Header(None)) -> str:
    """
    Verify that the request is from an authenticated admin user.
    
    Returns the admin user ID if valid, raises HTTPException otherwise.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    # Extract token from "Bearer <token>" format
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid authentication scheme")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )
    
    # Verify token with Supabase
    supabase = get_supabase_client()
    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        user_id = user.id
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )
    
    # Check if user is in admin allowlist
    admin_user_ids = os.getenv("ADMIN_USER_IDS", "").split(",")
    admin_user_ids = [uid.strip() for uid in admin_user_ids if uid.strip()]
    
    if user_id not in admin_user_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have admin privileges"
        )
    
    return user_id


def get_admin_user_id(admin_user_id: str = Depends(verify_admin_user)) -> str:
    """
    FastAPI dependency to get the authenticated admin user ID.
    Use this in route handlers that require admin access.
    """
    return admin_user_id
