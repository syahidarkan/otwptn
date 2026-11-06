import { timingSafeEqual } from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

export function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  return (fwd ? fwd.split(',')[0].trim() : request.headers.get('x-real-ip')) || 'unknown'
}

// Only same-site relative paths; blocks "//evil.com", "/\evil.com", "@evil.com", absolute URLs.
export function safeNextPath(raw: string | null | undefined, fallback = '/dashboard'): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return fallback
  if (/[\r\n\\]/.test(raw)) return fallback
  return raw
}

// DB-backed fixed-window limiter (serverless safe). Fails open if the table is not migrated
// yet, so a missing migration never takes an endpoint down; apply migration 012.
export async function rateLimit(bucket: string, subject: string, max: number, windowSeconds: number): Promise<boolean> {
  try {
    const db = createServiceClient()
    const since = new Date(Date.now() - windowSeconds * 1000).toISOString()
    const { count, error } = await db
      .from('api_rate_limits')
      .select('id', { count: 'exact', head: true })
      .eq('bucket', bucket)
      .eq('subject', subject)
      .gte('created_at', since)
    if (error) return true
    if ((count ?? 0) >= max) return false
    await db.from('api_rate_limits').insert({ bucket, subject })
    return true
  } catch {
    return true
  }
}

export type QuotaFeature = 'ai_essay' | 'ai_kalkulator' | 'ai_strategi' | 'otbee_chat'

// Atomic check-and-increment BEFORE the paid AI call (the old read-then-increment-after
// flow let parallel requests all pass). Returns false when the limit is already reached.
export async function consumeQuota(userId: string, feature: QuotaFeature, limit: number | null): Promise<boolean> {
  if (limit === null) return true
  const db = createServiceClient()
  const { data, error } = await db.rpc('consume_quota', { p_user: userId, p_feature: feature, p_limit: limit })
  if (!error) return data === true
  // RPC missing (migration 012 not applied yet): degrade to the old non-atomic logic.
  const { data: row } = await db.from('usage_quotas').select('used_count').eq('user_id', userId).eq('feature', feature).maybeSingle()
  const used = row?.used_count ?? 0
  if (used >= limit) return false
  await db.from('usage_quotas').upsert({ user_id: userId, feature, used_count: used + 1 }, { onConflict: 'user_id,feature' })
  return true
}

export interface ChatMessage { role: 'user' | 'assistant'; content: string }

// Client-supplied chat history is untrusted: drop system/tool roles (prompt override),
// cap turns and size (cost abuse).
export function sanitizeChatMessages(input: unknown, maxTurns = 20, maxChars = 4000): ChatMessage[] {
  if (!Array.isArray(input)) return []
  const out: ChatMessage[] = []
  for (const m of input.slice(-maxTurns)) {
    if (!m || typeof m !== 'object') continue
    const role = (m as { role?: unknown }).role
    const content = (m as { content?: unknown }).content
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') continue
    out.push({ role, content: content.slice(0, maxChars) })
  }
  return out
}

export function matchesFileSignature(bytes: Uint8Array, type: string): boolean {
  const h = (i: number) => bytes[i]
  if (type === 'image/jpeg') return h(0) === 0xff && h(1) === 0xd8 && h(2) === 0xff
  if (type === 'image/png') return h(0) === 0x89 && h(1) === 0x50 && h(2) === 0x4e && h(3) === 0x47
  if (type === 'application/pdf') return h(0) === 0x25 && h(1) === 0x50 && h(2) === 0x44 && h(3) === 0x46
  return false
}
