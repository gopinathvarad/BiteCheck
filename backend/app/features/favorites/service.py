"""Favorites feature service for managing user favorites"""

from typing import Optional, List, Tuple
from app.core.database import get_supabase_client
from app.features.favorites.models import FavoriteItem, FavoriteProduct


class FavoritesService:
    """Service for favorites operations"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
    
    async def get_user_favorites(
        self,
        user_id: str,
        page: int = 1,
        limit: int = 20
    ) -> Tuple[List[FavoriteItem], int]:
        """
        Get paginated favorites for a user with product details
        
        Args:
            user_id: User ID
            page: Page number (1-indexed)
            limit: Items per page
            
        Returns:
            Tuple of (favorites list, total count)
        """
        try:
            offset = (page - 1) * limit
            
            # Get total count
            count_response = (
                self.supabase.table("favorites")
                .select("id", count="exact")
                .eq("user_id", user_id)
                .execute()
            )
            total_count = count_response.count or 0
            
            # Get paginated favorites with product data
            response = (
                self.supabase.table("favorites")
                .select("id, product_id, created_at, products(id, barcode, name, brand, images, health_score, nutri_score)")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
            
            favorites = []
            for row in response.data or []:
                product_data = row.get("products")
                product = None
                if product_data:
                    product = FavoriteProduct(
                        id=product_data.get("id"),
                        barcode=product_data.get("barcode"),
                        name=product_data.get("name", "Unknown Product"),
                        brand=product_data.get("brand"),
                        images=product_data.get("images"),
                        health_score=product_data.get("health_score"),
                        nutri_score=product_data.get("nutri_score"),
                    )
                
                favorites.append(FavoriteItem(
                    id=row["id"],
                    product_id=row["product_id"],
                    product=product,
                    created_at=row["created_at"],
                ))
            
            return favorites, total_count
            
        except Exception as e:
            print(f"Error fetching user favorites: {e}")
            raise
    
    async def add_favorite(self, user_id: str, product_id: str) -> Optional[str]:
        """
        Add a product to user's favorites
        
        Args:
            user_id: User ID
            product_id: Product ID to add
            
        Returns:
            Favorite ID if created, None if already exists
        """
        try:
            # Check if already favorited
            existing = (
                self.supabase.table("favorites")
                .select("id")
                .eq("user_id", user_id)
                .eq("product_id", product_id)
                .execute()
            )
            
            if existing.data and len(existing.data) > 0:
                # Already favorited, return existing ID
                return existing.data[0]["id"]
            
            # Add to favorites
            response = (
                self.supabase.table("favorites")
                .insert({
                    "user_id": user_id,
                    "product_id": product_id
                })
                .execute()
            )
            
            if response.data and len(response.data) > 0:
                return response.data[0]["id"]
            return None
            
        except Exception as e:
            print(f"Error adding favorite: {e}")
            raise
    
    async def remove_favorite(self, user_id: str, product_id: str) -> bool:
        """
        Remove a product from user's favorites
        
        Args:
            user_id: User ID
            product_id: Product ID to remove
            
        Returns:
            True if removed successfully
        """
        try:
            response = (
                self.supabase.table("favorites")
                .delete()
                .eq("user_id", user_id)
                .eq("product_id", product_id)
                .execute()
            )
            return True
        except Exception as e:
            print(f"Error removing favorite: {e}")
            raise
    
    async def is_favorite(self, user_id: str, product_id: str) -> Tuple[bool, Optional[str]]:
        """
        Check if a product is in user's favorites
        
        Args:
            user_id: User ID
            product_id: Product ID to check
            
        Returns:
            Tuple of (is_favorite, favorite_id)
        """
        try:
            response = (
                self.supabase.table("favorites")
                .select("id")
                .eq("user_id", user_id)
                .eq("product_id", product_id)
                .execute()
            )
            
            if response.data and len(response.data) > 0:
                return True, response.data[0]["id"]
            return False, None
            
        except Exception as e:
            print(f"Error checking favorite status: {e}")
            raise
