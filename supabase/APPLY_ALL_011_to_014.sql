-- Run this whole file once in Supabase SQL Editor (project zbgoxyepvapkllvffjgn). Order matters. 010 is already applied.

-- ===== 012_security_hardening =====
-- Migration 012: security hardening. Idempotent: safe to run more than once.
-- Run in Supabase SQL Editor (project zbgoxyepvapkllvffjgn).

-- 0. Signup was failing for every new user ("Database error saving new user").
--    Recreate the trigger function defensively: never block auth signup, never copy a
--    user-controlled role, pin search_path.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  begin
    insert into public.profiles (id, full_name, avatar_url, email)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      new.raw_user_meta_data->>'avatar_url',
      new.email
    )
    on conflict (id) do nothing;
  exception when others then
    raise warning 'handle_new_user full insert failed for %: %', new.id, sqlerrm;
    begin
      insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
    exception when others then
      raise warning 'handle_new_user minimal insert failed for %: %', new.id, sqlerrm;
    end;
  end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 1. Who may change privileged columns. Service role / SQL editor (no auth.uid()) / admins /
--    trusted SECURITY DEFINER helpers that set app.priv_ok for their own transaction.
create or replace function public.is_privileged_caller()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or auth.role() = 'service_role' then return true; end if;
  if coalesce(current_setting('app.priv_ok', true), '') = '1' then return true; end if;
  return exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true);
end;
$$;

-- 1a. profiles: a normal user could previously UPDATE is_admin/role/tier/xp on their own row
--     (the RLS policy had no column restriction). Silently revert those columns.
create or replace function public.protect_profile_privileged()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_privileged_caller() then return new; end if;
  if tg_op = 'INSERT' then
    new.is_admin := false; new.role := 'user'; new.tier := 'free'; new.tier_expires_at := null;
    new.xp := 0; new.mentor_capacity := 5;
  else
    new.is_admin := old.is_admin;
    new.role := old.role;
    new.tier := old.tier;
    new.tier_expires_at := old.tier_expires_at;
    new.mentor_capacity := old.mentor_capacity;
    new.referral_code := old.referral_code;
    new.xp := old.xp;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_update on public.profiles;
create trigger trg_protect_profile_update
  before update on public.profiles
  for each row execute function public.protect_profile_privileged();

drop trigger if exists trg_protect_profile_insert on public.profiles;
create trigger trg_protect_profile_insert
  before insert on public.profiles
  for each row execute function public.protect_profile_privileged();

-- 1b. XP helpers were SECURITY DEFINER callable with ANY uid and ANY amount.
create or replace function public.increment_xp(uid uuid, points int) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and auth.role() <> 'service_role' and uid is distinct from auth.uid() then
    raise exception 'forbidden';
  end if;
  perform set_config('app.priv_ok', '1', true);
  update public.profiles set xp = xp + least(greatest(points, 0), 50), updated_at = now() where id = uid;
end;
$$;

-- 1c. mentoring: mentors may update their own mentees' working fields, not who/what/how much.
create or replace function public.protect_mentoring_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_privileged_caller() then return new; end if;
  new.user_id := old.user_id;
  new.order_id := old.order_id;
  new.tier := old.tier;
  new.mentor_id := old.mentor_id;
  new.mentor_name := old.mentor_name;
  new.mentor_email := old.mentor_email;
  new.status := old.status;
  new.zoom_sessions_total := old.zoom_sessions_total;
  new.revision_count_total := old.revision_count_total;
  new.squad_group_id := old.squad_group_id;
  return new;
end;
$$;

drop trigger if exists trg_protect_mentoring on public.mentoring;
create trigger trg_protect_mentoring
  before update on public.mentoring
  for each row execute function public.protect_mentoring_columns();

-- 2. Money tables: browsers must not insert rows directly. orders (a user could insert
--    status='paid', any tier/amount) and withdrawal_requests (status='paid', any amount)
--    are now written only by server routes using the service role.
drop policy if exists "Users can create own orders" on public.orders;
drop policy if exists "Users create own withdrawals" on public.withdrawal_requests;

-- one pending withdrawal per user (closes the double-withdraw race)
do $$ begin
  create unique index if not exists uq_withdrawal_one_pending
    on public.withdrawal_requests (user_id) where status = 'pending';
exception when others then
  raise warning 'uq_withdrawal_one_pending not created (duplicate pending rows exist): %', sqlerrm;
end $$;

-- one commission per order (closes webhook replay / double-credit)
do $$ begin
  create unique index if not exists uq_commission_order
    on public.ambassador_commissions (order_id) where order_id is not null;
exception when others then
  raise warning 'uq_commission_order not created (duplicate commissions exist, dedupe first): %', sqlerrm;
end $$;

-- 3. mentor_applications: applicants could insert status='approved' and then be auto-matched
--    to paying mentees by the mentor matcher. Force 'pending'; allow re-apply updates only.
drop policy if exists "Users create own applications" on public.mentor_applications;
create policy "Users create own applications"
  on public.mentor_applications for insert
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Users resubmit own applications" on public.mentor_applications;
create policy "Users resubmit own applications"
  on public.mentor_applications for update
  using (auth.uid() = user_id and status in ('pending', 'rejected'))
  with check (auth.uid() = user_id and status = 'pending');

-- 4. Atomic quota consumption (check + increment in one statement).
create or replace function public.consume_quota(p_user uuid, p_feature text, p_limit int)
returns boolean language plpgsql security definer set search_path = public as $$
declare ok boolean;
begin
  if auth.uid() is not null and auth.role() <> 'service_role' and p_user is distinct from auth.uid() then
    raise exception 'forbidden';
  end if;
  insert into public.usage_quotas (user_id, feature, used_count) values (p_user, p_feature, 1)
  on conflict (user_id, feature) do update
    set used_count = public.usage_quotas.used_count + 1
    where public.usage_quotas.used_count < p_limit
  returning true into ok;
  return coalesce(ok, false);
end;
$$;
revoke all on function public.consume_quota(uuid, text, int) from public, anon;
grant execute on function public.consume_quota(uuid, text, int) to authenticated, service_role;

-- 5. DB-backed rate limiter (service role only: RLS on, no policies).
create table if not exists public.api_rate_limits (
  id          bigint generated always as identity primary key,
  bucket      text not null,
  subject     text not null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_api_rate_limits_lookup on public.api_rate_limits (bucket, subject, created_at desc);
alter table public.api_rate_limits enable row level security;

-- 6. Storage: payment proofs and certificates contain personal / bank data.
--    Bucket 'payment-proofs' should be PRIVATE (admins read through signed URLs);
--    the upload route now uses unguessable names, but flip this once the admin UI uses
--    signed URLs:  update storage.buckets set public = false where id = 'payment-proofs';
--    Restrict 'uploads' writes to the owner's own folder (prestasi/<uid>/...):
do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'uploads_insert_own_folder') then
    execute $p$create policy "uploads_insert_own_folder" on storage.objects for insert to authenticated
      with check (bucket_id = 'uploads' and (storage.foldername(name))[2] = auth.uid()::text)$p$;
  end if;
exception when others then
  raise warning 'storage policy skipped: %', sqlerrm;
end $$;
-- Also review in Dashboard > Storage > Policies: remove any policy on 'uploads' or
-- 'payment-proofs' that grants INSERT/UPDATE/DELETE to anon or to all authenticated users.

-- ===== 011_notifications_broadcasts =====
-- Migration 011: Real broadcasts + per-user in-app notifications (replaces localStorage-only fake broadcast)

-- 1. Broadcasts (admin-sent mass messages, one row per send)
create table if not exists broadcasts (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  message          text not null,
  cta_url          text,
  channel          text not null check (channel in ('in_app', 'email', 'whatsapp', 'banner')),
  audience         text not null,
  recipient_count  int not null default 0,
  sent_count       int not null default 0,
  failed_count     int not null default 0,
  status           text not null default 'sending' check (status in ('sending', 'sent', 'partial', 'failed')),
  is_test          boolean not null default false,
  banner_active    boolean not null default false,
  idempotency_key  text,
  error_note       text,
  created_by       uuid references profiles(id) on delete set null,
  created_at       timestamptz not null default now(),
  completed_at     timestamptz
);

create unique index if not exists broadcasts_idempotency_key_uidx
  on broadcasts (idempotency_key) where idempotency_key is not null;

create index if not exists broadcasts_created_at_idx on broadcasts (created_at desc);

alter table broadcasts enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'broadcasts' and policyname = 'Admins manage broadcasts'
  ) then
    execute 'create policy "Admins manage broadcasts" on broadcasts for all
      using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true))
      with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true))';
  end if;
end $$;

-- 2. Notifications (what shows in the bell popover, one row per recipient)
create table if not exists notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  broadcast_id  uuid references broadcasts(id) on delete set null,
  title         text not null,
  message       text not null,
  cta_url       text,
  kind          text not null default 'broadcast' check (kind in ('broadcast', 'article', 'update', 'system')),
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on notifications (user_id, created_at desc);

create index if not exists notifications_broadcast_idx
  on notifications (broadcast_id);

alter table notifications enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'notifications' and policyname = 'Users view own notifications'
  ) then
    execute 'create policy "Users view own notifications" on notifications for select using (auth.uid() = user_id)';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'notifications' and policyname = 'Users mark own notifications read'
  ) then
    execute 'create policy "Users mark own notifications read" on notifications for update
      using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'notifications' and policyname = 'Admins manage notifications'
  ) then
    execute 'create policy "Admins manage notifications" on notifications for all
      using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true))
      with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true))';
  end if;
end $$;

-- RLS cannot limit which columns an UPDATE touches, so lock it down with column privileges:
-- signed-in users may only ever change read_at. Inserts/deletes happen via the service role.
revoke insert, update, delete on notifications from authenticated, anon;
grant select on notifications to authenticated;
grant update (read_at) on notifications to authenticated;

-- ===== 013_admin_audit_log =====
-- Migration 013: admin audit log (who did what, to whom). Written only by server routes
-- using the service role; admins can read it. Idempotent.

create table if not exists admin_audit_log (
  id              uuid primary key default gen_random_uuid(),
  admin_id        uuid references profiles(id) on delete set null,
  action          text not null,
  target_user_id  uuid references profiles(id) on delete set null,
  payload         jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists idx_admin_audit_log_created_at on admin_audit_log (created_at desc);
create index if not exists idx_admin_audit_log_target on admin_audit_log (target_user_id);

alter table admin_audit_log enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'admin_audit_log' and policyname = 'Admins can read audit log'
  ) then
    execute 'create policy "Admins can read audit log" on admin_audit_log for select using (
      exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
    )';
  end if;
end $$;

-- No insert/update/delete policy on purpose: only the service role (which bypasses RLS)
-- writes here, so the log cannot be edited or forged from a browser session.

-- ===== 014_drop_open_policies =====
-- Migration 014: drop "service role full access" policies that were created WITHOUT a role
-- restriction (for all using (true) with check (true)), which made these tables readable and
-- writable by anyone holding the public anon key. service_role bypasses RLS anyway, and every
-- table below keeps its dedicated own/admin/public-read policies.
drop policy if exists "service role full access profiles" on public.profiles;
drop policy if exists "service role full access packages" on public.packages;
drop policy if exists "service role full access modules" on public.modules;
drop policy if exists "service role full access jalur_pages" on public.jalur_pages;
drop policy if exists "service role full access lessons" on public.lessons;
drop policy if exists "service role full access registrations" on public.registrations;

