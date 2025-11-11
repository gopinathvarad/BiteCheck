"""Product service for product lookup and management"""

from typing import Optional
from app.core.database import get_supabase_client
from app.models.product import Product
from app.external.openfoodfacts import OpenFoodFactsClient


class ProductService:
    """Service for product operations"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
        self.off_client = OpenFoodFactsClient()
    
    async def lookup_product(
        self,
        code: str,
        code_type: Optional[str] = None,
        country: Optional[str] = None
    ) -> Optional[Product]:
        """
        Lookup product by barcode/QR code
        
        Query order:
        1. Supabase products table
        2. Open Food Facts API
        3. Store in Supabase if found
        """
        # First, try Supabase
        product = await self._get_product_from_db(code)
        if product:
            return product
        
        # Fallback to Open Food Facts
        product = await self.off_client.get_product_by_barcode(code)
        if product:
            # Store in database for future lookups
            await self._save_product_to_db(product)
            return product
        
        return None
    
    async def get_product_by_id(self, product_id: str) -> Optional[Product]:
        """Get product by ID from database"""
        return await self._get_product_from_db_by_id(product_id)
    
    async def _get_product_from_db(self, barcode: str) -> Optional[Product]:
        """Get product from Supabase by barcode"""
        try:
            response = self.supabase.table("products").select("*").eq("barcode", barcode).execute()
            if response.data and len(response.data) > 0:
                return Product(**response.data[0])
            return None
        except Exception as e:
            print(f"Error fetching product from DB: {e}")
            return None
    
    async def _get_product_from_db_by_id(self, product_id: str) -> Optional[Product]:
        """Get product from Supabase by ID"""
        try:
            response = self.supabase.table("products").select("*").eq("id", product_id).execute()
            if response.data and len(response.data) > 0:
                return Product(**response.data[0])
            return None
        except Exception as e:
            print(f"Error fetching product from DB: {e}")
            return None
    
    async def _save_product_to_db(self, product: Product) -> bool:
        """Save product to Supabase"""
        try:
            product_dict = product.model_dump(exclude_none=True)
            self.supabase.table("products").insert(product_dict).execute()
            return True
        except Exception as e:
            print(f"Error saving product to DB: {e}")
            return False

