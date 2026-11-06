-- Migration 014: drop "service role full access" policies that were created WITHOUT a role
-- restriction (for all using (true) with check (true)), which made these tables readable and
-- writable by anyone holding the public anon key. service_role bypasses RLS anyway, and every
-- table below keeps its dedicated own/admin/public-read policies.
drop policy if exists "service role full access profiles" on public.profiles;
drop policy if exists "service role full access packages" on public.packages;
drop policy if exists "service role full access modules" on public.modules;
drop policy if exists "service role full access jalur_pages" on public.jalur_pages;
drop policy if exists "service role full access lessons" on public.lessons;
drop policy if exists "service role full access registrations" on public.registrations;
