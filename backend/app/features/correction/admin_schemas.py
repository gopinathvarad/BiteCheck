"""Admin-specific schemas for correction management"""

from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class CorrectionListItem(BaseModel):
    """Schema for correction in list view"""
    id: UUID
    product_id: str
    product_name: Optional[str] = None
    field_name: str
    old_value: str
    new_value: str
    photo_url: Optional[str] = None
    status: str
    submitted_at: datetime
    submitter_user_id: Optional[UUID] = None
    
    class Config:
        from_attributes = True


class CorrectionListResponse(BaseModel):
    """Paginated list of corrections"""
    corrections: List[CorrectionListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class CorrectionDetailResponse(BaseModel):
    """Detailed correction information for review"""
    id: UUID
    product_id: str
    product_name: Optional[str] = None
    product_barcode: Optional[str] = None
    field_name: str
    old_value: str
    new_value: str
    photo_url: Optional[str] = None
    status: str
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None
    submitter_user_id: Optional[UUID] = None
    reviewer_user_id: Optional[UUID] = None
    review_notes: Optional[str] = None
    
    class Config:
        from_attributes = True


class CorrectionApproveRequest(BaseModel):
    """Request to approve a correction"""
    notes: Optional[str] = Field(None, description="Optional admin notes for approval")


class CorrectionRejectRequest(BaseModel):
    """Request to reject a correction"""
    reason: str = Field(..., description="Required reason for rejection")


class AdminStatsResponse(BaseModel):
    """Dashboard statistics"""
    total_corrections: int
    pending_corrections: int
    approved_corrections: int
    rejected_corrections: int
    approval_rate: float
    recent_corrections: List[CorrectionListItem]
