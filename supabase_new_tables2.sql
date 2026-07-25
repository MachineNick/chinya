-- Run in Supabase Dashboard → SQL Editor

create table if not exists settings (
  key text primary key,
  value text
);

create table if not exists blacklist (
  id text primary key,
  name text,
  reason text,
  created_at timestamptz default now()
);

create table if not exists games (
  id text primary key,
  name text,
  type text default 'regular',
  entry integer default 0,
  prize integer default 0,
  players integer default 2,
  status text default 'active',
  created_at timestamptz default now()
);

alter table settings enable row level security;
alter table blacklist enable row level security;
alter table games enable row level security;

create policy "allow all" on settings for all using (true) with check (true);
create policy "allow all" on blacklist for all using (true) with check (true);
create policy "allow all" on games for all using (true) with check (true);

-- Seed default settings
insert into settings (key, value) values
  ('bonusPhone', '+91 99999 99999'),
  ('adminPass',  'winzo-admin-2026'),
  ('upiId',      'winzoindia@upi'),
  ('upiName',    'WinzoIndia')
on conflict (key) do nothing;
