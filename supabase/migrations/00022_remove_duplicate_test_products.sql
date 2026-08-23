-- ============================================================================
-- Remove duplicate "-2" test/demo products (ids 11-20) and leftover test orders.
--
-- These product rows were manually-inserted duplicates of seed products 1-10
-- (id 11 even carried a stray test price of 100.00). Because
-- scripts/prerender.mjs fetches every product slug from this table at build
-- time, they leaked into dist/sitemap.xml and the prerendered pages as
-- duplicate-content URLs like /en/product/emerald-royal-djellaba-2.
--
-- Run in the Supabase SQL Editor (Dashboard > SQL Editor).
-- Safe to re-run: every DELETE targets explicit ids AND a guard condition,
-- so it is a no-op once applied and on any freshly-seeded database.
--
-- Cascades handled by existing FKs:
--   order_items.product_id -> products.id ON DELETE CASCADE
--   reviews.product_id     -> products.id ON DELETE CASCADE
-- ============================================================================

BEGIN;

-- 1. The 10 duplicate "-2" products.
--    Guarded on both id and slug suffix: only deletes if the row is exactly
--    the verified duplicate, never a renamed/re-purposed row.
DELETE FROM products
WHERE id IN (11, 12, 13, 14, 15, 16, 17, 18, 19, 20)
  AND slug LIKE '%-2';

-- 2. Checkout-test order shells (ids 112-125, created 2026-08-19 within a
--    ~20-minute burst, all 'pending'). Their order_items rows cascade away
--    with the products above; the NOT EXISTS guard ensures an order is only
--    removed once it has no remaining items, so real orders can never be lost.
DELETE FROM orders
WHERE id IN (112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125)
  AND NOT EXISTS (
    SELECT 1 FROM order_items WHERE order_items.order_id = orders.id
  );

COMMIT;

-- ============================================================================
-- Verify after running:
--   SELECT id, slug FROM products ORDER BY id;          -- expect ids 1-10 only
--   SELECT COUNT(*) FROM reviews
--    WHERE product_id BETWEEN 11 AND 20;                -- expect 0
--   SELECT COUNT(*) FROM orders
--    WHERE id BETWEEN 112 AND 125;                      -- expect 0
-- ============================================================================
