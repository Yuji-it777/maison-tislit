-- Fix admin@maison-tislit.com: confirm email, set admin, clean duplicates

-- 1. Confirm email for ALL users with this email (in case of duplicates)
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'admin@maison-tislit.com';

-- 2. Ensure profiles exist and are admin for all matching auth users
INSERT INTO public.profiles (id, name, email, is_admin)
SELECT id, COALESCE(raw_user_meta_data->>'name', 'Admin Maison Tislit'), email, true
FROM auth.users
WHERE email = 'admin@maison-tislit.com'
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.users.id)
ON CONFLICT (id) DO UPDATE SET is_admin = true;
