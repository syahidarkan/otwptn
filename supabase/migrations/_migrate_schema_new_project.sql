-- ============================================================
-- Full schema recreation for new Supabase project (zbgoxyepvapkllvffjgn)
-- Reconstructed by introspecting live production project (vqgkxckmqkmcpredtdbh)
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── profiles ───────────────────────────────────────────────
create table if not exists profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  full_name             text not null default '',
  email                 text not null default '',
  phone                 text,
  school                text,
  role                  text not null default 'user' check (role = any (array['user','member','admin'])),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  avatar_url            text,
  school_name           text,
  graduation_year       int,
  province              text,
  target_ptns           text[],
  target_jalurs         text[],
  target_majors         text[],
  avg_rapor             numeric,
  school_rank_tier      text,
  cert_count            int default 0,
  cert_highest_level    text,
  motivation_text       text,
  tier                  text not null default 'free',
  tier_expires_at       timestamptz,
  onboarding_completed  boolean not null default false,
  is_admin              boolean not null default false,
  target_score          int,
  daily_question_target int,
  study_days_per_week   int,
  biggest_challenge     text,
  learning_styles       text[],
  commitment_text       text
);

-- ─── packages ───────────────────────────────────────────────
create table if not exists packages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null check (category = any (array['essay_only','prestasi_only','hybrid'])),
  tier        text not null check (tier = any (array['review','dokumen','menyeluruh'])),
  price       int not null default 0,
  addon_price int not null default 50000,
  description text,
  features    text[],
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── modules ────────────────────────────────────────────────
create table if not exists modules (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  category      text not null default 'general',
  order_index   int not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  thumbnail_url text,
  file_url      text
);

-- ─── ptn_jalurs ─────────────────────────────────────────────
create table if not exists ptn_jalurs (
  id                uuid primary key default gen_random_uuid(),
  ptn_name          text not null,
  jalur_name        text not null,
  jalur_type        text not null,
  faculty           text,
  major             text,
  description       text,
  keketatan         numeric,
  requirements      text[],
  deadline_estimate text,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

-- ─── jalur_pages ────────────────────────────────────────────
create table if not exists jalur_pages (
  id           uuid primary key default gen_random_uuid(),
  university   text not null,
  name         text not null,
  category     text not null check (category = any (array['essay_only','prestasi_only','hybrid'])),
  biaya        int,
  persyaratan  text,
  url          text,
  pendaftaran  text,
  pengumuman   text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ─── community_channels ─────────────────────────────────────
create table if not exists community_channels (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  type         text not null,
  identifier   text not null unique,
  description  text,
  member_count int not null default 0,
  is_public    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ─── ecourses ───────────────────────────────────────────────
create table if not exists ecourses (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  content_url   text,
  tier_required text not null default 'web_premium',
  type          text not null default 'guide',
  order_index   int not null default 0,
  is_active     boolean not null default true,
  thumbnail_url text,
  created_at    timestamptz not null default now()
);

-- ─── usage_quotas ───────────────────────────────────────────
create table if not exists usage_quotas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade not null,
  feature     text not null,
  used_count  int not null default 0,
  reset_at    timestamptz,
  created_at  timestamptz not null default now(),
  unique(user_id, feature)
);

-- ─── orders ─────────────────────────────────────────────────
create table if not exists orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references profiles(id) on delete cascade not null,
  tier              text not null,
  amount            int not null,
  status            text not null default 'pending',
  doku_invoice_id   text,
  doku_payment_url  text,
  paid_at           timestamptz,
  created_at        timestamptz not null default now()
);

-- ─── essays ─────────────────────────────────────────────────
create table if not exists essays (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references profiles(id) on delete cascade not null,
  title            text not null default 'Essay Tanpa Judul',
  content          jsonb,
  target_ptn       text,
  target_jalur     text,
  status           text not null default 'draft',
  revision_count   int not null default 0,
  max_revisions    int not null default 2,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── essay_feedback ─────────────────────────────────────────
create table if not exists essay_feedback (
  id            uuid primary key default gen_random_uuid(),
  essay_id      uuid references essays(id) on delete cascade not null,
  feedback_json jsonb,
  score         numeric,
  created_at    timestamptz not null default now()
);

-- ─── kalkulator_sessions ────────────────────────────────────
create table if not exists kalkulator_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete cascade not null,
  input_data   jsonb,
  result_json  jsonb,
  created_at   timestamptz not null default now()
);

-- ─── otbee_conversations ────────────────────────────────────
create table if not exists otbee_conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade not null,
  title      text default 'Percakapan Baru',
  messages   jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── mentoring ──────────────────────────────────────────────
create table if not exists mentoring (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid references profiles(id) on delete cascade not null,
  order_id                 uuid references orders(id),
  tier                     text not null,
  wa_group_link            text,
  wa_group_confirmed       boolean not null default false,
  wa_group_sent_at         timestamptz,
  zoom_sessions_total      int not null default 0,
  zoom_sessions_used       int not null default 0,
  revision_count_total     int not null default 2,
  revision_count_used      int not null default 0,
  mentor_name              text,
  status                   text not null default 'pending',
  created_at               timestamptz not null default now()
);

-- ─── community_messages ─────────────────────────────────────
create table if not exists community_messages (
  id          uuid primary key default gen_random_uuid(),
  channel_id  uuid references community_channels(id) on delete cascade not null,
  user_id     uuid references profiles(id) on delete cascade not null,
  content     text,
  image_url   text,
  created_at  timestamptz not null default now()
);

-- ─── community_posts ────────────────────────────────────────
create table if not exists community_posts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references profiles(id) on delete cascade not null,
  content       text not null,
  image_url     text,
  likes_count   int not null default 0,
  replies_count int not null default 0,
  channel_id    uuid references community_channels(id),
  created_at    timestamptz not null default now()
);

-- ─── community_post_replies ─────────────────────────────────
create table if not exists community_post_replies (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references community_posts(id) on delete cascade not null,
  user_id    uuid references profiles(id) on delete cascade not null,
  content    text not null,
  created_at timestamptz not null default now()
);

-- ─── community_post_likes ───────────────────────────────────
create table if not exists community_post_likes (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references community_posts(id) on delete cascade not null,
  user_id    uuid references profiles(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

-- ─── lessons ────────────────────────────────────────────────
create table if not exists lessons (
  id            uuid primary key default gen_random_uuid(),
  module_id     uuid references modules(id) on delete cascade not null,
  title         text not null,
  content_type  text not null default 'video' check (content_type = any (array['video','text','pdf','template'])),
  content_url   text,
  content_body  text,
  order_index   int not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  thumbnail_url text,
  description   text,
  file_url      text
);

-- ─── registrations ──────────────────────────────────────────
create table if not exists registrations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade not null,
  package_id      uuid references packages(id),
  jalur_utama_id  text not null,
  addon_jalur_ids text[],
  total_price     int not null default 0,
  status          text not null default 'pending' check (status = any (array['pending','confirmed','rejected','expired'])),
  payment_proof   text,
  payment_method  text not null default 'transfer',
  confirmed_at    timestamptz,
  confirmed_by    uuid references profiles(id),
  notes           text,
  wa_group_link   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── Indexes ─────────────────────────────────────────────────
create index if not exists idx_essays_user_id on essays(user_id);
create index if not exists idx_community_messages_channel_id on community_messages(channel_id);
create index if not exists idx_community_messages_created_at on community_messages(created_at desc);
create index if not exists idx_community_posts_created_at on community_posts(created_at desc);
create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_usage_quotas_user_id on usage_quotas(user_id);
create index if not exists idx_mentoring_user_id on mentoring(user_id);
create index if not exists idx_ptn_jalurs_type on ptn_jalurs(jalur_type);

-- ─── Functions ───────────────────────────────────────────────
create or replace function public.is_admin()
 returns boolean
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$function$;

create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- ─── Triggers ────────────────────────────────────────────────
create or replace trigger essays_updated_at
  before update on essays
  for each row execute procedure update_updated_at();

create or replace trigger otbee_updated_at
  before update on otbee_conversations
  for each row execute procedure update_updated_at();

create or replace trigger profiles_updated_at
  before update on profiles
  for each row execute procedure update_updated_at();

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── RLS ─────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table packages enable row level security;
alter table modules enable row level security;
alter table ptn_jalurs enable row level security;
alter table jalur_pages enable row level security;
alter table community_channels enable row level security;
alter table ecourses enable row level security;
alter table usage_quotas enable row level security;
alter table orders enable row level security;
alter table essays enable row level security;
alter table essay_feedback enable row level security;
alter table kalkulator_sessions enable row level security;
alter table otbee_conversations enable row level security;
alter table mentoring enable row level security;
alter table community_messages enable row level security;
alter table community_posts enable row level security;
alter table community_post_replies enable row level security;
alter table community_post_likes enable row level security;
alter table lessons enable row level security;
alter table registrations enable row level security;

-- profiles
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on profiles for select using (is_admin());
create policy "Admins can update all profiles" on profiles for update using (is_admin());
create policy "user can read own profile" on profiles for select using (auth.uid() = id);
create policy "user can update own profile" on profiles for update using (auth.uid() = id);
create policy "admin can read all profiles" on profiles for select using ((auth.uid() = id) or is_admin());
create policy "admin can update all profiles" on profiles for update using ((auth.uid() = id) or is_admin());
create policy "service role full access profiles" on profiles for all using (true) with check (true);

-- packages
create policy "anyone can read packages" on packages for select using (true);
create policy "service role full access packages" on packages for all using (true) with check (true);

-- modules
create policy "authenticated can read modules" on modules for select using (auth.role() = 'authenticated');
create policy "service role full access modules" on modules for all using (true) with check (true);

-- ptn_jalurs
create policy "Anyone can view active jalurs" on ptn_jalurs for select using (is_active = true);
create policy "Admins can manage jalurs" on ptn_jalurs for all using (is_admin());
create policy "Service role can manage jalurs" on ptn_jalurs for all using (auth.role() = 'service_role');

-- jalur_pages
create policy "anyone can read jalur_pages" on jalur_pages for select using (true);
create policy "service role full access jalur_pages" on jalur_pages for all using (true) with check (true);

-- community_channels
create policy "Anyone can view public channels" on community_channels for select using (is_public = true);
create policy "Admins can manage channels" on community_channels for all using (is_admin());
create policy "Service role can manage channels" on community_channels for all using (auth.role() = 'service_role');

-- ecourses
create policy "Anyone can view ecourse metadata" on ecourses for select using (is_active = true);
create policy "Admins can manage ecourses" on ecourses for all using (is_admin());
create policy "Service role can manage ecourses" on ecourses for all using (auth.role() = 'service_role');

-- usage_quotas
create policy "Users can view own quotas" on usage_quotas for select using (auth.uid() = user_id);
create policy "Service role can manage quotas" on usage_quotas for all using (auth.role() = 'service_role');

-- orders
create policy "Users can view own orders" on orders for select using (auth.uid() = user_id);
create policy "Admins can view all orders" on orders for select using (is_admin());
create policy "Service role can manage orders" on orders for all using (auth.role() = 'service_role');

-- essays
create policy "Users can manage own essays" on essays for all using (auth.uid() = user_id);
create policy "Admins can view all essays" on essays for select using (is_admin());

-- essay_feedback
create policy "Users can view feedback for own essays" on essay_feedback for select using (
  exists (select 1 from essays e where e.id = essay_feedback.essay_id and e.user_id = auth.uid())
);
create policy "Service role can manage feedback" on essay_feedback for all using (auth.role() = 'service_role');

-- kalkulator_sessions
create policy "Users can manage own kalkulator sessions" on kalkulator_sessions for all using (auth.uid() = user_id);

-- otbee_conversations
create policy "Users can manage own conversations" on otbee_conversations for all using (auth.uid() = user_id);

-- mentoring
create policy "Users can view own mentoring" on mentoring for select using (auth.uid() = user_id);
create policy "Admins can manage all mentoring" on mentoring for all using (is_admin());
create policy "Service role can manage mentoring" on mentoring for all using (auth.role() = 'service_role');

-- community_messages
create policy "Authenticated users can view messages" on community_messages for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert messages" on community_messages for insert with check (auth.uid() = user_id);
create policy "Users can delete own messages" on community_messages for delete using (auth.uid() = user_id);
create policy "Admins can delete any message" on community_messages for delete using (is_admin());

-- community_posts
create policy "Anyone can view posts" on community_posts for select using (true);
create policy "Authenticated users can insert posts" on community_posts for insert with check (auth.uid() = user_id);
create policy "Users can delete own posts" on community_posts for delete using (auth.uid() = user_id);
create policy "Admins can delete any post" on community_posts for delete using (is_admin());

-- community_post_replies
create policy "Anyone can view replies" on community_post_replies for select using (true);
create policy "Authenticated users can insert replies" on community_post_replies for insert with check (auth.uid() = user_id);
create policy "Users can delete own replies" on community_post_replies for delete using (auth.uid() = user_id);

-- community_post_likes
create policy "Anyone can view likes" on community_post_likes for select using (true);
create policy "Authenticated users can manage own likes" on community_post_likes for all using (auth.uid() = user_id);

-- lessons
create policy "authenticated can read lessons" on lessons for select using (auth.role() = 'authenticated');
create policy "service role full access lessons" on lessons for all using (true) with check (true);

-- registrations
create policy "user can read own registrations" on registrations for select using (auth.uid() = user_id);
create policy "admin can read all registrations" on registrations for select using ((auth.uid() = user_id) or is_admin());
create policy "admin can update registrations" on registrations for update using ((auth.uid() = user_id) or is_admin());
create policy "service role full access registrations" on registrations for all using (true) with check (true);
