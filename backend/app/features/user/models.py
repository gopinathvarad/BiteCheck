"""User feature models"""

from pydantic import BaseModel
from typing import Optional, List, Dict


class UserPreferencesRequest(BaseModel):
    """User preferences update request"""
    allergies: Optional[List[str]] = None
    diets: Optional[List[str]] = None
    preferences: Optional[Dict] = None

