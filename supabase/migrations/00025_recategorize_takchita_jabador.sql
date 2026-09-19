-- ============================================================================
-- Recategorize takchita / jabador products after the category restructure.
--
-- The site now exposes exactly three indexable category collections
-- (djellaba, gandoura, caftan — see src/config/categories.ts). The takchita
-- and jabador collection pages were removed; their old URLs 301 to the
-- closest surviving collections (.htaccess / netlify.toml).
--
-- Why UPDATE instead of DELETE:
--   order_items.product_id -> products.id is ON DELETE CASCADE (00001), and
--   orders 100-103 / 110 carry order_items for takchita products 3, 4, 8.
--   Deleting those product rows would silently destroy historical order
--   line items. Recategorizing keeps order history and product URLs
--   (slugs/names, sitemap) intact — only the collection label changes.
--
-- Mapping (closest surviving collection):
--   takchita -> 'Caftan'   (ceremonial / hand-embroidered formal wear)
--   Jabador  -> 'gandoura' (light, flowing everyday wear)
--   'Accessoire' is kept as a valid value (Golden Belt, id 10) but has no
--   category page by design (see src/config/categories.ts).
--
-- The category CHECK constraint is narrowed accordingly so new rows cannot
-- reintroduce the removed categories.
--
-- Run in the Supabase SQL Editor (Dashboard > SQL Editor).
-- Safe to re-run: updates are guarded on category value and the constraint
-- step is a no-op once applied.
-- ============================================================================

BEGIN;

-- 1. Recategorize. Guarded on the category value itself (not ids), so it
--    covers every legacy row regardless of id and is a no-op once applied.
UPDATE products SET category = 'Caftan'   WHERE category = 'takchita';
UPDATE products SET category = 'gandoura' WHERE category = 'Jabador';

-- 2. Narrow the CHECK constraint. 00001 created it inline, so Postgres
--    auto-named it products_category_check.
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_category_check'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_category_check
      CHECK (category IN ('djellaba', 'gandoura', 'Caftan', 'Accessoire'));
  END IF;
END;
$$;

COMMIT;

-- ============================================================================
-- Verify after running:
--   SELECT category, COUNT(*) FROM products GROUP BY category ORDER BY 1;
--     -- expect only: Caftan / Accessoire / djellaba / gandoura
--   SELECT id, slug, category FROM products
--    WHERE slug IN ('nour-al-qamar-takchita', 'enchanted-rosa-takchita',
--                   'fassi-takchita', 'silk-jabador')
--    ORDER BY id;
--     -- expect category 'Caftan' (3, 4, 8) and 'gandoura' (9)
--   SELECT COUNT(*) FROM order_items WHERE product_id IN (3, 4, 8, 9);
--     -- expect 5 (order history untouched)
-- ============================================================================
