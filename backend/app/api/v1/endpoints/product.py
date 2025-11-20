"""Product endpoints"""

from fastapi import APIRouter, HTTPException
from app.features.product.service import ProductService

router = APIRouter()


@router.get("/{product_id}")
async def get_product(product_id: str):
    """
    Get product details by ID
    
    - **product_id**: UUID of the product
    """
    try:
        product_service = ProductService()
        product = await product_service.get_product_by_id(product_id)
        
        if not product:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )
        
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching product: {str(e)}"
        )

