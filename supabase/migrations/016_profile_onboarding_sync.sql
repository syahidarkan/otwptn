-- Migration 016: Add onboarding extended profile columns so target_choices, jalur_tujuan, rapor_per_semester, essay_draft, and ambassador_code persist directly on profiles

alter table profiles
  add column if not exists target_choices jsonb default '[]'::jsonb,
  add column if not exists jalur_tujuan text,
  add column if not exists rapor_per_semester jsonb,
  add column if not exists essay_draft text,
  add column if not exists ambassador_code text;

