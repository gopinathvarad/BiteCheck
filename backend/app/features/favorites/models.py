"""Favorites feature models"""

from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime


class FavoriteProduct(BaseModel):
    """Product data within a favorite"""
    id: str
    barcode: Optional[str] = None
    name: str
    brand: Optional[str] = None
    images: Optional[List[str]] = None
    health_score: Optional[int] = None
    nutri_score: Optional[str] = None


class FavoriteItem(BaseModel):
    """A single favorite item"""
    id: str
    product_id: str
    product: Optional[FavoriteProduct] = None
    created_at: str


class FavoritesListData(BaseModel):
    """Paginated list of favorites"""
    favorites: List[FavoriteItem]
    page: int
    total_pages: int
    total_count: int


class AddFavoriteRequest(BaseModel):
    """Request to add a product to favorites"""
    product_id: str


class FavoriteStatusData(BaseModel):
    """Response for checking favorite status"""
    is_favorite: bool
    favorite_id: Optional[str] = None
