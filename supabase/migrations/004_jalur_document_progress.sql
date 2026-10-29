-- Per-user, per-jalur document checklist progress (Penyimpanan Dokumen feature).
create table if not exists jalur_document_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  jalur_id    text not null,
  doc_name    text not null,
  completed   boolean not null default false,
  updated_at  timestamptz not null default now(),
  unique (user_id, jalur_id, doc_name)
);

alter table jalur_document_progress enable row level security;

create policy "jdp_select_own"
  on jalur_document_progress for select
  to authenticated
  using (auth.uid() = user_id);

create policy "jdp_insert_own"
  on jalur_document_progress for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "jdp_update_own"
  on jalur_document_progress for update
  to authenticated
  using (auth.uid() = user_id);

create policy "jdp_delete_own"
  on jalur_document_progress for delete
  to authenticated
  using (auth.uid() = user_id);
