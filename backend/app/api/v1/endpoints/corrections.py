"""Corrections endpoints"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from app.services.correction_service import CorrectionService

router = APIRouter()


class CorrectionRequest(BaseModel):
    """Correction submission request"""
    product_id: str
    field_name: str
    old_value: str
    new_value: str
    photo_url: Optional[str] = None


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

