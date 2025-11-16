-- Migration: Create ingredient_aliases table
-- Description: Mapping table for ingredient synonyms and allergen aliases (as mentioned in PRD)

CREATE TABLE IF NOT EXISTS ingredient_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_name TEXT NOT NULL,
    alias TEXT NOT NULL UNIQUE,
    allergen_category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on canonical_name for lookups
CREATE INDEX IF NOT EXISTS idx_ingredient_aliases_canonical_name ON ingredient_aliases(canonical_name);

-- Create index on alias for reverse lookups
CREATE INDEX IF NOT EXISTS idx_ingredient_aliases_alias ON ingredient_aliases(alias);

-- Create index on allergen_category for filtering
CREATE INDEX IF NOT EXISTS idx_ingredient_aliases_allergen_category ON ingredient_aliases(allergen_category) WHERE allergen_category IS NOT NULL;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_ingredient_aliases_updated_at ON ingredient_aliases;
CREATE TRIGGER update_ingredient_aliases_updated_at BEFORE UPDATE ON ingredient_aliases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE ingredient_aliases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Ingredient aliases are viewable by everyone" ON ingredient_aliases;
DROP POLICY IF EXISTS "Service role can manage ingredient aliases" ON ingredient_aliases;

-- Policy: Anyone can read ingredient aliases (needed for ingredient parsing)
CREATE POLICY "Ingredient aliases are viewable by everyone" ON ingredient_aliases
    FOR SELECT USING (true);

-- Policy: Only service role can manage ingredient aliases
CREATE POLICY "Service role can manage ingredient aliases" ON ingredient_aliases
    FOR ALL USING (auth.role() = 'service_role');

-- Add comments
COMMENT ON TABLE ingredient_aliases IS 'Mapping table for ingredient synonyms and allergen aliases';
COMMENT ON COLUMN ingredient_aliases.canonical_name IS 'Canonical name of the ingredient or allergen';
COMMENT ON COLUMN ingredient_aliases.alias IS 'Alternative name or alias';
COMMENT ON COLUMN ingredient_aliases.allergen_category IS 'Allergen category if this is an allergen alias (peanut, milk, etc.)';

