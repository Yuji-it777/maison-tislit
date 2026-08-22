-- Drop the deprecated original_price column.
-- The store no longer displays fake discount / "sale" pricing; products now
-- show their single actual price only. Safe to run on existing databases.
ALTER TABLE public.products DROP COLUMN IF EXISTS original_price;
