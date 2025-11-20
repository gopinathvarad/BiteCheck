"""Correction feature models"""

from pydantic import BaseModel
from typing import Optional


class CorrectionRequest(BaseModel):
    """Correction submission request"""
    product_id: str
    field_name: str
    old_value: str
    new_value: str
    photo_url: Optional[str] = None

