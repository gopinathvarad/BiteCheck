"""Favorites endpoints"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import Dict, Any
from app.features.favorites.models import (
    FavoriteItem,
    FavoritesListData,
    AddFavoriteRequest,
    FavoriteStatusData,
)
from app.features.favorites.service import FavoritesService
from app.core.auth import get_current_user
from app.shared.models.response import APIResponse

router = APIRouter()


@router.get("", response_model=APIResponse[FavoritesListData])
async def get_favorites(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get paginated list of user's favorite products
    
    Returns favorites with product details, ordered by most recently added.
    """
    user_id = current_user["id"]
    service = FavoritesService()
    
    try:
        favorites, total_count = await service.get_user_favorites(
            user_id=user_id,
            page=page,
            limit=limit
        )
        
        total_pages = max(1, (total_count + limit - 1) // limit)
        
        return APIResponse(
            success=True,
            data=FavoritesListData(
                favorites=favorites,
                page=page,
                total_pages=total_pages,
                total_count=total_count
            ),
            message="Favorites retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching favorites: {str(e)}"
        )


@router.post("", response_model=APIResponse[FavoriteItem])
async def add_favorite(
    request: AddFavoriteRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Add a product to user's favorites
    
    If the product is already favorited, returns the existing favorite.
    """
    user_id = current_user["id"]
    service = FavoritesService()
    
    try:
        favorite_id = await service.add_favorite(
            user_id=user_id,
            product_id=request.product_id
        )
        
        if not favorite_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add favorite"
            )
        
        # Get the favorite with product details
        favorites, _ = await service.get_user_favorites(
            user_id=user_id,
            page=1,
            limit=1
        )
        
        # Find the newly added favorite
        favorite = None
        for f in favorites:
            if f.id == favorite_id:
                favorite = f
                break
        
        if not favorite:
            # Fallback - return minimal data
            favorite = FavoriteItem(
                id=favorite_id,
                product_id=request.product_id,
                product=None,
                created_at=""
            )
        
        return APIResponse(
            success=True,
            data=favorite,
            message="Product added to favorites"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding favorite: {str(e)}"
        )


@router.delete("/{product_id}", response_model=APIResponse[Dict[str, bool]])
async def remove_favorite(
    product_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Remove a product from user's favorites
    """
    user_id = current_user["id"]
    service = FavoritesService()
    
    try:
        await service.remove_favorite(
            user_id=user_id,
            product_id=product_id
        )
        
        return APIResponse(
            success=True,
            data={"removed": True},
            message="Product removed from favorites"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing favorite: {str(e)}"
        )


@router.get("/{product_id}/check", response_model=APIResponse[FavoriteStatusData])
async def check_favorite_status(
    product_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Check if a product is in user's favorites
    """
    user_id = current_user["id"]
    service = FavoritesService()
    
    try:
        is_favorite, favorite_id = await service.is_favorite(
            user_id=user_id,
            product_id=product_id
        )
        
        return APIResponse(
            success=True,
            data=FavoriteStatusData(
                is_favorite=is_favorite,
                favorite_id=favorite_id
            ),
            message="Favorite status checked"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking favorite status: {str(e)}"
        )
