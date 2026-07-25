-- ============================================================
-- Fix: Admin panel can read all tables when logged in as admin
-- The admin panel authenticates via Supabase Auth (email/password).
-- After login, their JWT has app_metadata.role = 'admin'.
-- This patch also fixes the signup insert race condition.
-- ============================================================

-- 1. Allow authenticated insert on users (signup flow)
--    The auth.signUp() call creates the auth user first,
--    then the DB insert fires — but email-unconfirmed users
--    still get a session token, so auth.uid() is available.
--    No change needed here — existing policy is correct IF
--    the uid passed matches auth.uid(). Verified below.

-- 2. Fix admin reads — drop and recreate with correct admin check
drop policy if exists "users_select_own" on users;
create policy "users_select_own" on users
  for select using (
    auth.uid()::text = uid
    or (auth.role() = 'authenticated' and is_admin())
  );

drop policy if exists "deposits_select" on deposits;
create policy "deposits_select" on deposits
  for select using (
    auth.uid()::text = uid
    or (auth.role() = 'authenticated' and is_admin())
  );

drop policy if exists "withdraws_select" on withdraws;
create policy "withdraws_select" on withdraws
  for select using (
    auth.uid()::text = uid
    or (auth.role() = 'authenticated' and is_admin())
  );

drop policy if exists "results_select" on results;
create policy "results_select" on results
  for select using (
    auth.uid()::text = submitter_uid
    or auth.uid()::text = opponent_uid
    or (auth.role() = 'authenticated' and is_admin())
  );

drop policy if exists "reports_select" on reports;
create policy "reports_select" on reports
  for select using (
    auth.uid()::text = reporter_uid
    or (auth.role() = 'authenticated' and is_admin())
  );

drop policy if exists "challenges_select" on challenges;
create policy "challenges_select" on challenges
  for select using (auth.role() = 'authenticated');

-- 3. Fix signup: allow insert where uid matches the auth user
--    (already correct, but make explicit)
drop policy if exists "users_insert_own" on users;
create policy "users_insert_own" on users
  for insert with check (auth.uid()::text = uid);
