-- ============================================================================
-- Rename recategorized takchita/jabador products to match their new category.
--
-- Follow-up to 00025: those rows kept their original names ("Takchita Fassia",
-- "Silk Jabador", ...) after being recategorized to Caftan/gandoura, which
-- read oddly on the shop page and inside their new collections. This updates
-- names (FR + EN), descriptions (FR + EN), and slugs so every customer-facing
-- word matches the new category. No category values change here.
--
-- Slug changes are customer-facing URLs: matching 301 redirects were added to
-- .htaccess and netlify.toml in the same commit as this migration.
--
-- French gender agreement handled: takchita (f) -> caftan (m) and
-- jabador (m) -> gandoura (f), so articles/adjectives are rewritten too.
--
-- Run in the Supabase SQL Editor (Dashboard > SQL Editor).
-- Safe to re-run: every UPDATE is guarded on id AND the exact old value,
-- so it is a no-op once applied.
-- ============================================================================

BEGIN;

-- 1. Takchita Nour Al-Qamar -> Caftan Nour Al-Qamar (was takchita, now Caftan)
UPDATE products SET
  slug          = 'nour-al-qamar-caftan',
  name          = 'Caftan Nour Al-Qamar',
  name_en       = 'Nour Al-Qamar Caftan',
  description   = '''Lumière de lune'' — un somptueux caftan deux pièces en crêpe ivoire, rehaussé d''une ceinture lumineuse. Pensé pour les mariages et les grandes soirées. Chaque finition est réalisée à la main dans notre atelier.',
  description_en = '''Moonlight'' — a sumptuous two-piece caftan in ivory crepe, layered with a luminous belt. Made for weddings and grand evenings. Every finish is done by hand in our atelier.'
WHERE id = 3 AND slug = 'nour-al-qamar-takchita';

-- 2. Takchita Rosa Enchantée -> Caftan Rosa Enchantée (was takchita, now Caftan)
UPDATE products SET
  slug          = 'enchanted-rosa-caftan',
  name          = 'Caftan Rosa Enchantée',
  name_en       = 'Enchanted Rosa Caftan',
  description   = 'Le romantisme du rose poudré dans un caftan deux pièces à la coupe fluide, adouci de délicates broderies. Un choix gracieux pour les fiançailles et les célébrations en journée. Fait main au Maroc.',
  description_en = 'Powder-pink romance in a flowing two-piece caftan, softened with delicate embroidery. A graceful choice for engagements and daytime celebrations. Handmade in Morocco.'
WHERE id = 4 AND slug = 'enchanted-rosa-takchita';

-- 3. Takchita Fassia -> Caftan Fassia (was takchita, now Caftan)
UPDATE products SET
  slug          = 'fassi-caftan',
  name          = 'Caftan Fassia',
  name_en       = 'Fassi Caftan',
  description   = 'Un caftan traditionnel deux pièces dans le style fassi de Fès, fidèle à des siècles de savoir-faire cérémonial. Intemporel, structuré, fait pour marquer les esprits. Fait main au Maroc.',
  description_en = 'A traditional two-piece caftan in the Fassi style of Fez, faithful to centuries of ceremonial dressmaking. Timeless, structured, made to be remembered. Handcrafted in Morocco.'
WHERE id = 8 AND slug = 'fassi-takchita';

-- 4. Jabador Soie -> Gandoura Soie (was Jabador, now gandoura)
UPDATE products SET
  slug          = 'silk-gandoura',
  name          = 'Gandoura Soie',
  name_en       = 'Silk Gandoura',
  description   = 'Une gandoura en soie pure à la chute naturelle et à la douceur incomparable. Un luxe discret pour les occasions festives et les fêtes de famille. Finie à la main dans notre atelier marocain.',
  description_en = 'A pure silk gandoura with a natural drape and incomparable softness. Understated luxury for festive occasions and family gatherings. Finished by hand in our Moroccan workshop.'
WHERE id = 9 AND slug = 'silk-jabador';

COMMIT;

-- ============================================================================
-- Verify after running:
--   SELECT id, slug, name_en, category FROM products ORDER BY id;
--     -- expect slugs: nour-al-qamar-caftan, enchanted-rosa-caftan,
--     --              fassi-caftan, silk-gandoura — no takchita/jabador left
--   SELECT COUNT(*) FROM products
--    WHERE slug LIKE '%takchita%' OR slug LIKE '%jabador%'
--       OR name LIKE '%takchita%' OR name LIKE '%jabador%';  -- expect 0
-- ============================================================================
