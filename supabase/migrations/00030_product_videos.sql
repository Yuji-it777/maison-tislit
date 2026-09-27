-- ============================================================================
-- Product videos: let a product carry short mp4/webm clips next to its photos.
--
-- `products.videos` holds video URLs, exactly like `products.gallery` holds
-- extra photos. Photos stay in `image` (cover) + `gallery`; videos render in
-- the same thumbnail strip, after the photos, with a play badge.
--
-- URLs come from Admin > Stock > Edit product > Videos (upload, or paste a
-- repo path such as '/images/HERO.mp4'). An empty array (or NULL) is "no video".
--
-- Keep clips small (10-20s, 1080p, under ~20 MB): Supabase Storage serves the
-- file on every page view, so a heavy clip slows the product page for shoppers.
--
-- Run in the Supabase SQL Editor (Dashboard > SQL Editor).
-- Safe to re-run: ADD COLUMN IF NOT EXISTS.
--
-- WHY THIS COLUMN IS NULLABLE (unlike gallery in 00029): pasted through the
-- Supabase SQL Editor, `NOT NULL DEFAULT '{}'` arrived without its braces
-- (22P02: malformed array literal: "") and `ARRAY[]::TEXT[]` arrived without a
-- colon (42601: syntax error at or near ":"). The statement below keeps only
-- characters that survive a paste, so the column has no default and is
-- NULLABLE. Every read site normalizes (Array.isArray(row.videos) ? row.videos
-- : []), so NULL and '{}' behave identically - no code depends on NOT NULL.
--
-- Rather not paste at all? Dashboard > Table Editor > products > Add column:
--   name `videos`, type `text`, "Define as array" ON, nullable, no default.
-- ============================================================================

BEGIN;

ALTER TABLE products ADD COLUMN IF NOT EXISTS videos TEXT[];

-- Optional: attach a video to one product from SQL. Edit the id + path and
-- uncomment. Re-runnable: no-op once videos is set.
--
-- UPDATE products SET videos = ARRAY['https://<project>.supabase.co/storage/v1/object/public/product-images/clip.mp4']
-- WHERE id = 5 AND videos IS NULL;

COMMIT;

-- Ask PostgREST to pick the new column up immediately.
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- Verify after running:
--   SELECT id, name_en, image, gallery, videos FROM products ORDER BY id;
--     -- expect a `videos` column; NULL until clips are added
--
--   Or from the repo, no dashboard needed:
--     node scripts/check-media-columns.mjs
-- ============================================================================
