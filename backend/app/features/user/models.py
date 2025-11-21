"""User feature models"""

from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class UserPreferencesRequest(BaseModel):
    """User preferences update request"""
    allergies: Optional[List[str]] = None
    diets: Optional[List[str]] = None
    preferences: Optional[Dict] = None


class UserProfile(BaseModel):
    """User profile response model"""
    id: str
    email: Optional[str] = None
    user_metadata: Optional[Dict] = None
    allergies: Optional[List[str]] = None
    diets: Optional[List[str]] = None
    preferences: Optional[Dict] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

