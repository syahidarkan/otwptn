-- Migration 006: XP, streak, referral codes, ambassador system, community posts

-- 1. Add XP, streak, referral_code to profiles
alter table profiles
  add column if not exists xp              int not null default 0,
  add column if not exists streak_days     int not null default 0,
  add column if not exists last_active_date date,
  add column if not exists referral_code   text unique;

-- Generate referral codes for existing users (NAMEOTWNN format)
create or replace function generate_referral_code(uid uuid) returns text as $$
declare
  base_name text;
  clean_name text;
  suffix     text;
  code       text;
  attempt    int := 0;
begin
  select coalesce(split_part(full_name, ' ', 1), 'USER') into base_name from profiles where id = uid;
  clean_name := regexp_replace(upper(base_name), '[^A-Z]', '', 'g');
  if length(clean_name) < 2 then clean_name := 'USER'; end if;
  clean_name := substr(clean_name, 1, 6);
  loop
    attempt := attempt + 1;
    suffix := lpad(attempt::text, 2, '0');
    code := clean_name || 'OTW' || suffix;
    if not exists (select 1 from profiles where referral_code = code) then
      return code;
    end if;
    if attempt > 99 then return uid::text; end if;
  end loop;
end;
$$ language plpgsql;

-- Fill referral_code for users that don't have one yet
do $$
declare r record;
begin
  for r in select id from profiles where referral_code is null loop
    update profiles set referral_code = generate_referral_code(r.id) where id = r.id;
  end loop;
end;
$$;

-- Trigger: auto-set referral_code on new profile insert
create or replace function auto_set_referral_code() returns trigger as $$
begin
  if new.referral_code is null then
    new.referral_code := generate_referral_code(new.id);
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_auto_referral_code on profiles;
create trigger trg_auto_referral_code
  before insert on profiles
  for each row execute function auto_set_referral_code();

-- 2. Ambassador commissions table
create table if not exists ambassador_commissions (
  id              uuid primary key default gen_random_uuid(),
  ambassador_id   uuid references profiles(id) on delete cascade not null,
  referred_user_id uuid references profiles(id) on delete set null,
  order_id        uuid,
  amount          int not null,  -- commission amount in IDR
  tier_purchased  text not null,
  status          text not null default 'pending',  -- 'pending' | 'cleared' | 'paid'
  created_at      timestamptz not null default now()
);

alter table ambassador_commissions enable row level security;

create policy "Ambassadors view own commissions"
  on ambassador_commissions for select using (auth.uid() = ambassador_id);

create policy "Admins manage commissions"
  on ambassador_commissions for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- 3. Withdrawal requests table
create table if not exists withdrawal_requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade not null,
  amount          int not null,
  bank_name       text not null,
  account_number  text not null,
  account_holder  text not null,
  status          text not null default 'pending',  -- 'pending' | 'approved' | 'rejected' | 'paid'
  admin_note      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table withdrawal_requests enable row level security;

create policy "Users view own withdrawals"
  on withdrawal_requests for select using (auth.uid() = user_id);

create policy "Users create own withdrawals"
  on withdrawal_requests for insert with check (auth.uid() = user_id);

create policy "Admins manage withdrawals"
  on withdrawal_requests for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- 4. Community posts (cuitan)
create table if not exists community_posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade not null,
  content     text not null,
  likes       int not null default 0,
  created_at  timestamptz not null default now()
);

alter table community_posts enable row level security;

create policy "Anyone can read community posts"
  on community_posts for select using (true);

create policy "Users create own posts"
  on community_posts for insert with check (auth.uid() = user_id);

create policy "Users delete own posts"
  on community_posts for delete using (auth.uid() = user_id);

create policy "Admins manage community posts"
  on community_posts for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- 5. Tracking jalur checkpoint progress
create table if not exists jalur_checkpoint_progress (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid references profiles(id) on delete cascade not null,
  jalur_id                text not null,
  completed_checkpoint_ids text[] not null default '{}',
  updated_at              timestamptz not null default now(),
  unique (user_id, jalur_id)
);

alter table jalur_checkpoint_progress enable row level security;

create policy "Users manage own checkpoint progress"
  on jalur_checkpoint_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 6. XP increment helper function
create or replace function increment_xp(uid uuid, points int) returns void as $$
begin
  update profiles set xp = xp + points, updated_at = now() where id = uid;
end;
$$ language plpgsql security definer;

-- 6. Streak update function (call daily on login)
create or replace function update_streak(uid uuid) returns void as $$
declare
  last_date date;
  today date := current_date;
begin
  select last_active_date into last_date from profiles where id = uid;
  if last_date = today then
    return; -- Already counted today
  elsif last_date = today - interval '1 day' then
    update profiles set streak_days = streak_days + 1, last_active_date = today, updated_at = now() where id = uid;
  else
    update profiles set streak_days = 1, last_active_date = today, updated_at = now() where id = uid;
  end if;
end;
$$ language plpgsql security definer;
