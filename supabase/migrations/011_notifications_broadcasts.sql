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
