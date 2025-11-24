"""Correction entity models"""

from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

class Correction(BaseModel):
    """Correction domain model"""
    id: Optional[UUID] = None
    product_id: str
    field_name: str
    old_value: str
    new_value: str
    photo_url: Optional[str] = None
    status: str = "pending"  # pending, approved, rejected
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
