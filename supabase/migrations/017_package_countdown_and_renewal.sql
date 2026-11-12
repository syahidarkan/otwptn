-- Migration 017: Package Countdown, Activation Triggers, H-7/H-5/H-3/H-1 Reminders & Renewal Flow

alter table public.profiles
  add column if not exists tier_starts_at timestamptz,
  add column if not exists pending_activation_tier text,
  add column if not exists onboarding_completed_at timestamptz;

alter table public.mentoring
  add column if not exists package_starts_at timestamptz,
  add column if not exists package_expires_at timestamptz,
  add column if not exists wa_group_joined_at timestamptz,
  add column if not exists start_notified_at timestamptz;

alter table public.orders
  add column if not exists is_renewal boolean not null default false,
  add column if not exists renewal_mentor_choice text,
  add column if not exists previous_mentor_id uuid;

create table if not exists public.package_reminder_logs (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('user_renewal', 'mentor_task')),
  user_id uuid not null,
  mentoring_id uuid,
  milestone_day int not null check (milestone_day in (7, 5, 3, 1)),
  expires_at timestamptz not null,
  sent_at timestamptz not null default now(),
  unique (target_type, user_id, milestone_day, expires_at)
);

alter table public.package_reminder_logs enable row level security;

create policy "Service role manages reminder logs"
  on public.package_reminder_logs
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

