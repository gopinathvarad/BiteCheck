"""Admin endpoints for correction management"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional
from uuid import UUID
from app.core.admin_auth import get_admin_user_id
from app.features.correction.admin_service import AdminCorrectionService
from app.features.correction.admin_schemas import (
    CorrectionListResponse,
    CorrectionDetailResponse,
    CorrectionApproveRequest,
    CorrectionRejectRequest,
    AdminStatsResponse
)

router = APIRouter()


@router.get("/corrections", response_model=CorrectionListResponse)
async def list_corrections(
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    admin_user_id: str = Depends(get_admin_user_id)
):
    """
    List all corrections with filtering and pagination.
    
    - **status**: Filter by status (pending, approved, rejected)
    - **page**: Page number (default: 1)
    - **page_size**: Items per page (default: 20, max: 100)
    """
    if page < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page must be >= 1"
        )
    
    if page_size < 1 or page_size > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page size must be between 1 and 100"
        )
    
    if status and status not in ["pending", "approved", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be one of: pending, approved, rejected"
        )
    
    try:
        service = AdminCorrectionService()
        return await service.list_corrections(
            status=status,
            page=page,
            page_size=page_size
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list corrections: {str(e)}"
        )


@router.get("/corrections/{correction_id}", response_model=CorrectionDetailResponse)
async def get_correction(
    correction_id: UUID,
    admin_user_id: str = Depends(get_admin_user_id)
):
    """
    Get detailed information about a specific correction.
    """
    try:
        service = AdminCorrectionService()
        correction = await service.get_correction_detail(correction_id)
        
        if not correction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Correction not found"
            )
        
        return correction
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get correction: {str(e)}"
        )


@router.patch("/corrections/{correction_id}/approve", response_model=CorrectionDetailResponse)
async def approve_correction(
    correction_id: UUID,
    request: CorrectionApproveRequest,
    admin_user_id: str = Depends(get_admin_user_id)
):
    """
    Approve a correction and apply changes to the product.
    
    This will:
    1. Update the correction status to 'approved'
    2. Apply the correction to the product
    3. Log the admin action
    """
    try:
        service = AdminCorrectionService()
        return await service.approve_correction(
            correction_id=correction_id,
            admin_user_id=admin_user_id,
            notes=request.notes
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve correction: {str(e)}"
        )


@router.patch("/corrections/{correction_id}/reject", response_model=CorrectionDetailResponse)
async def reject_correction(
    correction_id: UUID,
    request: CorrectionRejectRequest,
    admin_user_id: str = Depends(get_admin_user_id)
):
    """
    Reject a correction with a reason.
    
    This will:
    1. Update the correction status to 'rejected'
    2. Store the rejection reason
    3. Log the admin action
    
    The product will NOT be modified.
    """
    try:
        service = AdminCorrectionService()
        return await service.reject_correction(
            correction_id=correction_id,
            admin_user_id=admin_user_id,
            reason=request.reason
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reject correction: {str(e)}"
        )


@router.get("/stats", response_model=AdminStatsResponse)
async def get_stats(
    admin_user_id: str = Depends(get_admin_user_id)
):
    """
    Get dashboard statistics.
    
    Returns:
    - Total corrections count
    - Pending corrections count
    - Approved corrections count
    - Rejected corrections count
    - Approval rate percentage
    - Recent corrections (last 5)
    """
    try:
        service = AdminCorrectionService()
        return await service.get_stats()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stats: {str(e)}"
        )
