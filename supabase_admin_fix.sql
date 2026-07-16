-- Fix: Admin panel reads all users/deposits/withdraws/reports using anon key
-- The admin panel is passcode-gated on the frontend, not via Supabase Auth.
-- These policies allow the anon key to read all rows (admin panel use).

drop policy if exists "users_select_own" on users;
create policy "users_select_own" on users
  for select using (true);

drop policy if exists "deposits_select" on deposits;
create policy "deposits_select" on deposits
  for select using (true);

drop policy if exists "withdraws_select" on withdraws;
create policy "withdraws_select" on withdraws
  for select using (true);

drop policy if exists "reports_select" on reports;
create policy "reports_select" on reports
  for select using (true);
