-- Migration 024: mentor photo wearing almamater (almet) jacket.
--
-- Stored on mentor_applications (so admins reviewing an application see it
-- alongside the LOA/essay/cert) AND on profiles (so it survives independently
-- of the one-time application record and can be shown/edited from the mentor
-- dashboard at any time, including for mentors approved before this field existed).
alter table mentor_applications
  add column if not exists almet_photo_url text;

alter table profiles
  add column if not exists mentor_photo_url text;
