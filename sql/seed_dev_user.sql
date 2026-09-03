-- Run this in your Supabase SQL Editor if you want to use the "Developer Login" button
-- This adds the dummy developer student ID to your database so foreign keys don't fail!

INSERT INTO public.students (
  id, 
  name, 
  email, 
  password_hash, 
  branch, 
  year, 
  telegram_username
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Developer',
  'dev@example.com',
  'dev_bypass',
  'Computer Science',
  4,
  'dev_user'
) 
ON CONFLICT (id) DO NOTHING;
