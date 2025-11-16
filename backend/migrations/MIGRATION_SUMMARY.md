# Database Migration Summary

## Overview

Complete database schema migration for **BiteCheck** project has been created. All tables, indexes, triggers, and Row Level Security (RLS) policies are ready to be applied to your Supabase project.

## Database Schema

### Tables Created

1. **products** - Main product catalog
   - Stores barcode, name, brand, category, manufacturer
   - Nutrition facts (JSONB with per_100g and per_serving)
   - Ingredients (raw text and parsed JSONB array)
   - Allergens array
   - Images array
   - Health score
   - Source tracking

2. **users_meta** - User profile extensions
   - Allergies array
   - Diet preferences array
   - Custom preferences (JSONB)

3. **scans** - Scan history tracking
   - Supports both authenticated and guest users (nullable user_id)
   - Product reference
   - Result snapshot (JSONB)
   - Timestamp tracking

4. **favorites** - User favorite products
   - Unique constraint on (user_id, product_id)
   - Timestamp tracking

5. **corrections** - Crowdsourced corrections workflow
   - Field-level corrections
   - Status: pending/approved/rejected
   - Photo evidence support
   - Admin review tracking

6. **admin_audit** - Admin activity logging
   - Action tracking
   - Resource references
   - IP address and user agent
   - JSONB details field

7. **ingredient_aliases** - Ingredient synonym mapping
   - Canonical name to alias mapping
   - Allergen category support
   - Used for ingredient parsing

## Key Features

### Security
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Policies configured for:
  - Public read access for products (scanning)
  - User-specific access for personal data
  - Service role access for admin operations
  - Guest user support (nullable user_id in scans)

### Performance
- ✅ Indexes on all foreign keys
- ✅ Indexes on frequently queried fields (barcode, status, timestamps)
- ✅ Full-text search index on product names
- ✅ Composite indexes for common query patterns

### Data Integrity
- ✅ Foreign key constraints with CASCADE/SET NULL where appropriate
- ✅ Unique constraints (barcode, user_id in users_meta, user_id+product_id in favorites)
- ✅ Check constraints (status enum in corrections)
- ✅ Auto-updating timestamps via triggers

### Functionality
- ✅ Auto-update `updated_at` trigger function
- ✅ Support for guest users (scans table)
- ✅ JSONB fields for flexible data storage
- ✅ Array fields for allergens, diets, images

## Migration Files

All migrations are located in `/backend/migrations/`:

- `000_combined_migration.sql` - **Use this one!** Complete schema in single file
- `001_create_products_table.sql` through `007_create_ingredient_aliases_table.sql` - Individual migrations

## Next Steps

1. **Apply the migration:**
   - Go to Supabase Dashboard → SQL Editor
   - Run `000_combined_migration.sql`

2. **Verify the schema:**
   - Check Table Editor to see all tables
   - Verify RLS is enabled on all tables
   - Test policies with sample queries

3. **Configure Storage (if needed):**
   - Create storage buckets for product images
   - Set up public/private bucket policies

4. **Seed data (optional):**
   - Add common allergen mappings to `ingredient_aliases`
   - Add any initial product data

## Project Reference

- **Supabase Project URL:** https://avdnwcsuekjzrqjvazpo.supabase.co
- **Project Name:** BiteCheck
- **Database:** PostgreSQL (via Supabase)

## Notes

- All tables use UUID primary keys
- Timestamps are timezone-aware (TIMESTAMPTZ)
- RLS policies use `auth.uid()` and `auth.role()` for Supabase Auth integration
- The schema follows the PRD specifications exactly

