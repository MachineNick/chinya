-- Run in Supabase Dashboard → SQL Editor

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

alter table results enable row level security;
create policy "allow all" on results for all using (true) with check (true);
