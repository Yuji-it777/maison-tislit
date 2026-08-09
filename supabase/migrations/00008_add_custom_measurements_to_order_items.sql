-- Add custom_measurements column to order_items if it doesn't exist
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS custom_measurements TEXT;
