-- Prevent non-admin users from changing is_admin on their own profile
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.prevent_self_admin_promotion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin AND
     NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Only existing admins can change admin status';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_self_admin_promotion ON profiles;
CREATE TRIGGER prevent_self_admin_promotion
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_admin_promotion();
