// Real service-role client (never forwards the visitor's cookies, so RLS is bypassed).
// Needed for bulk writes into other users' notification rows.
export { createServiceClient } from '@/lib/supabase/server'
