-- Migration: Create corrections table
-- Description: Stores crowdsourced product corrections submitted by users

CREATE TABLE IF NOT EXISTS corrections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    submitter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT NOT NULL,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    review_notes TEXT
);

-- Create index on product_id for product corrections
CREATE INDEX IF NOT EXISTS idx_corrections_product_id ON corrections(product_id) WHERE product_id IS NOT NULL;

-- Create index on submitter_user_id for user submissions
CREATE INDEX IF NOT EXISTS idx_corrections_submitter_user_id ON corrections(submitter_user_id) WHERE submitter_user_id IS NOT NULL;

-- Create index on status for filtering pending corrections
CREATE INDEX IF NOT EXISTS idx_corrections_status ON corrections(status);

-- Create index on submitted_at for sorting
CREATE INDEX IF NOT EXISTS idx_corrections_submitted_at ON corrections(submitted_at DESC);

-- Create composite index for admin queue
CREATE INDEX IF NOT EXISTS idx_corrections_status_submitted_at ON corrections(status, submitted_at DESC) WHERE status = 'pending';

-- Enable Row Level Security
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own corrections" ON corrections;
DROP POLICY IF EXISTS "Users can view all corrections" ON corrections;
DROP POLICY IF EXISTS "Users can insert corrections" ON corrections;
DROP POLICY IF EXISTS "Admins can update corrections" ON corrections;
DROP POLICY IF EXISTS "Service role can manage all corrections" ON corrections;

-- Policy: Users can view their own corrections
CREATE POLICY "Users can view their own corrections" ON corrections
    FOR SELECT USING (auth.uid() = submitter_user_id);

-- Policy: Anyone can view all corrections (for transparency)
CREATE POLICY "Users can view all corrections" ON corrections
    FOR SELECT USING (true);

-- Policy: Authenticated users can insert corrections
CREATE POLICY "Users can insert corrections" ON corrections
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = submitter_user_id);

-- Policy: Only service role can update corrections (for admin review)
CREATE POLICY "Admins can update corrections" ON corrections
    FOR UPDATE USING (auth.role() = 'service_role');

-- Policy: Service role can manage all corrections
CREATE POLICY "Service role can manage all corrections" ON corrections
    FOR ALL USING (auth.role() = 'service_role');

-- Add comments
COMMENT ON TABLE corrections IS 'Crowdsourced product corrections submitted by users';
COMMENT ON COLUMN corrections.status IS 'Status: pending, approved, or rejected';
COMMENT ON COLUMN corrections.field_name IS 'Name of the field being corrected (e.g., name, ingredients_raw, nutrition)';
COMMENT ON COLUMN corrections.photo_url IS 'URL to photo evidence uploaded by user';
COMMENT ON COLUMN corrections.reviewer_user_id IS 'Admin user who reviewed the correction';

