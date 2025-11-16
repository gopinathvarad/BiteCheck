# Database Migrations

This directory contains SQL migration files for setting up the BiteCheck database schema in Supabase.

## Migration Files

1. **001_create_products_table.sql** - Main products table with barcode, nutrition, ingredients, and allergens
2. **002_create_users_meta_table.sql** - User profile metadata including allergies and diet preferences
3. **003_create_scans_table.sql** - Scan history tracking table
4. **004_create_favorites_table.sql** - User favorites table
5. **005_create_corrections_table.sql** - Crowdsourced corrections workflow table
6. **006_create_admin_audit_table.sql** - Admin activity audit log
7. **007_create_ingredient_aliases_table.sql** - Ingredient synonym and allergen mapping table

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard in the **GopinathVarad** organization, project **BiteCheck**
2. Navigate to **SQL Editor**
3. Copy and paste the contents of each migration file in order (001, 002, 003, etc.)
4. Run each migration one at a time
5. Verify that tables are created in the **Table Editor**

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Initialize Supabase (if not already done)
supabase init

# Link to your project (replace YOUR_PROJECT_REF with your actual project reference)
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

Or manually apply each migration:

```bash
supabase db execute -f migrations/001_create_products_table.sql
supabase db execute -f migrations/002_create_users_meta_table.sql
# ... and so on
```

### Option 3: Using psql

If you have direct database access:

```bash
# Replace YOUR_PROJECT_REF with your actual project reference
psql "postgresql://postgres:[YOUR-PASSWORD]@db.YOUR_PROJECT_REF.supabase.co:5432/postgres" -f migrations/001_create_products_table.sql
```

## Migration Order

**Important:** Run migrations in numerical order (001, 002, 003, etc.) as some tables have foreign key dependencies:

- `users_meta` depends on `auth.users` (Supabase Auth)
- `scans` depends on `products` and `auth.users`
- `favorites` depends on `products` and `auth.users`
- `corrections` depends on `products` and `auth.users`
- `admin_audit` depends on `auth.users`

## Verification

After applying all migrations, verify the schema:

1. Check that all tables exist in the Supabase dashboard
2. Verify Row Level Security (RLS) is enabled on all tables
3. Test that policies are working correctly
4. Check that indexes are created

## Rollback

If you need to rollback a migration, you can drop tables in reverse order:

```sql
DROP TABLE IF EXISTS admin_audit CASCADE;
DROP TABLE IF EXISTS ingredient_aliases CASCADE;
DROP TABLE IF EXISTS corrections CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS scans CASCADE;
DROP TABLE IF EXISTS users_meta CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

## Notes

- All tables use UUID primary keys with `gen_random_uuid()`
- Timestamps use `TIMESTAMPTZ` for timezone-aware dates
- Row Level Security (RLS) is enabled on all tables
- Policies allow appropriate access based on user roles
- The `update_updated_at_column()` function is shared across tables with `updated_at` columns
