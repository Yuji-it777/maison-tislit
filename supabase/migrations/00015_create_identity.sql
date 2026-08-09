-- Confirm email and create identity for admin@maison-tislit.com

-- 1. Confirm email
UPDATE auth.users SET email_confirmed_at = NOW(), updated_at = NOW() WHERE email = 'admin@maison-tislit.com';

-- 2. Ensure profile exists and is admin
INSERT INTO public.profiles (id, name, email, is_admin)
SELECT au.id, COALESCE(au.raw_user_meta_data->>'name', 'Admin Maison Tislit'), au.email, true
FROM auth.users au
WHERE au.email = 'admin@maison-tislit.com'
ON CONFLICT (id) DO UPDATE SET is_admin = true, email = EXCLUDED.email;

-- 3. Create identities so the user can sign in with password
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  au.id, 
  jsonb_build_object('sub', au.id::text, 'email', au.email),
  'email',
  au.email,
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'admin@maison-tislit.com'
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities ai 
    WHERE ai.user_id = au.id AND ai.provider = 'email'
  );
