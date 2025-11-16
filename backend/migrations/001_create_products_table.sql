-- Migration: Create products table
-- Description: Main table for storing product information including barcode, nutrition, ingredients, and allergens

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barcode TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT,
    manufacturer TEXT,
    country_of_sale TEXT,
    ingredients_raw TEXT,
    ingredients_parsed JSONB,
    nutrition JSONB, -- {per_100g: {...}, per_serving: {...}}
    allergens TEXT[],
    images TEXT[],
    health_score NUMERIC,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on barcode for fast lookups
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);

-- Create index on name for full-text search
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('english', name));

-- Create index on brand for filtering
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand) WHERE brand IS NOT NULL;

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category) WHERE category IS NOT NULL;

-- Create index on health_score for sorting
CREATE INDEX IF NOT EXISTS idx_products_health_score ON products(health_score) WHERE health_score IS NOT NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are insertable by authenticated users" ON products;
DROP POLICY IF EXISTS "Products are updatable by service role" ON products;

-- Policy: Anyone can read products (public access for scanning)
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

-- Policy: Only authenticated users and service role can insert products
CREATE POLICY "Products are insertable by authenticated users" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Policy: Only service role can update products (for corrections workflow)
CREATE POLICY "Products are updatable by service role" ON products
    FOR UPDATE USING (auth.role() = 'service_role');

-- Add comment to table
COMMENT ON TABLE products IS 'Stores product information including barcode, nutrition facts, ingredients, and allergens';
COMMENT ON COLUMN products.barcode IS 'Unique barcode (UPC/EAN/QR) identifier';
COMMENT ON COLUMN products.nutrition IS 'JSON object with per_100g and per_serving nutrition facts';
COMMENT ON COLUMN products.ingredients_parsed IS 'Parsed ingredients as JSON array';
COMMENT ON COLUMN products.allergens IS 'Array of allergen names (peanut, milk, wheat, etc.)';

