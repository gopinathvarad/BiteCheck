"""Corrections endpoints"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Optional
from app.features.correction.models import CorrectionRequest
from app.features.correction.service import CorrectionService

router = APIRouter()


@router.post("")
async def submit_correction(
    request: CorrectionRequest,
    photo: Optional[UploadFile] = File(None)
):
    """
    Submit a correction for product data
    
    - **product_id**: UUID of the product
    - **field_name**: Name of the field to correct
    - **old_value**: Current value
    - **new_value**: Proposed new value
    - **photo**: Optional photo evidence
    """
    # TODO: Implement correction submission with photo upload
    raise HTTPException(
        status_code=501,
        detail="Not implemented yet"
    )

