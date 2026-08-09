-- Migration 00006: Add SELECT policy for newsletter_subscribers
-- The upsert (or potential future queries) on this table requires SELECT permission.
-- Since the table only stores emails for marketing, public read is safe.

DROP POLICY IF EXISTS "Anyone can read subscribers" ON newsletter_subscribers;
CREATE POLICY "Anyone can read subscribers"
  ON newsletter_subscribers FOR SELECT
  USING (true);
