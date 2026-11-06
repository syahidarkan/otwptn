// Completed-lesson ids live in localStorage; exposed as an external store so both the
// course map and the lesson reader stay in sync without setState-in-effect.
const STORAGE_KEY = 'ecourse_v2_completed'
const CHANGE_EVENT = 'ecourse-completed-change'

const EMPTY: string[] = []
let cacheRaw: string | null | undefined
let cacheValue: string[] = EMPTY

export function getCompletedSnapshot(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === cacheRaw) return cacheValue
    cacheRaw = raw
    const parsed: unknown = raw ? JSON.parse(raw) : []
    cacheValue = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : EMPTY
    return cacheValue
  } catch {
    return EMPTY
  }
}

export function getCompletedServerSnapshot(): string[] {
  return EMPTY
}

export function subscribeCompleted(onChange: () => void): () => void {
  window.addEventListener('storage', onChange)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

export function writeCompleted(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT))
}
