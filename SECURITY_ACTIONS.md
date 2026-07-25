# Security Actions — Manual Steps Required

## 🔴 Do these immediately

### 1. Rotate Supabase anon key (keys leaked in git history)
- Go to: Supabase Dashboard → Project Settings → API
- Click **Regenerate** next to the `anon` key
- Update `.env` and `backend/.env` with the new key
- Redeploy (Vercel will pick up the new env vars)

### 2. Rotate Storj credentials (keys in `pintumosa_secrets.env` and `backend/.env`)
- Go to: Storj DCS → Access → Access Keys
- Delete the old access grant and create a new one
- Update `backend/.env` and `pintumosa_secrets.env` with new values
- Add `STORJ_ACCESS_KEY`, `STORJ_SECRET_KEY`, `STORJ_ENDPOINT`, `STORJ_BUCKET`
  as Vercel environment variables (Settings → Environment Variables)

### 3. Verify Supabase RLS policies are active
- Go to: Supabase Dashboard → Authentication → Policies
- Confirm all 8 tables (users, deposits, withdraws, challenges, results, reports, games, blacklist, settings)
  have the policies from `supabase_security_fix.sql` — NOT the open "allow all" ones
- If any table shows "allow all" or no policies, re-run `supabase_security_fix.sql`
  in Dashboard → SQL Editor

### 4. Set CORS_ORIGIN in Vercel environment variables
- Go to: Vercel Dashboard → Project → Settings → Environment Variables
- Add: `CORS_ORIGIN` = `https://your-actual-domain.vercel.app`
- This restricts the KYC API endpoints to your frontend only

### 5. Clean git history (optional but recommended)
The Supabase anon key was committed in commit `16c9207`.
After rotating the key (step 1), the old key is harmless — but to clean history:
```bash
git filter-repo --path frontend/public/js/supabase-config.js --invert-paths
# or use BFG Repo Cleaner
```
Only do this if the repo is private or you force-push to remote.

## ✅ Already fixed in code (this PR)
- XSS in admin blacklist panel — `name` and `reason` now escaped with `esc()`
- Wildcard CORS (`*`) on KYC endpoints → restricted to `CORS_ORIGIN` env var
- `/api/kyc/url` now validates token AND verifies key belongs to requesting user
- Security headers added to both `vercel.json` files (X-Frame-Options, CSP, nosniff, etc.)
