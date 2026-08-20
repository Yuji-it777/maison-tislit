-- One-time backfill of product slugs (same algorithm as src/utils/slug.ts).
-- Safe to run multiple times: only fills rows where slug IS NULL.

UPDATE products SET slug = 'emerald-royal-djellaba' WHERE id = 1 AND slug IS NULL;
UPDATE products SET slug = 'blue-safira-djellaba' WHERE id = 2 AND slug IS NULL;
UPDATE products SET slug = 'nour-al-qamar-takchita' WHERE id = 3 AND slug IS NULL;
UPDATE products SET slug = 'enchanted-rosa-takchita' WHERE id = 4 AND slug IS NULL;
UPDATE products SET slug = 'bordeaux-sultana-gandoura' WHERE id = 5 AND slug IS NULL;
UPDATE products SET slug = 'white-jasmine-gandoura' WHERE id = 6 AND slug IS NULL;
UPDATE products SET slug = 'embroidered-royal-caftan' WHERE id = 7 AND slug IS NULL;
UPDATE products SET slug = 'fassi-takchita' WHERE id = 8 AND slug IS NULL;
UPDATE products SET slug = 'silk-jabador' WHERE id = 9 AND slug IS NULL;
UPDATE products SET slug = 'golden-belt' WHERE id = 10 AND slug IS NULL;
UPDATE products SET slug = 'emerald-royal-djellaba-2' WHERE id = 11 AND slug IS NULL;
UPDATE products SET slug = 'blue-safira-djellaba-2' WHERE id = 12 AND slug IS NULL;
UPDATE products SET slug = 'nour-al-qamar-takchita-2' WHERE id = 13 AND slug IS NULL;
UPDATE products SET slug = 'enchanted-rosa-takchita-2' WHERE id = 14 AND slug IS NULL;
UPDATE products SET slug = 'bordeaux-sultana-gandoura-2' WHERE id = 15 AND slug IS NULL;
UPDATE products SET slug = 'white-jasmine-gandoura-2' WHERE id = 16 AND slug IS NULL;
UPDATE products SET slug = 'embroidered-royal-caftan-2' WHERE id = 17 AND slug IS NULL;
UPDATE products SET slug = 'fassi-takchita-2' WHERE id = 18 AND slug IS NULL;
UPDATE products SET slug = 'silk-jabador-2' WHERE id = 19 AND slug IS NULL;
UPDATE products SET slug = 'golden-belt-2' WHERE id = 20 AND slug IS NULL;
