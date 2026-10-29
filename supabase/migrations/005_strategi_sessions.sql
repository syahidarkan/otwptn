-- "Atur Strategi" feature: deeper AI strategy recommendations, usually following
-- up a kalkulator_sessions calculation.
create table if not exists strategi_sessions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references profiles(id) on delete cascade not null,
  kalkulator_session_id uuid references kalkulator_sessions(id) on delete set null,
  input_data            jsonb,
  result_json           jsonb,
  created_at            timestamptz not null default now()
);

alter table strategi_sessions enable row level security;

create policy "strategi_sessions_select_own"
  on strategi_sessions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "strategi_sessions_insert_own"
  on strategi_sessions for insert
  to authenticated
  with check (auth.uid() = user_id);
