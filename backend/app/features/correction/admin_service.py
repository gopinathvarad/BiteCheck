"""Admin service for correction management"""

from typing import Optional, List
from uuid import UUID
from datetime import datetime
import math
from app.core.database import get_supabase_client
from app.features.correction.admin_schemas import (
    CorrectionListResponse,
    CorrectionListItem,
    CorrectionDetailResponse,
    AdminStatsResponse
)
from app.shared.audit import log_admin_action


class AdminCorrectionService:
    """Service for admin correction operations"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
    
    async def list_corrections(
        self,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> CorrectionListResponse:
        """
        List corrections with filtering and pagination.
        
        Args:
            status: Filter by status (pending, approved, rejected)
            page: Page number (1-indexed)
            page_size: Number of items per page
        """
        # Build query
        query = self.supabase.table("corrections").select(
            "*, products(name, barcode)",
            count="exact"
        )
        
        # Apply status filter
        if status:
            query = query.eq("status", status)
        
        # Apply ordering
        query = query.order("submitted_at", desc=True)
        
        # Get total count
        count_response = query.execute()
        total = len(count_response.data) if count_response.data else 0
        
        # Apply pagination
        offset = (page - 1) * page_size
        query = query.range(offset, offset + page_size - 1)
        
        # Execute query
        response = query.execute()
        
        # Transform data
        corrections = []
        for item in response.data:
            product_data = item.get("products", {}) if isinstance(item.get("products"), dict) else {}
            correction = CorrectionListItem(
                id=item["id"],
                product_id=item["product_id"],
                product_name=product_data.get("name"),
                field_name=item["field_name"],
                old_value=item["old_value"],
                new_value=item["new_value"],
                photo_url=item.get("photo_url"),
                status=item["status"],
                submitted_at=item["submitted_at"],
                submitter_user_id=item.get("submitter_user_id")
            )
            corrections.append(correction)
        
        total_pages = math.ceil(total / page_size) if total > 0 else 0
        
        return CorrectionListResponse(
            corrections=corrections,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    
    async def get_correction_detail(self, correction_id: UUID) -> Optional[CorrectionDetailResponse]:
        """Get detailed correction information"""
        response = self.supabase.table("corrections").select(
            "*, products(name, barcode)"
        ).eq("id", str(correction_id)).execute()
        
        if not response.data or len(response.data) == 0:
            return None
        
        item = response.data[0]
        product_data = item.get("products", {}) if isinstance(item.get("products"), dict) else {}
        
        return CorrectionDetailResponse(
            id=item["id"],
            product_id=item["product_id"],
            product_name=product_data.get("name"),
            product_barcode=product_data.get("barcode"),
            field_name=item["field_name"],
            old_value=item["old_value"],
            new_value=item["new_value"],
            photo_url=item.get("photo_url"),
            status=item["status"],
            submitted_at=item["submitted_at"],
            reviewed_at=item.get("reviewed_at"),
            submitter_user_id=item.get("submitter_user_id"),
            reviewer_user_id=item.get("reviewer_user_id"),
            review_notes=item.get("review_notes")
        )
    
    async def approve_correction(
        self,
        correction_id: UUID,
        admin_user_id: str,
        notes: Optional[str] = None
    ) -> CorrectionDetailResponse:
        """
        Approve a correction and apply changes to the product.
        
        Args:
            correction_id: UUID of the correction
            admin_user_id: UUID of the admin approving
            notes: Optional admin notes
        """
        # Get correction details
        correction = await self.get_correction_detail(correction_id)
        if not correction:
            raise ValueError("Correction not found")
        
        if correction.status != "pending":
            raise ValueError(f"Cannot approve correction with status: {correction.status}")
        
        # Update correction status
        update_data = {
            "status": "approved",
            "reviewed_at": datetime.utcnow().isoformat(),
            "reviewer_user_id": admin_user_id,
            "review_notes": notes
        }
        
        self.supabase.table("corrections").update(update_data).eq(
            "id", str(correction_id)
        ).execute()
        
        # Apply changes to product
        await self._apply_correction_to_product(correction)
        
        # Log audit
        await log_admin_action(
            admin_user_id=admin_user_id,
            action="approve_correction",
            resource_type="correction",
            resource_id=correction_id,
            details={
                "product_id": correction.product_id,
                "field_name": correction.field_name,
                "old_value": correction.old_value,
                "new_value": correction.new_value,
                "notes": notes
            }
        )
        
        # Return updated correction
        return await self.get_correction_detail(correction_id)
    
    async def reject_correction(
        self,
        correction_id: UUID,
        admin_user_id: str,
        reason: str
    ) -> CorrectionDetailResponse:
        """
        Reject a correction with a reason.
        
        Args:
            correction_id: UUID of the correction
            admin_user_id: UUID of the admin rejecting
            reason: Required reason for rejection
        """
        # Get correction details
        correction = await self.get_correction_detail(correction_id)
        if not correction:
            raise ValueError("Correction not found")
        
        if correction.status != "pending":
            raise ValueError(f"Cannot reject correction with status: {correction.status}")
        
        # Update correction status
        update_data = {
            "status": "rejected",
            "reviewed_at": datetime.utcnow().isoformat(),
            "reviewer_user_id": admin_user_id,
            "review_notes": reason
        }
        
        self.supabase.table("corrections").update(update_data).eq(
            "id", str(correction_id)
        ).execute()
        
        # Log audit
        await log_admin_action(
            admin_user_id=admin_user_id,
            action="reject_correction",
            resource_type="correction",
            resource_id=correction_id,
            details={
                "product_id": correction.product_id,
                "field_name": correction.field_name,
                "reason": reason
            }
        )
        
        # Return updated correction
        return await self.get_correction_detail(correction_id)
    
    async def get_stats(self) -> AdminStatsResponse:
        """Get dashboard statistics"""
        # Get all corrections
        all_corrections = self.supabase.table("corrections").select("*").execute()
        
        total = len(all_corrections.data) if all_corrections.data else 0
        pending = len([c for c in all_corrections.data if c["status"] == "pending"]) if all_corrections.data else 0
        approved = len([c for c in all_corrections.data if c["status"] == "approved"]) if all_corrections.data else 0
        rejected = len([c for c in all_corrections.data if c["status"] == "rejected"]) if all_corrections.data else 0
        
        # Calculate approval rate
        reviewed = approved + rejected
        approval_rate = (approved / reviewed * 100) if reviewed > 0 else 0.0
        
        # Get recent corrections
        recent_response = self.supabase.table("corrections").select(
            "*, products(name, barcode)"
        ).order("submitted_at", desc=True).limit(5).execute()
        
        recent_corrections = []
        for item in recent_response.data:
            product_data = item.get("products", {}) if isinstance(item.get("products"), dict) else {}
            correction = CorrectionListItem(
                id=item["id"],
                product_id=item["product_id"],
                product_name=product_data.get("name"),
                field_name=item["field_name"],
                old_value=item["old_value"],
                new_value=item["new_value"],
                photo_url=item.get("photo_url"),
                status=item["status"],
                submitted_at=item["submitted_at"],
                submitter_user_id=item.get("submitter_user_id")
            )
            recent_corrections.append(correction)
        
        return AdminStatsResponse(
            total_corrections=total,
            pending_corrections=pending,
            approved_corrections=approved,
            rejected_corrections=rejected,
            approval_rate=round(approval_rate, 2),
            recent_corrections=recent_corrections
        )
    
    async def _apply_correction_to_product(self, correction: CorrectionDetailResponse) -> None:
        """Apply approved correction to the product"""
        field_name = correction.field_name
        new_value = correction.new_value
        
        # Handle different field types
        update_data = {}
        
        # Parse new_value based on field type
        if field_name in ["allergens", "ingredients_parsed", "warnings", "images"]:
            # List fields - parse as JSON array
            import json
            try:
                update_data[field_name] = json.loads(new_value)
            except json.JSONDecodeError:
                # If not valid JSON, split by comma
                update_data[field_name] = [item.strip() for item in new_value.split(",")]
        elif field_name == "nutrition":
            # Nested object - parse as JSON
            import json
            try:
                update_data[field_name] = json.loads(new_value)
            except json.JSONDecodeError:
                # Skip if invalid JSON
                return
        else:
            # Simple string fields
            update_data[field_name] = new_value
        
        # Update the product
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        self.supabase.table("products").update(update_data).eq(
            "id", correction.product_id
        ).execute()
