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
-- Note: this migration previously also backfilled slugs for manually-added
-- duplicate test products with ids 11-20 ('*-2' slugs). Those rows were
-- removed from the live database by 00022_remove_duplicate_test_products.sql,
-- so those statements are gone. Fresh databases seeded by 00001 only ever
-- create ids 1-10.
