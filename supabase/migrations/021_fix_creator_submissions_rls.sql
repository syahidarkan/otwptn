-- Migration 021: close a reward-fraud hole in creator_submissions RLS.
--
-- Migration 018's insert/update policies only checked auth.uid() = user_id (row ownership),
-- not which VALUES a user may write. In particular the update policy had no `with check` at
-- all, so any authenticated user could update their own row directly via the anon key
-- (bypassing the API) and set status='rewarded' plus any reward_amount - which
-- src/app/api/creator/route.ts sums into their withdrawable balance. Same bug class that
-- migration 012 already closed for orders / withdrawal_requests / mentor_applications; this
-- migration applies the same fix here.

drop policy if exists "Users can insert own creator submissions" on creator_submissions;
create policy "Users can insert own creator submissions"
  on creator_submissions for insert
  with check (auth.uid() = user_id and status = 'pending' and reward_amount = 0);

drop policy if exists "Users can update own creator submissions" on creator_submissions;
create policy "Users can update own creator submissions"
  on creator_submissions for update
  using (auth.uid() = user_id and status in ('pending', 'rejected'))
  with check (auth.uid() = user_id and status = 'pending' and reward_amount = 0);

-- Admins and the service role (used by the approval API route) are untouched by the above -
-- they match the separate "Admins can manage all" / "Service role can manage" policies from
-- migration 018, which already allow setting status/reward_amount freely.
