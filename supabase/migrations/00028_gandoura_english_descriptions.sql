-- ============================================================================
-- Fix stale English descriptions on the renamed gandoura products.
--
-- Follow-up to the dashboard renames (images, names, slugs, prices, FR copy):
-- description_en was left holding the OLD products' English copy (burgundy
-- velvet / white cotton / pure silk), which contradicts the new photos and
-- French text. These are faithful EN translations of the current French
-- descriptions. No other fields change.
--
-- Run in the Supabase SQL Editor (Dashboard > SQL Editor).
-- Safe to re-run: guarded on id AND the exact old English text, so it is a
-- no-op once applied.
-- ============================================================================

BEGIN;

-- 5. Royal Sand Gandoura (FR: gandoura couleur sable, plissé, broderies dorées)
UPDATE products SET
  description_en = 'A sand-coloured gandoura in textured plisse fabric, adorned with handmade gold embroidery on the collar, bodice and cuffs. A flowing cut with butterfly sleeves for a refined, timeless look.'
WHERE id = 5
  AND description_en = 'A sleeveless gandoura in deep burgundy velvet, rich in colour and wonderfully soft. Layer it over a caftan or wear alone for intimate winter evenings. Each piece is hand-finished.';

-- 6. Terracotta Satin Gandoura (FR: satin fluide terracotta, manches nude, sfifa)
UPDATE products SET
  description_en = 'A flowing terracotta satin gandoura with contrasting wide nude sleeves and sfifa trim at the collar with traditional buttons. A graceful, generous cut — perfect for evenings and special occasions.'
WHERE id = 6
  AND description_en = 'A lightweight gandoura in breathable white cotton, effortless elegance for warm days and casual gatherings. A quietly versatile piece, handmade in Morocco.';

-- 9. Majorelle Blue Gandoura (FR: bleu Majorelle, plissé léger, broderies ton sur ton)
UPDATE products SET
  description_en = 'A vibrant Majorelle-blue gandoura in lightweight plisse fabric, accented with tone-on-tone embroidery at the collar and cuffs. Wide sleeves and a side slit offer everyday comfort with evening elegance.'
WHERE id = 9
  AND description_en = 'A pure silk gandoura with a natural drape and incomparable softness. Understated luxury for festive occasions and family gatherings. Finished by hand in our Moroccan workshop.';

COMMIT;

-- ============================================================================
-- Verify after running:
--   SELECT id, name_en, description_en FROM products WHERE id IN (5, 6, 9);
--     -- expect the new plisse/satin descriptions, no burgundy/cotton/silk text
-- ============================================================================
