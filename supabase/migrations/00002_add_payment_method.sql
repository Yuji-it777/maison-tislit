-- Add payment_method and note columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'stripe';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS note TEXT NOT NULL DEFAULT '';
