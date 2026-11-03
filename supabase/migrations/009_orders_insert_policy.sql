-- Migration 009: Allow authenticated users to create their own orders
-- Previously missing: orders table had no INSERT policy for authenticated users

create policy "Users can create own orders"
  on orders for insert
  with check (auth.uid() = user_id);
