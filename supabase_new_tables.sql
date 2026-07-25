-- Run ONLY this in Supabase Dashboard → SQL Editor
-- (adds the two missing tables; existing tables are untouched)

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

alter table withdraws enable row level security;
alter table reports enable row level security;

create policy "allow all" on withdraws for all using (true) with check (true);
create policy "allow all" on reports for all using (true) with check (true);
