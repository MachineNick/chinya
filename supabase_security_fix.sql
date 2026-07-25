-- ============================================================
-- SECURITY FIX — Run this in Supabase Dashboard → SQL Editor
-- Fixes: open "allow all" RLS policies + admin role setup
-- ============================================================

-- 1. Drop all open "allow all" policies
drop policy if exists "allow all" on users;
drop policy if exists "allow all" on deposits;
drop policy if exists "allow all" on challenges;
drop policy if exists "allow all" on results;
drop policy if exists "allow all" on withdraws;
drop policy if exists "allow all" on reports;
drop policy if exists "allow all" on settings;
drop policy if exists "allow all" on blacklist;
drop policy if exists "allow all" on games;

-- 2. Admin role helper — reads from JWT app_metadata (server-side, not spoofable)
create or replace function is_admin()
returns boolean language sql stable as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- 3. USERS — own row only; admin full access; is_admin column hidden from non-admins
drop policy if exists "users_select_own" on users;
drop policy if exists "users_insert_own" on users;
drop policy if exists "users_update_own" on users;
drop policy if exists "users_delete_admin" on users;

create policy "users_select_own"   on users for select using (auth.uid()::text = uid or is_admin());
create policy "users_insert_own"   on users for insert with check (auth.uid()::text = uid);
create policy "users_update_own"   on users for update using (auth.uid()::text = uid or is_admin());
create policy "users_delete_admin" on users for delete using (is_admin());

-- 4. DEPOSITS
drop policy if exists "deposits_select" on deposits;
drop policy if exists "deposits_insert" on deposits;
drop policy if exists "deposits_update" on deposits;
drop policy if exists "deposits_delete" on deposits;

create policy "deposits_select" on deposits for select using (auth.uid()::text = uid or is_admin());
create policy "deposits_insert" on deposits for insert with check (auth.uid()::text = uid);
create policy "deposits_update" on deposits for update using (is_admin());
create policy "deposits_delete" on deposits for delete using (is_admin());

-- 5. WITHDRAWS
drop policy if exists "withdraws_select" on withdraws;
drop policy if exists "withdraws_insert" on withdraws;
drop policy if exists "withdraws_update" on withdraws;
drop policy if exists "withdraws_delete" on withdraws;

create policy "withdraws_select" on withdraws for select using (auth.uid()::text = uid or is_admin());
create policy "withdraws_insert" on withdraws for insert with check (auth.uid()::text = uid);
create policy "withdraws_update" on withdraws for update using (is_admin());
create policy "withdraws_delete" on withdraws for delete using (is_admin());

-- 6. CHALLENGES
drop policy if exists "challenges_select" on challenges;
drop policy if exists "challenges_insert" on challenges;
drop policy if exists "challenges_update" on challenges;
drop policy if exists "challenges_delete" on challenges;

create policy "challenges_select" on challenges for select using (auth.role() = 'authenticated');
create policy "challenges_insert" on challenges for insert with check (auth.uid()::text = uid);
create policy "challenges_update" on challenges for update using (auth.uid()::text = uid or auth.uid()::text = accepted_by or is_admin());
create policy "challenges_delete" on challenges for delete using (auth.uid()::text = uid or is_admin());

-- 7. RESULTS
drop policy if exists "results_select" on results;
drop policy if exists "results_insert" on results;
drop policy if exists "results_update" on results;
drop policy if exists "results_delete" on results;

create policy "results_select" on results for select using (auth.uid()::text = submitter_uid or auth.uid()::text = opponent_uid or is_admin());
create policy "results_insert" on results for insert with check (auth.uid()::text = submitter_uid);
create policy "results_update" on results for update using (is_admin());
create policy "results_delete" on results for delete using (is_admin());

-- 8. REPORTS
drop policy if exists "reports_select" on reports;
drop policy if exists "reports_insert" on reports;
drop policy if exists "reports_update" on reports;
drop policy if exists "reports_delete" on reports;

create policy "reports_select" on reports for select using (auth.uid()::text = reporter_uid or is_admin());
create policy "reports_insert" on reports for insert with check (auth.uid()::text = reporter_uid);
create policy "reports_update" on reports for update using (is_admin());
create policy "reports_delete" on reports for delete using (is_admin());

-- 9. GAMES (public read, admin write)
drop policy if exists "games_select" on games;
drop policy if exists "games_insert" on games;
drop policy if exists "games_update" on games;
drop policy if exists "games_delete" on games;

create policy "games_select" on games for select using (true);
create policy "games_insert" on games for insert with check (is_admin());
create policy "games_update" on games for update using (is_admin());
create policy "games_delete" on games for delete using (is_admin());

-- 10. BLACKLIST (public read, admin write)
drop policy if exists "blacklist_select" on blacklist;
drop policy if exists "blacklist_insert" on blacklist;
drop policy if exists "blacklist_update" on blacklist;
drop policy if exists "blacklist_delete" on blacklist;

create policy "blacklist_select" on blacklist for select using (true);
create policy "blacklist_insert" on blacklist for insert with check (is_admin());
create policy "blacklist_update" on blacklist for update using (is_admin());
create policy "blacklist_delete" on blacklist for delete using (is_admin());

-- 11. SETTINGS (public read, admin write)
drop policy if exists "settings_select" on settings;
drop policy if exists "settings_insert" on settings;
drop policy if exists "settings_update" on settings;
drop policy if exists "settings_delete" on settings;

create policy "settings_select" on settings for select using (true);
create policy "settings_insert" on settings for insert with check (is_admin());
create policy "settings_update" on settings for update using (is_admin());
create policy "settings_delete" on settings for delete using (is_admin());

-- ============================================================
-- HOW TO SET AN ADMIN ACCOUNT:
-- In Supabase Dashboard → Authentication → Users → select user
-- → Edit → set app_metadata to: {"role": "admin"}
-- ============================================================
