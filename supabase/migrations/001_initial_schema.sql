-- ============================================================
-- otwptn Season 2 — Initial Schema
-- ============================================================

-- ─── Extensions ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Profiles ───────────────────────────────────────────────
create table if not exists profiles (
  id                    uuid references auth.users on delete cascade primary key,
  full_name             text,
  avatar_url            text,
  school_name           text,
  graduation_year       int,
  province              text,
  target_ptns           text[],
  target_jalurs         text[],
  target_majors         text[],
  avg_rapor             numeric,
  school_rank_tier      text,   -- 'top5' | 'top10' | 'top25' | 'average' | 'below'
  cert_count            int default 0,
  cert_highest_level    text,   -- 'sekolah' | 'kab_kota' | 'provinsi' | 'nasional' | 'internasional'
  motivation_text       text,
  tier                  text not null default 'free', -- 'free' | 'web_premium' | 'review' | 'reguler' | 'intensif'
  tier_expires_at       timestamptz,
  onboarding_completed  boolean not null default false,
  is_admin              boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Admins can update all profiles"
  on profiles for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── Usage Quotas ────────────────────────────────────────────
create table if not exists usage_quotas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade not null,
  feature     text not null,  -- 'ai_essay' | 'ai_kalkulator' | 'otbee_chat'
  used_count  int not null default 0,
  reset_at    timestamptz,
  created_at  timestamptz not null default now(),
  unique(user_id, feature)
);

alter table usage_quotas enable row level security;

create policy "Users can view own quotas"
  on usage_quotas for select using (auth.uid() = user_id);

create policy "Service role can manage quotas"
  on usage_quotas for all using (auth.role() = 'service_role');

-- ─── Orders / Payments ───────────────────────────────────────
create table if not exists orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references profiles(id) on delete cascade not null,
  tier              text not null,
  amount            int not null,  -- IDR in full units
  status            text not null default 'pending',  -- 'pending' | 'paid' | 'failed' | 'expired'
  doku_invoice_id   text,
  doku_payment_url  text,
  paid_at           timestamptz,
  created_at        timestamptz not null default now()
);

alter table orders enable row level security;

create policy "Users can view own orders"
  on orders for select using (auth.uid() = user_id);

create policy "Admins can view all orders"
  on orders for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Service role can manage orders"
  on orders for all using (auth.role() = 'service_role');

-- ─── PTN Jalur Directory ─────────────────────────────────────
create table if not exists ptn_jalurs (
  id                  uuid primary key default gen_random_uuid(),
  ptn_name            text not null,
  jalur_name          text not null,
  jalur_type          text not null,  -- 'essay' | 'prestasi' | 'hybrid'
  faculty             text,
  major               text,
  description         text,
  keketatan           numeric,  -- competition ratio estimate
  requirements        text[],
  deadline_estimate   text,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now()
);

alter table ptn_jalurs enable row level security;

create policy "Anyone can view active jalurs"
  on ptn_jalurs for select using (is_active = true);

create policy "Admins can manage jalurs"
  on ptn_jalurs for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- ─── Essays ──────────────────────────────────────────────────
create table if not exists essays (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references profiles(id) on delete cascade not null,
  title            text not null default 'Essay Tanpa Judul',
  content          jsonb,  -- Tiptap JSON
  target_ptn       text,
  target_jalur     text,
  status           text not null default 'draft',  -- 'draft' | 'submitted' | 'reviewed'
  revision_count   int not null default 0,
  max_revisions    int not null default 2,  -- overridden by tier
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table essays enable row level security;

create policy "Users can manage own essays"
  on essays for all using (auth.uid() = user_id);

create policy "Admins can view all essays"
  on essays for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- ─── Essay AI Feedback ───────────────────────────────────────
create table if not exists essay_feedback (
  id            uuid primary key default gen_random_uuid(),
  essay_id      uuid references essays(id) on delete cascade not null,
  feedback_json jsonb,  -- structured AI feedback
  score         numeric,
  created_at    timestamptz not null default now()
);

alter table essay_feedback enable row level security;

create policy "Users can view feedback for own essays"
  on essay_feedback for select using (
    exists (select 1 from essays e where e.id = essay_id and e.user_id = auth.uid())
  );

create policy "Service role can manage feedback"
  on essay_feedback for all using (auth.role() = 'service_role');

-- ─── Kalkulator Sessions ─────────────────────────────────────
create table if not exists kalkulator_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete cascade not null,
  input_data   jsonb,
  result_json  jsonb,
  created_at   timestamptz not null default now()
);

alter table kalkulator_sessions enable row level security;

create policy "Users can manage own kalkulator sessions"
  on kalkulator_sessions for all using (auth.uid() = user_id);

-- ─── Otbee AI Conversations ──────────────────────────────────
create table if not exists otbee_conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade not null,
  title      text default 'Percakapan Baru',
  messages   jsonb not null default '[]',  -- [{role, content, created_at}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table otbee_conversations enable row level security;

create policy "Users can manage own conversations"
  on otbee_conversations for all using (auth.uid() = user_id);

-- ─── Mentoring ───────────────────────────────────────────────
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
  status                   text not null default 'pending',  -- 'pending' | 'active' | 'completed'
  created_at               timestamptz not null default now()
);

alter table mentoring enable row level security;

create policy "Users can view own mentoring"
  on mentoring for select using (auth.uid() = user_id);

create policy "Admins can manage all mentoring"
  on mentoring for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Service role can manage mentoring"
  on mentoring for all using (auth.role() = 'service_role');

-- ─── Community Channels ──────────────────────────────────────
create table if not exists community_channels (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  type         text not null,  -- 'jalur' | 'university' | 'general'
  identifier   text not null unique,  -- e.g. 'ppkb-ui', 'sjb-ui', 'general'
  description  text,
  member_count int not null default 0,
  is_public    boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table community_channels enable row level security;

create policy "Anyone can view public channels"
  on community_channels for select using (is_public = true);

-- ─── Community Messages ──────────────────────────────────────
create table if not exists community_messages (
  id          uuid primary key default gen_random_uuid(),
  channel_id  uuid references community_channels(id) on delete cascade not null,
  user_id     uuid references profiles(id) on delete cascade not null,
  content     text,
  image_url   text,
  created_at  timestamptz not null default now()
);

alter table community_messages enable row level security;

create policy "Authenticated users can view messages"
  on community_messages for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert messages"
  on community_messages for insert with check (auth.uid() = user_id);

create policy "Users can delete own messages"
  on community_messages for delete using (auth.uid() = user_id);

create policy "Admins can delete any message"
  on community_messages for delete using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- ─── Community Posts ─────────────────────────────────────────
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

alter table community_posts enable row level security;

create policy "Anyone can view posts"
  on community_posts for select using (true);

create policy "Authenticated users can insert posts"
  on community_posts for insert with check (auth.uid() = user_id);

create policy "Users can delete own posts"
  on community_posts for delete using (auth.uid() = user_id);

create policy "Admins can delete any post"
  on community_posts for delete using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- ─── Community Post Replies ──────────────────────────────────
create table if not exists community_post_replies (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references community_posts(id) on delete cascade not null,
  user_id    uuid references profiles(id) on delete cascade not null,
  content    text not null,
  created_at timestamptz not null default now()
);

alter table community_post_replies enable row level security;

create policy "Anyone can view replies"
  on community_post_replies for select using (true);

create policy "Authenticated users can insert replies"
  on community_post_replies for insert with check (auth.uid() = user_id);

create policy "Users can delete own replies"
  on community_post_replies for delete using (auth.uid() = user_id);

-- ─── Post Likes ──────────────────────────────────────────────
create table if not exists community_post_likes (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references community_posts(id) on delete cascade not null,
  user_id    uuid references profiles(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

alter table community_post_likes enable row level security;

create policy "Anyone can view likes"
  on community_post_likes for select using (true);

create policy "Authenticated users can manage own likes"
  on community_post_likes for all using (auth.uid() = user_id);

-- ─── E-Courses ───────────────────────────────────────────────
create table if not exists ecourses (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  content_url    text,
  tier_required  text not null default 'web_premium',
  type           text not null default 'guide',  -- 'video' | 'template' | 'guide'
  order_index    int not null default 0,
  is_active      boolean not null default true,
  thumbnail_url  text,
  created_at     timestamptz not null default now()
);

alter table ecourses enable row level security;

create policy "Anyone can view ecourse metadata"
  on ecourses for select using (is_active = true);

create policy "Admins can manage ecourses"
  on ecourses for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- ─── Updated_at trigger helper ───────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger essays_updated_at
  before update on essays
  for each row execute procedure update_updated_at();

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure update_updated_at();

create trigger otbee_updated_at
  before update on otbee_conversations
  for each row execute procedure update_updated_at();

-- ─── Indexes ─────────────────────────────────────────────────
create index if not exists idx_essays_user_id on essays(user_id);
create index if not exists idx_community_messages_channel_id on community_messages(channel_id);
create index if not exists idx_community_messages_created_at on community_messages(created_at desc);
create index if not exists idx_community_posts_created_at on community_posts(created_at desc);
create index if not exists idx_community_posts_channel_id on community_posts(channel_id);
create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_usage_quotas_user_id on usage_quotas(user_id);
create index if not exists idx_mentoring_user_id on mentoring(user_id);
create index if not exists idx_otbee_conversations_user_id on otbee_conversations(user_id);
create index if not exists idx_ptn_jalurs_type on ptn_jalurs(jalur_type);
create index if not exists idx_ptn_jalurs_active on ptn_jalurs(is_active);

-- ─── Seed: Community Channels ────────────────────────────────
insert into community_channels (name, type, identifier, description, is_public) values
  ('Semua Jalur', 'general', 'general', 'Diskusi umum jalur non-tes PTN', true),
  ('PPKB UI', 'jalur', 'ppkb-ui', 'Khusus peserta PPKB Universitas Indonesia', true),
  ('SJP UI', 'jalur', 'sjp-ui', 'Seleksi Jalur Prestasi UI', true),
  ('PBUB UGM', 'jalur', 'pbub-ugm', 'Penelusuran Bibit Unggul Berpotensi UGM', true),
  ('SMUP UNPAD', 'jalur', 'smup-unpad', 'Seleksi Masuk UNPAD jalur non-tes', true),
  ('Jalur Essay', 'jalur', 'jalur-essay', 'Semua jalur berbasis essay/motivation letter', true),
  ('Jalur Prestasi', 'jalur', 'jalur-prestasi', 'Semua jalur berbasis prestasi/sertifikat', true),
  ('Jalur Hybrid', 'jalur', 'jalur-hybrid', 'Jalur yang mensyaratkan essay dan prestasi', true)
on conflict (identifier) do nothing;
