"""Scan endpoint for barcode/QR code scanning"""

from fastapi import APIRouter, HTTPException
from app.features.scan.models import ScanRequest
from app.features.scan.service import ScanService

router = APIRouter()


@router.post("")
async def scan_product(request: ScanRequest):
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
        
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error scanning product: {str(e)}"
        )

