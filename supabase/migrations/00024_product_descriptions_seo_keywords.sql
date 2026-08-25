-- ============================================================================
-- Enrich product descriptions v2: weave the garment-type keyword into
-- descriptions that were missing it (djellaba, takchita, gandoura, caftan/
-- kaftan, jabador), so meta descriptions and JSON-LD carry the terms users
-- actually search for. Builds on 00023_enrich_product_descriptions.sql,
-- which is already applied to production.
--
-- Copy feeds shop-card previews (first sentence is the hook - cards clamp
-- to two lines), the product page body, meta description and JSON-LD.
-- After running, rebuild/redeploy so scripts/prerender.mjs regenerates
-- pages, canonicals and sitemap with the new copy.
--
-- Run in the Supabase SQL Editor (Dashboard > SQL Editor).
-- Safe to re-run: plain UPDATEs guarded by id AND slug, no destructive ops.
--
-- Untouched on purpose (copy already contains its keywords):
--   id 1  emerald-royal-djellaba
--   id 3  nour-al-qamar-takchita
--   id 10 golden-belt
-- ============================================================================

-- 2. Djellaba Safira Bleue / Blue Safira Djellaba: add "djellaba"
UPDATE products SET
  description    = 'Une djellaba raffinée en soie naturelle bleu royal, au lustre délicat qui capte la lumière à chaque pas. Un classique intemporel pour les cérémonies, sublimé par de fins détails traditionnels. Fabriquée à la main au Maroc.',
  description_en = 'A refined djellaba in royal-blue natural silk with a soft lustre that catches the light with every step. A timeless classic for ceremonies, elevated by delicate traditional detailing. Handcrafted in Morocco.'
WHERE id = 2 AND slug = 'blue-safira-djellaba';

-- 4. Takchita Rosa Enchantée / Enchanted Rosa Takchita: add "takchita"
UPDATE products SET
  description    = 'Le romantisme du rose poudré dans une takchita deux pièces à la coupe fluide, adoucie de délicates broderies. Un choix gracieux pour les fiançailles et les célébrations en journée. Fait main au Maroc.',
  description_en = 'Powder-pink romance in a flowing two-piece takchita, softened with delicate embroidery. A graceful choice for engagements and daytime celebrations. Handmade in Morocco.'
WHERE id = 4 AND slug = 'enchanted-rosa-takchita';

-- 5. Gandoura Sultana Bordeaux / Bordeaux Sultana Gandoura: add "gandoura"
UPDATE products SET
  description    = 'Une gandoura sans manches en velours bordeaux, d''une profondeur riche et d''une douceur incomparable. À porter sur un caftan ou seule pour les douces soirées d''hiver entre proches. Chaque pièce est finie main.',
  description_en = 'A sleeveless gandoura in deep burgundy velvet, rich in colour and wonderfully soft. Layer it over a caftan or wear alone for intimate winter evenings. Each piece is hand-finished.'
WHERE id = 5 AND slug = 'bordeaux-sultana-gandoura';

-- 6. Gandoura Jasmine Blanche / White Jasmine Gandoura: add "gandoura"
UPDATE products SET
  description    = 'Une gandoura légère en coton blanc qui respire avec vous, une élégance naturelle pour les journées chaudes et les réunions décontractées. Une pièce discrète et polyvalente, faite main au Maroc.',
  description_en = 'A lightweight gandoura in breathable white cotton, effortless elegance for warm days and casual gatherings. A quietly versatile piece, handmade in Morocco.'
WHERE id = 6 AND slug = 'white-jasmine-gandoura';

-- 7. Caftan Royal Brodé / Embroidered Royal Caftan: add "caftan" + "kaftan"
UPDATE products SET
  description    = 'Un caftan royal en velours brodé entièrement à la main, des heures de travail artisanal dans chaque motif. Une pièce d''exception pour les mariages et les grandes occasions, fidèle à la tradition du kaftan marocain.',
  description_en = 'A royal velvet kaftan embroidered entirely by hand, hours of artisanal work in every motif. An exceptional piece for weddings and milestone celebrations, true to the Moroccan caftan tradition.'
WHERE id = 7 AND slug = 'embroidered-royal-caftan';

-- 8. Takchita Fassia / Fassi Takchita: add "takchita" and "Fès"
UPDATE products SET
  description    = 'Une takchita traditionnelle deux pièces dans le style fassi de Fès, fidèle à des siècles de savoir-faire cérémonial. Intemporelle, structurée, faite pour marquer les esprits. Faite main au Maroc.',
  description_en = 'A traditional two-piece takchita in the Fassi style of Fez, faithful to centuries of ceremonial dressmaking. Timeless, structured, made to be remembered. Handcrafted in Morocco.'
WHERE id = 8 AND slug = 'fassi-takchita';

-- 9. Jabador Soie / Silk Jabador: add "jabador", sharpen occasion
UPDATE products SET
  description    = 'Un jabador en soie pure à la chute naturelle et à la douceur incomparable. Un luxe discret pour les occasions festives et les fêtes de famille. Fini à la main dans notre atelier marocain.',
  description_en = 'A pure silk jabador with a natural drape and incomparable softness. Understated luxury for festive occasions and family gatherings. Finished by hand in our Moroccan workshop.'
WHERE id = 9 AND slug = 'silk-jabador';

-- ============================================================================
-- Verify after running:
--   SELECT id, slug FROM products
--    WHERE id IN (2,4,5,6,7,8,9)
--      AND (description LIKE '%djellaba%' OR description LIKE '%takchita%'
--        OR description LIKE '%gandoura%' OR description LIKE '%caftan%'
--        OR description LIKE '%jabador%');
--   -- expect 7 rows
-- ============================================================================
