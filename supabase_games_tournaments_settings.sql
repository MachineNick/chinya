-- Games table
create table if not exists games (
  id text primary key,
  name text not null,
  type text not null default 'regular',
  entry numeric not null default 0,
  prize numeric not null default 0,
  players int not null default 2,
  status text not null default 'active',
  created_at timestamptz default now()
);

-- Tournaments table
create table if not exists tournaments (
  id text primary key,
  name text not null,
  game text not null,
  entry numeric not null default 0,
  prize numeric not null default 0,
  players text default '0/0',
  status text not null default 'upcoming',
  start_time text,
  created_at timestamptz default now()
);

-- Settings table (key-value)
create table if not exists settings (
  key text primary key,
  value text not null
);

-- Seed default games
insert into games (id, name, type, entry, prize, players, status) values
  ('g1','Full Game','regular',50,90,4,'active'),
  ('g2','1 Goti','regular',20,36,2,'active'),
  ('g3','2 Goti','regular',30,54,2,'active'),
  ('g4','3 Goti','regular',40,72,2,'active'),
  ('g5','Ulta','regular',50,90,2,'active'),
  ('g6','1 Six','regular',20,36,2,'active'),
  ('g7','Snake & Ladder','regular',20,36,2,'active')
on conflict (id) do nothing;

-- Seed default tournaments
insert into tournaments (id, name, game, entry, prize, players, status, start_time) values
  ('t1','Full Game Grand Prix','Full Game',100,5000,'48/64','running','2026-07-04 10:00'),
  ('t2','1 Goti Speed Cup','1 Goti',50,2000,'32/64','upcoming','2026-07-05 18:00'),
  ('t3','Snake Ladder Open','Snake & Ladder',50,2000,'16/32','upcoming','2026-07-05 20:00'),
  ('t4','Ulta Championship','Ulta',100,8000,'64/64','completed','2026-07-03 10:00')
on conflict (id) do nothing;

-- Seed default settings
insert into settings (key, value) values
  ('bonusPhone','+91 95186-85134'),
  ('adminUser','admin'),
  ('adminPass','winzo-admin-2026'),
  ('upiId','winzoindia@upi'),
  ('upiName','WinzoIndia')
on conflict (key) do nothing;

-- RLS
alter table games enable row level security;
alter table tournaments enable row level security;
alter table settings enable row level security;

create policy "public read games" on games for select using (true);
create policy "admin write games" on games for all using (auth.role() = 'authenticated');

create policy "public read tournaments" on tournaments for select using (true);
create policy "admin write tournaments" on tournaments for all using (auth.role() = 'authenticated');

create policy "public read settings" on settings for select using (true);
create policy "admin write settings" on settings for all using (auth.role() = 'authenticated');
