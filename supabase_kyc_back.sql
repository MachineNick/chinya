-- Run in Supabase Dashboard → SQL Editor
-- Adds back-side KYC document columns to the users table

alter table users add column if not exists kyc_back_url text;
alter table users add column if not exists kyc_back_key text;
