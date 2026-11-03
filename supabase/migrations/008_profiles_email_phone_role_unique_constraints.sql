-- Migration 008: Add email/phone/role to profiles, fix unique constraints

-- 1. Add missing columns to profiles
alter table profiles
  add column if not exists email  text,
  add column if not exists phone  text,
  add column if not exists role   text not null default 'user';

-- 2. Backfill email from auth.users for existing users
update profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- 3. Backfill role='admin' for existing admins
update profiles set role = 'admin' where is_admin = true and role = 'user';

-- 4. Update handle_new_user trigger to also copy email
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, avatar_url, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 5. Add unique constraint on mentoring(user_id) for upsert support
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'mentoring'::regclass and contype = 'u'
    and conname = 'mentoring_user_id_key'
  ) then
    alter table mentoring add constraint mentoring_user_id_key unique (user_id);
  end if;
end $$;

-- 6. Add unique constraint on mentor_applications(user_id) for upsert support
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'mentor_applications'::regclass and contype = 'u'
    and conname = 'mentor_applications_user_id_key'
  ) then
    alter table mentor_applications add constraint mentor_applications_user_id_key unique (user_id);
  end if;
end $$;

-- 7. Index on profiles.email for fast lookups
create index if not exists idx_profiles_email on profiles(email);
create index if not exists idx_profiles_role on profiles(role);
