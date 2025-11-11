"""Database connection and session management"""

from supabase import create_client, Client
from app.core.config import settings
from typing import Optional

# Lazy initialization of Supabase client
_supabase_client: Optional[Client] = None

def get_supabase_client() -> Client:
    """Get Supabase client instance (lazy initialization)"""
    global _supabase_client
    if _supabase_client is None:
        try:
            _supabase_client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY
            )
        except Exception as e:
            # In development, allow app to start even with invalid credentials
            if settings.ENVIRONMENT == "development" and "placeholder" in settings.SUPABASE_URL:
                raise RuntimeError(
                    f"Supabase client initialization failed. Please configure valid Supabase credentials in .env file. Error: {e}"
                )
            raise
    return _supabase_client

