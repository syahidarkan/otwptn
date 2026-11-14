import type { ClipName } from './engine'
import type { ViewName } from './types'

/** Tiny pub/sub so any part of the app can make the mascot react (toast, loader, chat, forms ...). */
export type BrainEvent =
  | { type: 'success' | 'error' | 'info'; text?: string }
  | { type: 'say'; text: string; ms?: number }
  | { type: 'act'; clip: ClipName; view?: ViewName; text?: string }
  | { type: 'nav-start' | 'nav-end' }

type Listener = (e: BrainEvent) => void
const subs = new Set<Listener>()

export const otbeeBrain = {
  emit(e: BrainEvent) { subs.forEach(f => f(e)) },
  subscribe(f: Listener) { subs.add(f); return () => { subs.delete(f) } },
}
