-- Create test user via auth API and confirm immediately

-- Confirm all existing users with this email
UPDATE auth.users SET email_confirmed_at = NOW(), updated_at = NOW() WHERE email = 'admin@maison-tislit.com';

-- Ensure profile is admin
INSERT INTO public.profiles (id, name, email, is_admin)
SELECT id, COALESCE(raw_user_meta_data->>'name', 'Admin Maison Tislit'), email, true
FROM auth.users
WHERE email = 'admin@maison-tislit.com'
ON CONFLICT (id) DO UPDATE SET is_admin = true, email = EXCLUDED.email;
