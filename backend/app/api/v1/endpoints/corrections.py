"""Corrections endpoints"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from typing import Optional
from app.features.correction.schemas import CorrectionCreate, CorrectionResponse
from app.features.correction.service import CorrectionService

router = APIRouter()


@router.post("", response_model=CorrectionResponse, status_code=status.HTTP_201_CREATED)
async def submit_correction(
    product_id: str = Form(...),
    field_name: str = Form(...),
    old_value: str = Form(...),
    new_value: str = Form(...),
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
    try:
        service = CorrectionService()
        
        correction_data = CorrectionCreate(
            product_id=product_id,
            field_name=field_name,
            old_value=old_value,
            new_value=new_value
        )
        
        photo_content = await photo.read() if photo else None
        photo_filename = photo.filename if photo else None
        photo_content_type = photo.content_type if photo else None
        
        result = await service.submit_correction(
            correction_data=correction_data,
            photo_file=photo_content,
            photo_filename=photo_filename,
            photo_content_type=photo_content_type
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit correction: {str(e)}"
        )

