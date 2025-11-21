"""User endpoints"""

from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any
from app.features.user.models import UserPreferencesRequest, UserProfile
from app.features.user.service import UserService
from app.core.auth import get_current_user
from app.shared.models.response import APIResponse

router = APIRouter()


@router.get("/me", response_model=APIResponse[UserProfile])
async def get_current_user_profile(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get current user profile and preferences
    
    Returns:
        User profile with preferences from users_meta table
    """
    user_service = UserService()
    user_id = current_user["id"]
    email = current_user.get("email")
    user_metadata = current_user.get("user_metadata", {})
    
    user_profile = await user_service.get_user_profile(
        user_id=user_id,
        email=email,
        user_metadata=user_metadata
    )
    
    if not user_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    return APIResponse(
        success=True,
        data=user_profile,
        message="User profile retrieved successfully"
    )


@router.post("/preferences", response_model=APIResponse[UserProfile])
async def update_preferences(
    request: UserPreferencesRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update user preferences (allergies, diets, etc.)
    
    - **allergies**: List of allergen names
    - **diets**: List of diet types (vegetarian, vegan, etc.)
    - **preferences**: Additional preferences as key-value pairs
    
    Creates users_meta record if it doesn't exist.
    """
    user_service = UserService()
    user_id = current_user["id"]
    
    try:
        await user_service.update_user_preferences(
            user_id=user_id,
            preferences=request
        )
        
        # Fetch updated profile
        email = current_user.get("email")
        user_metadata = current_user.get("user_metadata", {})
        updated_profile = await user_service.get_user_profile(
            user_id=user_id,
            email=email,
            user_metadata=user_metadata
        )
        
        if not updated_profile:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user preferences"
            )
        
        return APIResponse(
            success=True,
            data=updated_profile,
            message="User preferences updated successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating preferences: {str(e)}"
        )

