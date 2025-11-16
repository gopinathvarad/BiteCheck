-- Migration: Create scans table
-- Description: Tracks user scan history with optional user association for guest users

CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    barcode TEXT NOT NULL,
    result_snapshot JSONB,
    scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id) WHERE user_id IS NOT NULL;

-- Create index on product_id for product history
CREATE INDEX IF NOT EXISTS idx_scans_product_id ON scans(product_id) WHERE product_id IS NOT NULL;

-- Create index on scanned_at for sorting
CREATE INDEX IF NOT EXISTS idx_scans_scanned_at ON scans(scanned_at DESC);

-- Create composite index for user scan history
CREATE INDEX IF NOT EXISTS idx_scans_user_scanned_at ON scans(user_id, scanned_at DESC) WHERE user_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own scans" ON scans;
DROP POLICY IF EXISTS "Users can insert their own scans" ON scans;
DROP POLICY IF EXISTS "Service role can manage all scans" ON scans;

-- Policy: Users can only view their own scans
CREATE POLICY "Users can view their own scans" ON scans
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Users can insert their own scans (user_id can be null for guest scans)
CREATE POLICY "Users can insert their own scans" ON scans
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Service role can manage all scans
CREATE POLICY "Service role can manage all scans" ON scans
    FOR ALL USING (auth.role() = 'service_role');

-- Add comments
COMMENT ON TABLE scans IS 'Tracks product scan history. user_id can be null for guest scans';
COMMENT ON COLUMN scans.result_snapshot IS 'JSON snapshot of product data at time of scan';
COMMENT ON COLUMN scans.barcode IS 'Barcode that was scanned (stored for reference even if product is deleted)';

