"""Product endpoints"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from app.features.product.service import ProductService
from app.features.user.service import UserService
from app.core.auth import get_current_user
from fastapi.security import HTTPAuthorizationCredentials

router = APIRouter()


@router.get("/{product_id}")
async def get_product(
    product_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Get product details by ID
    
    - **product_id**: UUID of the product
    
    If user is authenticated (via Authorization header), compares product allergens 
    with user allergies and populates warnings field with matching allergens.
    """
    try:
        product_service = ProductService()
        product = await product_service.get_product_by_id(product_id)
        
        if not product:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )
        
        # Try to get user allergies if authenticated
        if authorization and authorization.startswith("Bearer "):
            try:
                # Extract token from "Bearer <token>"
                token = authorization.split(" ")[1]
                credentials = HTTPAuthorizationCredentials(
                    scheme="Bearer",
                    credentials=token
                )
                
                # Get current user
                current_user = await get_current_user(credentials)
                
                # Fetch user profile to get allergies
                user_service = UserService()
                user_profile = await user_service.get_user_profile(
                    user_id=current_user["id"],
                    email=current_user.get("email"),
                    user_metadata=current_user.get("user_metadata", {})
                )
                
                # Compare allergens with user allergies
                if user_profile and user_profile.allergies and product.allergens:
                    # Find matching allergens (case-insensitive comparison)
                    user_allergies_lower = [a.lower() for a in user_profile.allergies]
                    matching_allergens = [
                        allergen for allergen in product.allergens
                        if allergen.lower() in user_allergies_lower
                    ]
                    
                    if matching_allergens:
                        product.warnings = matching_allergens
            except Exception as e:
                # If auth fails, just continue without warnings
                # This allows unauthenticated users to still view products
                print(f"Error checking user allergies: {e}")
                pass
        
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching product: {str(e)}"
        )



