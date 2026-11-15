-- Migration 019: Content Creator Account Activation and user_id linking
alter table profiles
  add column if not exists is_active boolean not null default true;

create index if not exists idx_profiles_is_active on profiles(is_active);

alter table career_applications
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_career_applications_user_id on career_applications(user_id);
