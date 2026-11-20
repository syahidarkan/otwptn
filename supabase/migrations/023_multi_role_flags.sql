-- Migration 023: separate mentor/creator approval from profiles.role.
--
-- Before this, admin approval overwrote profiles.role wholesale on acceptance
-- (mentor-applications set role='mentor', career-applications set role='creator').
-- One person can legitimately go through BOTH flows under the same email (e.g.
-- register as a regular member, later get approved as a mentor, later also apply
-- as a content creator) - the second approval would silently wipe out the first
-- one's access, since role is a single text column.
--
-- is_mentor / is_creator are additive flags checked by the real gates (proxy.ts,
-- mentor/layout.tsx, dashboard/creator gate, Sidebar, AI-quota "isStaff" checks).
-- profiles.role is kept as-is for display/legacy purposes only.
alter table profiles
  add column if not exists is_mentor  boolean not null default false,
  add column if not exists is_creator boolean not null default false;

update profiles set is_mentor = true where role = 'mentor' and not is_mentor;
update profiles set is_creator = true where role = 'creator' and not is_creator;
