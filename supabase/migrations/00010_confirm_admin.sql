-- Confirm email for admin@maison-tislit.com in auth.users
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'admin@maison-tislit.com';

-- Set is_admin = true for admin@maison-tislit.com in profiles
UPDATE public.profiles SET is_admin = true WHERE email = 'admin@maison-tislit.com';
