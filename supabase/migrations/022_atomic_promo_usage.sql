-- Migration 022: atomic promo code usage increment.
--
-- checkout/route.ts previously incremented promo_codes.used_count via a plain
-- read-then-write (select used_count, then update used_count = old + 1), which lets
-- concurrent checkouts both read the same used_count and both write the same
-- incremented value - so a promo code with max_uses can be used more times than its
-- limit under concurrent requests (a classic lost-update race).
--
-- This mirrors the consume_quota() pattern from migration 012: a single atomic
-- UPDATE ... WHERE guards the limit, so only requests that still fit under
-- max_uses succeed; a maxed-out code's extra concurrent callers all get `false`.
create or replace function public.increment_promo_usage(p_promo_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare ok boolean;
begin
  update public.promo_codes
    set used_count = used_count + 1,
        updated_at = now()
    where id = p_promo_id
      and is_active = true
      and (max_uses is null or used_count < max_uses)
  returning true into ok;
  return coalesce(ok, false);
end;
$$;

revoke all on function public.increment_promo_usage(uuid) from public, anon;
grant execute on function public.increment_promo_usage(uuid) to authenticated, service_role;
