-- Migration 020: promo_codes table for custom super admin discount / referral codes
create table if not exists promo_codes (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  discount_type   text not null check (discount_type in ('percentage', 'fixed')),
  discount_value  numeric not null check (discount_value > 0),
  max_uses        integer null, -- null = unlimited
  used_count      integer not null default 0,
  valid_from      timestamptz not null default now(),
  valid_until     timestamptz null, -- null = no expiry
  is_active       boolean not null default true,
  notes           text null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_promo_codes_code on promo_codes(code);
create index if not exists idx_promo_codes_active on promo_codes(is_active);

alter table promo_codes enable row level security;

-- Admins can view and manage promo codes
drop policy if exists "Admins can manage promo codes" on promo_codes;
create policy "Admins can manage promo codes"
  on promo_codes for all
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and (p.is_admin = true or p.role in ('superadmin', 'admin')))
  );

-- Service role bypass
drop policy if exists "Service role full access promo codes" on promo_codes;
create policy "Service role full access promo codes"
  on promo_codes for all
  using (auth.role() = 'service_role');
