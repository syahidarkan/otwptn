-- Migration 015: career_applications table for recruitment & content creator applications
create table if not exists career_applications (
  id                uuid primary key default gen_random_uuid(),
  reference_id      text not null unique,
  position          text not null,
  full_name         text not null,
  phone             text not null,
  email             text not null,
  age               text not null,
  education_status  text not null,
  school_or_campus  text not null,
  instagram         text not null,
  tiktok            text,
  portfolio_link    text,
  phone_model       text not null,
  reason            text not null,
  status            text not null default 'pending',
  created_at        timestamptz not null default now()
);

alter table career_applications enable row level security;

create policy "Admins can view and manage career applications"
  on career_applications for all
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and (p.is_admin = true or p.role in ('superadmin', 'admin')))
  );

create policy "Service role can manage career applications"
  on career_applications for all
  using (auth.role() = 'service_role');

