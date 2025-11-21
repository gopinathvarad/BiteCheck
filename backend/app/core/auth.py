"""Authentication dependencies for FastAPI routes"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from typing import Dict, Any
from jose import jwt, JWTError
from app.core.database import get_supabase_client
from app.core.config import settings

# HTTP Bearer token security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase_client)
) -> Dict[str, Any]:
    """
    Extract and validate user from JWT token
    
    Validates the JWT token using Supabase's get_user method.
    The Supabase client validates the token signature and expiration.
    
    Args:
        credentials: HTTP Bearer token credentials
        supabase: Supabase client instance
        
    Returns:
        User dictionary with user information:
        - id: User UUID
        - email: User email
        - user_metadata: User metadata dictionary
        - app_metadata: App metadata dictionary
        
    Raises:
        HTTPException: If token is invalid, expired, or user not found
    """
    token = credentials.credentials
    
    try:
        # Use Supabase client to verify token and get user
        # Create a temporary client instance with the token for validation
        # The get_user method will validate the JWT token signature and expiration
        
        # Note: Supabase Python client's get_user() requires a session
        # For backend validation, we decode the JWT directly
        # Supabase JWT tokens are signed with the anon key or service role key
        
        # Verify token using Supabase anon key (used to sign user tokens)
        # Supabase uses HS256 algorithm and signs with the anon key
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_ANON_KEY,
                algorithms=["HS256"],
                options={"verify_exp": True}
            )
        except JWTError:
            # If anon key doesn't work, try service role key
            # (though user tokens should be signed with anon key)
            payload = jwt.decode(
                token,
                settings.SUPABASE_KEY,
                algorithms=["HS256"],
                options={"verify_exp": True}
            )
        
        # Extract user information from JWT payload
        user_id = payload.get("sub")
        email = payload.get("email")
        user_metadata = payload.get("user_metadata", {})
        app_metadata = payload.get("app_metadata", {})
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Return user data as dictionary
        return {
            "id": user_id,
            "email": email,
            "user_metadata": user_metadata,
            "app_metadata": app_metadata,
        }
        
    except HTTPException:
        raise
    except JWTError as e:
        # Handle JWT-specific errors
        error_msg = str(e)
        if "expired" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        # Handle other authentication errors
        error_message = str(e)
        
        # Generic authentication error
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {error_message}",
            headers={"WWW-Authenticate": "Bearer"},
        )

