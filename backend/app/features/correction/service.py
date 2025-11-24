from typing import Optional
import uuid
from app.core.database import get_supabase_client
from app.features.correction.schemas import CorrectionCreate
from app.entities.correction.models import Correction

class CorrectionService:
    """Service for correction operations"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
    
    async def submit_correction(
        self,
        correction_data: CorrectionCreate,
        photo_file: Optional[bytes] = None,
        photo_filename: Optional[str] = None,
        photo_content_type: Optional[str] = None
    ) -> Correction:
        """Submit a new correction"""
        
        photo_url = None
        if photo_file and photo_filename:
            # Generate unique filename
            file_ext = photo_filename.split('.')[-1] if '.' in photo_filename else 'jpg'
            storage_filename = f"{uuid.uuid4()}.{file_ext}"
            
            # Upload to Supabase Storage
            try:
                self.supabase.storage.from_("corrections").upload(
                    path=storage_filename,
                    file=photo_file,
                    file_options={"content-type": photo_content_type or "image/jpeg"}
                )
                
                # Get public URL
                photo_url = self.supabase.storage.from_("corrections").get_public_url(storage_filename)
            except Exception as e:
                print(f"Error uploading photo: {e}")
                # Continue without photo if upload fails? Or raise error?
                # For now, log and continue
        
        # Create correction record
        correction_dict = correction_data.model_dump()
        correction_dict["photo_url"] = photo_url
        correction_dict["status"] = "pending"
        
        response = self.supabase.table("corrections").insert(correction_dict).execute()
        
        if response.data and len(response.data) > 0:
            return Correction(**response.data[0])
            
        raise Exception("Failed to create correction record")

