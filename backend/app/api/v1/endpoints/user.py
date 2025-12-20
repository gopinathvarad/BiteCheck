"""User endpoints"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.features.user.models import UserPreferencesRequest, UserProfile
from app.features.user.service import UserService
from app.core.auth import get_current_user
from app.core.database import get_supabase_client
from app.shared.models.response import APIResponse

router = APIRouter()


# ============== Models for History Endpoints ==============

class ScanHistoryItem(BaseModel):
    id: str
    barcode: str
    product: Optional[Dict[str, Any]] = None
    scannedAt: str
    isLocal: bool = False


class ScanHistoryData(BaseModel):
    scans: List[ScanHistoryItem]
    page: int
    total_pages: int
    total_count: int


class MigrateScanItem(BaseModel):
    barcode: str
    product_id: Optional[str] = None
    result_snapshot: Dict[str, Any]
    scanned_at: str


class MigrateScansRequest(BaseModel):
    scans: List[MigrateScanItem]


class MigrateScansData(BaseModel):
    migrated_count: int


# ============== Existing Endpoints ==============

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


# ============== History Endpoints ==============

@router.get("/history", response_model=APIResponse[ScanHistoryData])
async def get_scan_history(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get paginated scan history for the authenticated user
    
    Returns scans from the database, ordered by most recent first.
    """
    user_id = current_user["id"]
    supabase = get_supabase_client()
    
    try:
        # Calculate offset
        offset = (page - 1) * limit
        
        # Get total count
        count_response = supabase.table("scans").select("id", count="exact").eq("user_id", user_id).execute()
        total_count = count_response.count or 0
        
        # Get paginated scans
        response = (
            supabase.table("scans")
            .select("id, barcode, product_id, result_snapshot, scanned_at")
            .eq("user_id", user_id)
            .order("scanned_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        # Transform to response format
        scans = []
        for scan in response.data or []:
            scans.append(ScanHistoryItem(
                id=scan["id"],
                barcode=scan["barcode"],
                product=scan.get("result_snapshot"),
                scannedAt=scan["scanned_at"],
                isLocal=False
            ))
        
        total_pages = max(1, (total_count + limit - 1) // limit)
        
        return APIResponse(
            success=True,
            data=ScanHistoryData(
                scans=scans,
                page=page,
                total_pages=total_pages,
                total_count=total_count
            ),
            message="Scan history retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching scan history: {str(e)}"
        )


@router.post("/history/migrate", response_model=APIResponse[MigrateScansData])
async def migrate_guest_scans(
    request: MigrateScansRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Migrate guest scans from local storage to the user's account
    
    Bulk inserts scans with the authenticated user's ID.
    """
    user_id = current_user["id"]
    supabase = get_supabase_client()
    
    if not request.scans:
        return APIResponse(
            success=True,
            data=MigrateScansData(migrated_count=0),
            message="No scans to migrate"
        )
    
    try:
        # Prepare records for insertion
        records = []
        for scan in request.scans:
            records.append({
                "user_id": user_id,
                "barcode": scan.barcode,
                "product_id": scan.product_id,
                "result_snapshot": scan.result_snapshot,
                "scanned_at": scan.scanned_at
            })
        
        # Bulk insert scans
        response = supabase.table("scans").insert(records).execute()
        
        migrated_count = len(response.data) if response.data else 0
        
        return APIResponse(
            success=True,
            data=MigrateScansData(migrated_count=migrated_count),
            message=f"Successfully migrated {migrated_count} scans"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error migrating scans: {str(e)}"
        )
