-- Run in Supabase Dashboard → SQL Editor
-- Adds is_admin flag to users table

alter table users add column if not exists is_admin boolean default false;

-- Set your admin account (replace with the actual admin's email)
-- update users set is_admin = true where email = 'admin@yourdomain.com';
