// Local Device Document Vault using IndexedDB
// Files are stored directly on the user's browser/device to save server storage

const DB_NAME = 'otwptn_local_vault'
const DB_VERSION = 1
const STORE_NAME = 'documents'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'))
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export interface StoredLocalDoc {
  key: string // e.g. `${userId}::${jalurId}::${docName}`
  fileName: string
  fileType: string
  fileSize: number
  blob: Blob
  savedAt: string
}

export async function saveDocToLocalVault(
  userId: string,
  jalurId: string,
  docName: string,
  file: File
): Promise<{ fileName: string; fileSize: number; savedAt: string }> {
  const db = await openDB()
  const key = `${userId}::${jalurId}::${docName}`
  const savedAt = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const record: StoredLocalDoc = {
    key,
    fileName: file.name,
    fileType: file.type || 'application/octet-stream',
    fileSize: file.size,
    blob: file,
    savedAt,
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.put(record)

    req.onsuccess = () =>
      resolve({ fileName: file.name, fileSize: file.size, savedAt })
    req.onerror = () => reject(req.error)
  })
}

export async function getDocFromLocalVault(
  userId: string,
  jalurId: string,
  docName: string
): Promise<StoredLocalDoc | null> {
  try {
    const db = await openDB()
    const key = `${userId}::${jalurId}::${docName}`

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(key)

      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

export async function deleteDocFromLocalVault(
  userId: string,
  jalurId: string,
  docName: string
): Promise<void> {
  try {
    const db = await openDB()
    const key = `${userId}::${jalurId}::${docName}`

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.delete(key)

      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch {}
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
