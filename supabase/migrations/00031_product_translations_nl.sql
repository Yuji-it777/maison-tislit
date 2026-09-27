-- ============================================================================
-- Add Dutch translations for products (name_nl, description_nl).
--
-- The admin now auto-translates product name/description to EN + NL via the
-- `translate-product` Edge Function on every save (supabase/functions/),
-- so these columns are written by the dashboard, not by this migration.
-- Existing rows stay '' until backfilled with the admin's "Translate all"
-- button (Stock section) or by re-saving each product.
--
-- Run in the Supabase SQL Editor (Dashboard > SQL Editor).
-- Safe to re-run: guarded with IF NOT EXISTS.
-- ============================================================================

BEGIN;

ALTER TABLE products ADD COLUMN IF NOT EXISTS name_nl TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_nl TEXT NOT NULL DEFAULT '';

COMMIT;

-- ============================================================================
-- Verify after running:
--   SELECT column_name FROM information_schema.columns
--    WHERE table_name = 'products' AND column_name IN ('name_nl', 'description_nl');
--     -- expect two rows
-- ============================================================================
