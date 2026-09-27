-- ============================================================================
-- Multi-image support: additional photos per product.
--
-- `products.image` stays the COVER: shop cards, cart, checkout, wishlist and
-- the og:image tag keep reading it, so nothing existing changes meaning.
-- `products.gallery` holds any ADDITIONAL photos, rendered as a thumbnail
-- strip on the product detail page and the quick-view modal.
--
-- An empty array means "cover only", so every existing row stays valid.
-- Admins manage the column in Admin > Stock > Edit product > Gallery.
--
-- Run in the Supabase SQL Editor (Dashboard > SQL Editor).
-- Safe to re-run: ADD COLUMN IF NOT EXISTS + guarded UPDATE.
-- ============================================================================

BEGIN;

ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery TEXT[] NOT NULL DEFAULT '{}';

-- Optional: attach extra photo(s) to one product from SQL. Paths are either
-- repo assets ('/images/...') or Supabase Storage public URLs
-- ('https://<project>.supabase.co/storage/v1/object/public/product-images/...').
-- Edit the id + paths and uncomment. Re-runnable: no-op once gallery is set.
--
-- UPDATE products SET gallery = ARRAY['/images/example-detail.jpeg']
-- WHERE id = 5 AND gallery = '{}';

COMMIT;

-- Ask PostgREST to pick the new column up immediately. Harmless if it is
-- already refreshing; without it a stale schema cache can keep reporting
-- "Could not find the 'gallery' column of 'products'".
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- Verify after running:
--   SELECT id, name_en, image, gallery FROM products ORDER BY id;
--     -- expect a `gallery` column on every row, '{}' until photos are added
-- ============================================================================
