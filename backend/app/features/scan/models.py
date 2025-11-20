"""Scan feature models"""

from pydantic import BaseModel
from typing import Optional


class ScanRequest(BaseModel):
    """Scan request model"""
    code: str
    type: Optional[str] = None
    country: Optional[str] = None

