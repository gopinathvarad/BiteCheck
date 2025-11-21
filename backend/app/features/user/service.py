"""User feature service for user preferences and profile management"""

from typing import Optional, Dict, List
from app.core.database import get_supabase_client
from app.features.user.models import UserPreferencesRequest, UserProfile


class UserService:
    """Service for user operations"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
    
    async def get_user_profile(
        self,
        user_id: str,
        email: Optional[str] = None,
        user_metadata: Optional[Dict] = None
    ) -> Optional[UserProfile]:
        """
        Get user profile with preferences from users_meta table
        
        Args:
            user_id: Supabase Auth user ID
            email: User email (from JWT token)
            user_metadata: User metadata (from JWT token)
            
        Returns:
            UserProfile if found, None otherwise
        """
        try:
            # Fetch user metadata from users_meta table
            response = self.supabase.table("users_meta").select("*").eq("user_id", user_id).execute()
            
            user_meta = None
            if response.data and len(response.data) > 0:
                user_meta = response.data[0]
            
            # Combine auth user data (from JWT) with metadata from users_meta
            return UserProfile(
                id=user_id,
                email=email,
                user_metadata=user_metadata or {},
                allergies=user_meta.get("allergies") if user_meta else None,
                diets=user_meta.get("diets") if user_meta else None,
                preferences=user_meta.get("preferences") if user_meta else None,
                created_at=user_meta.get("created_at") if user_meta else None,
                updated_at=user_meta.get("updated_at") if user_meta else None,
            )
        except Exception as e:
            print(f"Error fetching user profile: {e}")
            return None
    
    async def update_user_preferences(
        self,
        user_id: str,
        preferences: UserPreferencesRequest
    ) -> bool:
        """
        Update user preferences (allergies, diets, preferences)
        Creates users_meta record if it doesn't exist
        
        Args:
            user_id: Supabase Auth user ID
            preferences: User preferences to update
            
        Returns:
            True if update was successful
        """
        try:
            # Check if users_meta record exists
            existing_response = self.supabase.table("users_meta").select("*").eq("user_id", user_id).execute()
            
            update_data = {}
            if preferences.allergies is not None:
                update_data["allergies"] = preferences.allergies
            if preferences.diets is not None:
                update_data["diets"] = preferences.diets
            if preferences.preferences is not None:
                update_data["preferences"] = preferences.preferences
            
            if existing_response.data and len(existing_response.data) > 0:
                # Update existing record
                response = (
                    self.supabase.table("users_meta")
                    .update(update_data)
                    .eq("user_id", user_id)
                    .execute()
                )
            else:
                # Create new record
                create_data = {
                    "user_id": user_id,
                    **update_data
                }
                response = self.supabase.table("users_meta").insert(create_data).execute()
            
            return True
            
        except Exception as e:
            print(f"Error updating user preferences: {e}")
            raise
    
    async def create_user_meta(
        self,
        user_id: str,
        preferences: Optional[UserPreferencesRequest] = None
    ) -> bool:
        """
        Create users_meta record for a user
        
        Args:
            user_id: Supabase Auth user ID
            preferences: Optional initial preferences
            
        Returns:
            True if created successfully, False otherwise
        """
        try:
            # Check if record already exists
            existing_response = self.supabase.table("users_meta").select("*").eq("user_id", user_id).execute()
            
            if existing_response.data and len(existing_response.data) > 0:
                return True  # Already exists
            
            # Create new record
            create_data = {"user_id": user_id}
            
            if preferences:
                if preferences.allergies is not None:
                    create_data["allergies"] = preferences.allergies
                if preferences.diets is not None:
                    create_data["diets"] = preferences.diets
                if preferences.preferences is not None:
                    create_data["preferences"] = preferences.preferences
            
            response = self.supabase.table("users_meta").insert(create_data).execute()
            return True
            
        except Exception as e:
            print(f"Error creating user meta: {e}")
            return False

