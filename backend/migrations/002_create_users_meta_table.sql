-- Migration: Create users_meta table
-- Description: Stores additional user profile data including allergies, diet preferences, and custom preferences

CREATE TABLE IF NOT EXISTS users_meta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    allergies TEXT[],
    diets TEXT[],
    preferences JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_meta_user_id ON users_meta(user_id);

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_users_meta_updated_at ON users_meta;
CREATE TRIGGER update_users_meta_updated_at BEFORE UPDATE ON users_meta
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users_meta ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own meta" ON users_meta;
DROP POLICY IF EXISTS "Users can insert their own meta" ON users_meta;
DROP POLICY IF EXISTS "Users can update their own meta" ON users_meta;
DROP POLICY IF EXISTS "Service role can manage all user meta" ON users_meta;

-- Policy: Users can only view their own metadata
CREATE POLICY "Users can view their own meta" ON users_meta
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own metadata
CREATE POLICY "Users can insert their own meta" ON users_meta
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own metadata
CREATE POLICY "Users can update their own meta" ON users_meta
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Service role can manage all user metadata
CREATE POLICY "Service role can manage all user meta" ON users_meta
    FOR ALL USING (auth.role() = 'service_role');

-- Add comments
COMMENT ON TABLE users_meta IS 'Additional user profile data including allergies, diets, and preferences';
COMMENT ON COLUMN users_meta.allergies IS 'Array of allergen names the user is allergic to';
COMMENT ON COLUMN users_meta.diets IS 'Array of diet types (vegetarian, vegan, keto, etc.)';
COMMENT ON COLUMN users_meta.preferences IS 'JSON object for additional user preferences';

