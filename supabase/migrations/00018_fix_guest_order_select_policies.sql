-- Fix: guest orders fail with "new row violates row-level security policy" on INSERT ... RETURNING
-- because the returned row must also pass the SELECT policy, and guest rows (user_id IS NULL)
-- match neither `auth.uid() = user_id` nor the admin clause.

-- Orders: allow anonymous reads of guest orders (needed for createOrder RETURNING + guest tracking)
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (
    user_id IS NULL
    OR auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Order items: allow reading items that belong to guest orders
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
      AND (orders.user_id IS NULL OR orders.user_id = auth.uid()
           OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  ));