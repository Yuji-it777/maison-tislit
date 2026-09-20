-- ============================================================================
-- Assign distinct photos to the three gandoura products.
--
-- All three previously shared /images/gandoura1.jpg. New photos were added
-- to public/images (optimized to web size) and mapped by colour match:
--   Bordeaux Sultana Gandoura (id 5) -> gandoura-bleu-majorelle.jpeg
--   White Jasmine Gandoura   (id 6) -> gandoura-sable-royal.jpeg
--   Silk Gandoura            (id 9) -> gandoura-terracotta-satin.jpeg
--
-- NOTE: the photo filenames suggest newer collection names (Sable Royal,
-- Bleu Majorelle, Terracotta Satin). Product names were deliberately kept
-- unchanged per catalog decision; only the image paths move.
--
-- Run in the Supabase SQL Editor (Dashboard > SQL Editor).
-- Safe to re-run: guarded on id AND the exact old image path, so it is a
-- no-op once applied.
-- ============================================================================

BEGIN;

UPDATE products SET image = '/images/gandoura-bleu-majorelle.jpeg'
WHERE id = 5 AND image = '/images/gandoura1.jpg';

UPDATE products SET image = '/images/gandoura-sable-royal.jpeg'
WHERE id = 6 AND image = '/images/gandoura1.jpg';

UPDATE products SET image = '/images/gandoura-terracotta-satin.jpeg'
WHERE id = 9 AND image = '/images/gandoura1.jpg';

COMMIT;

-- ============================================================================
-- Verify after running:
--   SELECT id, name_en, image FROM products WHERE id IN (5, 6, 9) ORDER BY id;
--     -- expect the three new .jpeg paths, no gandoura1.jpg left
-- ============================================================================
