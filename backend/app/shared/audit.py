"""Audit logging utilities"""

from typing import Optional, Dict, Any
from uuid import UUID
from app.core.database import get_supabase_client


async def log_admin_action(
    admin_user_id: str,
    action: str,
    resource_type: str,
    resource_id: Optional[UUID] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
) -> None:
    """
    Log an admin action to the admin_audit table.
    
    Args:
        admin_user_id: UUID of the admin user performing the action
        action: Action performed (e.g., 'approve_correction', 'reject_correction')
        resource_type: Type of resource (e.g., 'correction', 'product')
        resource_id: UUID of the resource being acted upon
        details: Additional details as JSON object
        ip_address: IP address of the request
        user_agent: User agent string from the request
    """
    supabase = get_supabase_client()
    
    audit_data = {
        "admin_user_id": admin_user_id,
        "action": action,
        "resource_type": resource_type,
        "resource_id": str(resource_id) if resource_id else None,
        "details": details or {},
        "ip_address": ip_address,
        "user_agent": user_agent
    }
    
    try:
        supabase.table("admin_audit").insert(audit_data).execute()
    except Exception as e:
        # Log the error but don't fail the main operation
        print(f"Failed to log audit entry: {e}")
