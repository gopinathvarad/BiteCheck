"""Scan endpoint for barcode/QR code scanning"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from app.features.scan.models import ScanRequest
from app.features.scan.service import ScanService
from app.shared.models.response import APIResponse
from app.entities.product.models import Product
from app.features.user.service import UserService
from app.core.auth import get_current_user
from fastapi.security import HTTPAuthorizationCredentials

router = APIRouter()


@router.post("", response_model=APIResponse[Product])
async def scan_product(
    request: ScanRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Scan a product by barcode or QR code
    
    - **code**: Barcode or QR code value
    - **type**: Optional code type (EAN, UPC, QR, etc.)
    - **country**: Optional country code for region-specific lookups
    """
    try:
        scan_service = ScanService()
        product = await scan_service.scan_product(
            code=request.code,
            code_type=request.type,
            country=request.country
        )
        
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
                    user_allergies_lower = {a.lower() for a in user_profile.allergies}
                    matching_allergens = []
                    
                    for allergen in product.allergens:
                        # Handle prefixes like "en:peanuts" -> "peanuts"
                        clean_allergen = allergen
                        if ":" in allergen:
                            clean_allergen = allergen.split(":")[-1]
                        
                        if clean_allergen.strip().lower() in user_allergies_lower:
                            matching_allergens.append(clean_allergen.strip())
                    
                    if matching_allergens:
                        product.warnings = matching_allergens
            except Exception as e:
                # If auth fails, just continue without warnings
                # This allows unauthenticated users to still view products
                print(f"Error checking user allergies: {e}")
                pass
        
        return APIResponse(
            success=True,
            data=product,
            message="Product scanned successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error scanning product: {str(e)}"
        )

