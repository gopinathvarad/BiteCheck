"""Scan feature service"""

from typing import Optional
from app.entities.product.models import Product
from app.features.product.service import ProductService


class ScanService:
    """Service for scan operations"""
    
    def __init__(self):
        self.product_service = ProductService()
    
    async def scan_product(
        self,
        code: str,
        code_type: Optional[str] = None,
        country: Optional[str] = None
    ) -> Optional[Product]:
        """
        Scan a product by barcode or QR code
        
        Query order:
        1. Supabase products table
        2. Open Food Facts API
        3. Store in Supabase if found
        """
        return await self.product_service.lookup_product(
            code=code,
            code_type=code_type,
            country=country
        )

