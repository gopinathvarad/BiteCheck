"""User endpoints"""

from fastapi import APIRouter, HTTPException
from app.features.user.models import UserPreferencesRequest
from app.features.user.service import UserService

router = APIRouter()


@router.get("/me")
async def get_current_user():
    """
    Get current user profile and preferences
    
    Note: This endpoint will require authentication in the future
    """
    # TODO: Implement authentication
    raise HTTPException(
        status_code=501,
        detail="Not implemented yet"
    )


@router.post("/preferences")
async def update_preferences(request: UserPreferencesRequest):
    """
    Update user preferences (allergies, diets, etc.)
    
    - **allergies**: List of allergen names
    - **diets**: List of diet types (vegetarian, vegan, etc.)
    - **preferences**: Additional preferences as key-value pairs
    """
    # TODO: Implement authentication and preference update
    raise HTTPException(
        status_code=501,
        detail="Not implemented yet"
    )

