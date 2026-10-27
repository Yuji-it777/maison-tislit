-- ============================================================================
-- Remove all false "silk" claims. The shop has NO silk products.
--
-- 1. Majorelle Blue Gandoura (slug majorelle-blue-gandoura) is crepe, not silk.
--    Replaces description, description_en and description_nl with the texts
--    below (EN + NL verbatim from the request; FR translated faithfully).
--
-- 2. Any OTHER product whose description / description_en / description_nl
--    contains "silk", "soie" or "zijde" is intentionally NOT rewritten here.
--    Report those to the user first; they need separate review.
--
-- Run in the Supabase SQL Editor (Dashboard > SQL Editor).
-- Safe to re-run: each UPDATE is guarded on slug.
-- ============================================================================

BEGIN;

-- Majorelle Blue Gandoura — crepe (NOT silk)
UPDATE products SET
  description = 'La Gandoura Bleu Majorelle est une gandoura fluide en crêpe, à la chute naturelle et au toucher doux et léger, dans l''iconique bleu Majorelle.

Sa coupe décontractée est conçue pour le confort, avec des manches larges et une élégante retombée de l''épaule à l''ourlet. Une broderie délicate court le long de l''encolure en V et des poignets, ajoutant un détail marocain raffiné sans écraser la couleur. Des fentes latérales à l''ourlet facilitent les mouvements.

Une élégance discrète pour les occasions festives et les réunions de famille, finie à la main dans notre atelier marocain. Portez-la seule pour un look sans effort, ou superposez-la sur un caftan.

Disponible du S au XL, avec une option sur mesure. Proposée également en bleu royal et indigo.',
  description_en = 'The Majorelle Blue Gandoura is a flowing crepe gandoura with a natural drape and a soft, lightweight feel, in the iconic Majorelle blue.

Its relaxed cut is designed for comfort, with wide sleeves and a graceful fall from shoulder to hem. Delicate embroidery runs along the V-neckline and the cuffs, adding a refined Moroccan detail without overwhelming the colour. Side slits at the hem make it easy to move in.

Understated elegance for festive occasions and family gatherings, finished by hand in our Moroccan workshop. Wear it alone for an effortless look, or layer it over a caftan.

Available in sizes S to XL, with a custom size option. Also offered in royal blue and indigo.',
  description_nl = 'De Majorelle Blue Gandoura is een soepel vallende gandoura van crêpe met een natuurlijke val en een zachte, lichte structuur, in het iconische Majorellablauw.

De ruime snit is ontworpen voor comfort, met wijde mouwen en een sierlijke val van schouder tot zoom. Fijn borduurwerk loopt langs de V-hals en de manchetten en geeft een verfijnd Marokkaans detail zonder de kleur te overschaduwen. Zijsplitten aan de zoom zorgen voor bewegingsvrijheid.

Ingetogen elegantie voor feestelijke gelegenheden en familiebijeenkomsten, met de hand afgewerkt in ons Marokkaanse atelier. Draag hem solo voor een moeiteloze look, of over een kaftan.

Verkrijgbaar in maat S t/m XL, met een optie voor maatwerk. Ook beschikbaar in koningsblauw en indigo.'
WHERE slug = 'majorelle-blue-gandoura';

COMMIT;

-- ============================================================================
-- Verify after running:
--   SELECT id, slug, name_en, category, description, description_en, description_nl
--   FROM products WHERE slug = 'majorelle-blue-gandoura';
--     -- expect crepe text, no silk/soie/zijde
--
-- Products elsewhere that still contain silk/soie/zijde (from migration/seed
-- files; live DB state must be confirmed separately — do NOT rewrite yet):
--   supabase/migrations/00001_schema.sql        id 2 (Djellaba Safira Bleue)  : soie / silk
--   supabase/migrations/00001_schema.sql        id 9 (Jabador Soie)           : soie / silk
--   demo-setup/seed_demo_data.sql               Takchita Perle de Fès         : soie / silk
--   supabase/migrations/00023_*.sql             id 2 / id 9                   : soie / silk
--   supabase/migrations/00024_*.sql             id 2 / id 9                   : soie / silk
--   supabase/migrations/00026_*.sql             id 9 (Gandoura Soie)          : soie / silk
--   supabase/migrations/00028_*.sql             id 9                          : comment mentions silk
-- ============================================================================
