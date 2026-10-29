-- Dashboard motivational quotes, submitted by any logged-in user, shown randomly to everyone.
create table if not exists quotes (
  id          uuid primary key default gen_random_uuid(),
  text        text not null,
  author      text,
  user_id     uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table quotes enable row level security;

create policy "quotes_select_all_authenticated"
  on quotes for select
  to authenticated
  using (true);

create policy "quotes_insert_own"
  on quotes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "quotes_delete_own"
  on quotes for delete
  to authenticated
  using (auth.uid() = user_id);

-- seed a starter quote so the dashboard never shows empty before users add their own
insert into quotes (text, author) values
  ('Jangan peduli kata orang, buktikan kalau kamu bisa!', 'Tim otwptn');
