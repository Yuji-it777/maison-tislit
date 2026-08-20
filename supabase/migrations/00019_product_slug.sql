-- Product slugs for SEO-friendly product URLs.
-- Backfill existing rows with scripts/backfill-slugs.mjs, then run this migration
-- (or run the script after this migration — the script updates rows by id).

ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique
  ON products (slug)
  WHERE slug IS NOT NULL;