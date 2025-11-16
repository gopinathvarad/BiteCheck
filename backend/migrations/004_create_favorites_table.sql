-- Migration: Create favorites table
-- Description: Stores user favorite products

CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- Create index on product_id for product popularity
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);

-- Create composite index for user favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_created_at ON favorites(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;
DROP POLICY IF EXISTS "Service role can manage all favorites" ON favorites;

-- Policy: Users can only view their own favorites
CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own favorites
CREATE POLICY "Users can insert their own favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Policy: Service role can manage all favorites
CREATE POLICY "Service role can manage all favorites" ON favorites
    FOR ALL USING (auth.role() = 'service_role');

-- Add comments
COMMENT ON TABLE favorites IS 'Stores user favorite products';
COMMENT ON COLUMN favorites.user_id IS 'Reference to authenticated user';
COMMENT ON COLUMN favorites.product_id IS 'Reference to favorited product';

