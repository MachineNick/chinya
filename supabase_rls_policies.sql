-- ============================================================
-- DROP existing open policies first
-- ============================================================
drop policy if exists "allow all" on users;
drop policy if exists "allow all" on deposits;
drop policy if exists "allow all" on challenges;
drop policy if exists "allow all" on results;
drop policy if exists "allow all" on withdraws;
drop policy if exists "allow all" on reports;
drop policy if exists "allow all" on settings;
drop policy if exists "allow all" on blacklist;
drop policy if exists "allow all" on games;

-- ============================================================
-- Admin role helper (set via Supabase Dashboard → Auth → Custom Claims
-- or via a trusted edge function that sets app_metadata.role = 'admin')
-- ============================================================
create or replace function is_admin()
returns boolean language sql stable as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ============================================================
-- USERS
-- ============================================================
-- Users can only read/update their own row; admin can do anything
create policy "users_select_own"   on users for select using (auth.uid()::text = uid or is_admin());
create policy "users_insert_own"   on users for insert with check (auth.uid()::text = uid);
create policy "users_update_own"   on users for update using (auth.uid()::text = uid or is_admin());
create policy "users_delete_admin" on users for delete using (is_admin());

-- ============================================================
-- DEPOSITS
-- ============================================================
create policy "deposits_select"    on deposits for select using (auth.uid()::text = uid or is_admin());
create policy "deposits_insert"    on deposits for insert with check (auth.uid()::text = uid);
create policy "deposits_update"    on deposits for update using (is_admin()); -- only admin changes status
create policy "deposits_delete"    on deposits for delete using (is_admin());

-- ============================================================
-- WITHDRAWS
-- ============================================================
create policy "withdraws_select"   on withdraws for select using (auth.uid()::text = uid or is_admin());
create policy "withdraws_insert"   on withdraws for insert with check (auth.uid()::text = uid);
create policy "withdraws_update"   on withdraws for update using (is_admin());
create policy "withdraws_delete"   on withdraws for delete using (is_admin());

-- ============================================================
-- CHALLENGES
-- ============================================================
-- Anyone authenticated can read challenges (needed to see open pool)
create policy "challenges_select"  on challenges for select using (auth.role() = 'authenticated');
create policy "challenges_insert"  on challenges for insert with check (auth.uid()::text = uid);
-- Only creator or acceptor or admin can update (e.g. accept, set room code)
create policy "challenges_update"  on challenges for update
  using (auth.uid()::text = uid or auth.uid()::text = accepted_by or is_admin());
create policy "challenges_delete"  on challenges for delete using (auth.uid()::text = uid or is_admin());

-- ============================================================
-- RESULTS
-- ============================================================
create policy "results_select"     on results for select
  using (auth.uid()::text = submitter_uid or auth.uid()::text = opponent_uid or is_admin());
create policy "results_insert"     on results for insert with check (auth.uid()::text = submitter_uid);
create policy "results_update"     on results for update using (is_admin());
create policy "results_delete"     on results for delete using (is_admin());

-- ============================================================
-- REPORTS
-- ============================================================
create policy "reports_select"     on reports for select using (auth.uid()::text = reporter_uid or is_admin());
create policy "reports_insert"     on reports for insert with check (auth.uid()::text = reporter_uid);
create policy "reports_update"     on reports for update using (is_admin());
create policy "reports_delete"     on reports for delete using (is_admin());

-- ============================================================
-- GAMES  (public read, admin write)
-- ============================================================
create policy "games_select"       on games for select using (true);
create policy "games_insert"       on games for insert with check (is_admin());
create policy "games_update"       on games for update using (is_admin());
create policy "games_delete"       on games for delete using (is_admin());

-- ============================================================
-- BLACKLIST  (public read so frontend can check, admin write)
-- ============================================================
create policy "blacklist_select"   on blacklist for select using (true);
create policy "blacklist_insert"   on blacklist for insert with check (is_admin());
create policy "blacklist_update"   on blacklist for update using (is_admin());
create policy "blacklist_delete"   on blacklist for delete using (is_admin());

-- ============================================================
-- SETTINGS  (public read for bonus phone/upi display, admin write)
-- ============================================================
create policy "settings_select"    on settings for select using (true);
create policy "settings_insert"    on settings for insert with check (is_admin());
create policy "settings_update"    on settings for update using (is_admin());
create policy "settings_delete"    on settings for delete using (is_admin());
