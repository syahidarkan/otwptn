-- Migration 010: Pricing v2 (Mode x Track x Tier), Squad grouping, auto mentor matching

-- 1. Orders: mode/track/squad + mentor_id (admin previously only had mentor_name text)
create table if not exists squads (
  id           uuid primary key default gen_random_uuid(),
  track        text not null check (track in ('essay', 'prestasi', 'hybrid')),
  tier         text not null,
  invite_code  text not null unique,
  status       text not null default 'forming' check (status in ('forming', 'active', 'completed')),
  mentor_id    uuid references profiles(id) on delete set null,
  mentor_name  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table squads enable row level security;

create policy "Members can view own squad"
  on squads for select using (
    exists (select 1 from orders o where o.squad_group_id = squads.id and o.user_id = auth.uid())
  );

create policy "Admins can manage all squads"
  on squads for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

alter table orders
  add column if not exists mode            text not null default 'individu' check (mode in ('individu', 'squad')),
  add column if not exists track           text not null default 'essay' check (track in ('essay', 'prestasi', 'hybrid')),
  add column if not exists squad_group_id  uuid references squads(id) on delete set null,
  add column if not exists mentor_id       uuid references profiles(id) on delete set null;

-- 2. Mentoring: link back to squad + mentor capacity on profiles for auto-matching load balance
alter table mentoring
  add column if not exists squad_group_id uuid references squads(id) on delete set null;

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'mentoring_order_id_unique'
  ) then
    execute 'alter table mentoring add constraint mentoring_order_id_unique unique (order_id)';
  end if;
end $$;

alter table profiles
  add column if not exists mentor_capacity int not null default 5;

-- 3. mentor_applications.track already exists (001/007) and is used as the auto-match specialty filter.
--    A NULL track on an approved mentor application means "generalist" — eligible for any track.
