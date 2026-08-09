-- Final fix: confirm admin@maison-tislit.com and ensure admin profile

-- Confirm email for all users with this email
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'admin@maison-tislit.com';

-- Delete any stale unconfirmed duplicates except the most recently created one
DELETE FROM auth.users WHERE email = 'admin@maison-tislit.com' AND email_confirmed_at IS NULL;

-- Ensure the profile exists and is admin
INSERT INTO public.profiles (id, name, email, is_admin)
SELECT id, COALESCE(raw_user_meta_data->>'name', 'Admin Maison Tislit'), email, true
FROM auth.users
WHERE email = 'admin@maison-tislit.com'
ON CONFLICT (id) DO UPDATE SET is_admin = true, email = EXCLUDED.email;
