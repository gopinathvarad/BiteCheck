"""Shared response models for API endpoints"""

from pydantic import BaseModel
from typing import Generic, TypeVar, Optional
from datetime import datetime

T = TypeVar('T')


class APIResponse(BaseModel, Generic[T]):
    """Standard API response format"""
    success: bool
    data: T
    message: Optional[str] = None
    timestamp: str = datetime.utcnow().isoformat() + "Z"


class APIError(BaseModel):
    """Standard API error format"""
    success: bool = False
    error: str
    code: Optional[str] = None
    timestamp: str = datetime.utcnow().isoformat() + "Z"

