-- Migration 018: creator_submissions for Content Creator task tracking and video submissions
create table if not exists creator_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  platform text not null default 'tiktok', -- 'tiktok' | 'instagram' | 'youtube' | 'other'
  video_url text not null,
  campaign_topic text,
  caption_used text,
  view_count integer default 0,
  like_count integer default 0,
  status text not null default 'pending', -- 'pending' | 'reviewed' | 'approved' | 'rewarded' | 'rejected'
  reward_amount integer default 0,
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_creator_submissions_user_id on creator_submissions(user_id);
create index if not exists idx_creator_submissions_status on creator_submissions(status);

alter table creator_submissions enable row level security;

drop policy if exists "Users can view own creator submissions" on creator_submissions;
create policy "Users can view own creator submissions"
  on creator_submissions for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own creator submissions" on creator_submissions;
create policy "Users can insert own creator submissions"
  on creator_submissions for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own creator submissions" on creator_submissions;
create policy "Users can update own creator submissions"
  on creator_submissions for update using (auth.uid() = user_id);

drop policy if exists "Admins can manage all creator submissions" on creator_submissions;
create policy "Admins can manage all creator submissions"
  on creator_submissions for all using (
    exists (select 1 from profiles where id = auth.uid() and (is_admin = true or role in ('admin', 'superadmin')))
  );

drop policy if exists "Service role can manage creator submissions" on creator_submissions;
create policy "Service role can manage creator submissions"
  on creator_submissions for all using (true) with check (true);
