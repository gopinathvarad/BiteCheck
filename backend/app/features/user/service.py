"""User feature service for user preferences and profile management"""

from app.core.database import get_supabase_client


class UserService:
    """Service for user operations"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
    
    # TODO: Implement user preference methods
    pass

