"""Correction feature schemas"""

from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class CorrectionCreate(BaseModel):
    """Schema for creating a correction"""
    product_id: str
    field_name: str
    old_value: str
    new_value: str

class CorrectionResponse(BaseModel):
    """Schema for correction response"""
    id: UUID
    product_id: str
    field_name: str
    old_value: str
    new_value: str
    photo_url: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
