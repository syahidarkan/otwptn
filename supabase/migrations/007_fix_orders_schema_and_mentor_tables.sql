-- Migration 007: Fix orders schema mismatch + mentor_applications + mentor_payouts

-- 1. Add missing columns to orders table
alter table orders
  add column if not exists invoice_number  text unique,
  add column if not exists payment_method  text default 'doku',
  add column if not exists referral_code   text,
  add column if not exists doku_reference  text,
  add column if not exists payment_url     text,
  add column if not exists wa_group_link   text,
  add column if not exists mentor_name     text,
  add column if not exists notes           text,
  add column if not exists confirmed_by    uuid references profiles(id) on delete set null,
  add column if not exists confirmed_at    timestamptz,
  add column if not exists updated_at      timestamptz not null default now();

-- Also allow paid_at if missing
alter table orders
  add column if not exists paid_at timestamptz;

-- Admin can manage all orders
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'orders' and policyname = 'Admins can manage all orders'
  ) then
    execute 'create policy "Admins can manage all orders" on orders for all using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true))';
  end if;
end $$;

-- 2. Mentor applications table
create table if not exists mentor_applications (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references profiles(id) on delete cascade,
  full_name         text not null,
  email             text not null,
  phone             text,
  university        text not null,
  major             text not null,
  track             text,
  grad_year         text,
  loa_url           text,
  essay_url         text,
  cert_url          text,
  bank_name         text,
  account_number    text,
  account_holder    text,
  status            text not null default 'pending',  -- 'pending' | 'approved' | 'rejected'
  admin_note        text,
  reviewed_by       uuid references profiles(id) on delete set null,
  reviewed_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table mentor_applications enable row level security;

create policy "Users view own applications"
  on mentor_applications for select using (auth.uid() = user_id);

create policy "Users create own applications"
  on mentor_applications for insert with check (auth.uid() = user_id);

create policy "Admins manage all applications"
  on mentor_applications for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- 3. Mentor payouts table (honorarium per mentee)
create table if not exists mentor_payouts (
  id                uuid primary key default gen_random_uuid(),
  mentor_id         uuid references profiles(id) on delete cascade not null,
  mentee_id         uuid references profiles(id) on delete set null,
  order_id          uuid references orders(id) on delete set null,
  tier              text not null,
  amount            int not null,  -- honorarium in IDR
  status            text not null default 'pending',  -- 'pending' | 'cleared' | 'paid'
  created_at        timestamptz not null default now()
);

alter table mentor_payouts enable row level security;

create policy "Mentors view own payouts"
  on mentor_payouts for select using (auth.uid() = mentor_id);

create policy "Admins manage payouts"
  on mentor_payouts for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- 4. Add mentor_id to mentoring table
alter table mentoring
  add column if not exists mentor_id uuid references profiles(id) on delete set null,
  add column if not exists mentor_email text,
  add column if not exists checklist jsonb default '[]'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

-- Mentors can view their own mentees
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'mentoring' and policyname = 'Mentors view own mentoring records'
  ) then
    execute 'create policy "Mentors view own mentoring records" on mentoring for select using (auth.uid() = mentor_id)';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'mentoring' and policyname = 'Mentors update own mentoring records'
  ) then
    execute 'create policy "Mentors update own mentoring records" on mentoring for update using (auth.uid() = mentor_id)';
  end if;
end $$;

-- 5. Add role 'mentor' check to profiles
-- profiles.role can now be: 'user' | 'mentor' | 'admin'
-- (already handled by is_admin column for admin, role field for mentor)
