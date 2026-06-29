-- =====================================================================
-- My_Fix Database Schema Migration — Create Admin User
-- Target Database: PostgreSQL (Supabase Managed)
-- =====================================================================

-- 1. Insert the admin user into auth.users (linked to Supabase Auth)
-- Password hashed with bcrypt ('Admin@123')
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    role,
    aud,
    created_at,
    updated_at
)
VALUES (
    'd1a2b3c4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    '00000000-0000-0000-0000-000000000000',
    'usmandio2@gmail.com',
    crypt('Admin@123', gen_salt('bf', 10)),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Admin User", "role": "admin"}'::jsonb,
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE
SET encrypted_password = crypt('Admin@123', gen_salt('bf', 10)),
    raw_user_meta_data = raw_user_meta_data || '{"role": "admin", "full_name": "Admin User"}'::jsonb,
    email_confirmed_at = NOW(),
    confirmed_at = NOW(),
    updated_at = NOW();

-- 2. Explicitly insert/update the public.profiles record with the admin role
INSERT INTO public.profiles (
    id,
    full_name,
    phone_number,
    email,
    role
)
SELECT 
    id,
    'Admin User',
    'usmandio2@gmail.com',
    email,
    'admin'
FROM auth.users
WHERE email = 'usmandio2@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin',
    full_name = 'Admin User',
    phone_number = 'usmandio2@gmail.com';
