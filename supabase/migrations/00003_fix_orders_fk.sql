-- Fix orders FK constraint: reference auth.users instead of profiles
-- This ensures authenticated users can always place orders even if
-- the auto-profile trigger hasn't created a profiles row yet.

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
