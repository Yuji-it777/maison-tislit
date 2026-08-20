-- Set the correct password hash for admin@maison-tislit.com
UPDATE auth.users 
SET encrypted_password = '$2a$10$UpTHnygrFsReIjLSPb9YzeXensOs5KWx56tq7gu2KrdG.9EgZVcFK',
    updated_at = NOW(),
    email_confirmed_at = NOW()
WHERE email = 'admin@maison-tislit.com';

-- Ensure profile exists and is admin
INSERT INTO public.profiles (id, name, email, is_admin)
SELECT au.id, COALESCE(au.raw_user_meta_data->>'name', 'Admin Maison Tislit'), au.email, true
FROM auth.users au
WHERE au.email = 'admin@maison-tislit.com'
ON CONFLICT (id) DO UPDATE SET is_admin = true, email = EXCLUDED.email;
