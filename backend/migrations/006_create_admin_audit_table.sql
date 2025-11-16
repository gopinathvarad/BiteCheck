-- Migration: Create admin_audit table
-- Description: Tracks admin activities for audit purposes

CREATE TABLE IF NOT EXISTS admin_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on admin_user_id for audit trails
CREATE INDEX IF NOT EXISTS idx_admin_audit_admin_user_id ON admin_audit(admin_user_id);

-- Create index on resource_type and resource_id for resource audits
CREATE INDEX IF NOT EXISTS idx_admin_audit_resource ON admin_audit(resource_type, resource_id) WHERE resource_id IS NOT NULL;

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at ON admin_audit(created_at DESC);

-- Create composite index for admin activity
CREATE INDEX IF NOT EXISTS idx_admin_audit_admin_created_at ON admin_audit(admin_user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE admin_audit ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view audit logs" ON admin_audit;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON admin_audit;
DROP POLICY IF EXISTS "Service role can manage all audit logs" ON admin_audit;

-- Policy: Only service role can view audit logs (admin access)
CREATE POLICY "Admins can view audit logs" ON admin_audit
    FOR SELECT USING (auth.role() = 'service_role');

-- Policy: Only service role can insert audit logs
CREATE POLICY "Service role can insert audit logs" ON admin_audit
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Policy: Only service role can manage all audit logs
CREATE POLICY "Service role can manage all audit logs" ON admin_audit
    FOR ALL USING (auth.role() = 'service_role');

-- Add comments
COMMENT ON TABLE admin_audit IS 'Audit log for admin activities';
COMMENT ON COLUMN admin_audit.action IS 'Action performed (e.g., approve_correction, merge_product, delete_product)';
COMMENT ON COLUMN admin_audit.resource_type IS 'Type of resource (e.g., product, correction, user)';
COMMENT ON COLUMN admin_audit.details IS 'JSON object with additional action details';

