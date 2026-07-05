-- Run this in Supabase Dashboard → SQL Editor

create table if not exists users (
  uid text primary key,
  full_name text,
  phone text,
  email text unique,
  kyc_type text,
  kyc_url text,
  kyc_verified boolean default false,
  chips integer default 0,
  created_at timestamptz default now()
);

create table if not exists deposits (
  id text primary key,
  uid text,
  user_name text,
  user_phone text,
  user_email text,
  amount integer,
  method text,
  txn_id text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists challenges (
  id text primary key,
  game_id text,
  uid text,
  by_name text,
  value integer,
  game_type text,
  accepted_by text,
  accepted_by_name text,
  accepted_at bigint,
  room_code text,
  at bigint,
  created_at timestamptz default now()
);

create table if not exists results (
  id text primary key,
  challenge_id text,
  game_id text,
  submitter_uid text,
  submitter_name text,
  submitter_phone text,
  opponent_uid text,
  opponent_name text,
  opponent_phone text,
  game_type text,
  amount integer,
  room_code text,
  result text,
  proof_url text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists withdraws (
  id text primary key,
  uid text,
  user_name text,
  user_phone text,
  user_email text,
  amount integer,
  method text,
  upi_id text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists reports (
  id text primary key,
  reporter_uid text,
  reporter_name text,
  opponent text,
  details text,
  proof_url text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Enable Row Level Security (basic - tighten before going live)
alter table users enable row level security;
alter table deposits enable row level security;
alter table challenges enable row level security;
alter table results enable row level security;
alter table withdraws enable row level security;
alter table reports enable row level security;

-- Allow anon read/write for now (tighten with proper policies before launch)
create policy "allow all" on users for all using (true) with check (true);
create policy "allow all" on deposits for all using (true) with check (true);
create policy "allow all" on challenges for all using (true) with check (true);
create policy "allow all" on results for all using (true) with check (true);
create policy "allow all" on withdraws for all using (true) with check (true);
create policy "allow all" on reports for all using (true) with check (true);
