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
