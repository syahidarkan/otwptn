/**
 * Baileys auth state backed by Supabase Storage.
 * Replaces useMultiFileAuthState — no filesystem volume needed.
 */
import { initAuthCreds, BufferJSON } from '@whiskeysockets/baileys'

const BUCKET = 'wa-session'

export async function useSupabaseAuthState(supabase) {
  // Ensure bucket exists
  const { error: bucketErr } = await supabase.storage.getBucket(BUCKET)
  if (bucketErr) {
    await supabase.storage.createBucket(BUCKET, { public: false })
  }

  async function readData(file) {
    try {
      const { data, error } = await supabase.storage.from(BUCKET).download(file)
      if (error || !data) return null
      const text = await data.text()
      return JSON.parse(text, BufferJSON.reviver)
    } catch {
      return null
    }
  }

  async function writeData(file, data) {
    try {
      const content = JSON.stringify(data, BufferJSON.replacer)
      const blob = new Blob([content], { type: 'application/json' })
      await supabase.storage.from(BUCKET).upload(file, blob, { upsert: true })
    } catch (err) {
      console.error('[WA Auth] Write error:', file, err?.message)
    }
  }

  async function removeData(file) {
    try {
      await supabase.storage.from(BUCKET).remove([file])
    } catch {}
  }

  const creds = (await readData('creds.json')) || initAuthCreds()

  const state = {
    creds,
    keys: {
      get: async (type, ids) => {
        const result = {}
        await Promise.all(
          ids.map(async id => {
            result[id] = await readData(`keys/${type}/${id}.json`)
          })
        )
        return result
      },
      set: async (data) => {
        const tasks = []
        for (const category of Object.keys(data)) {
          for (const id of Object.keys(data[category])) {
            const val = data[category][id]
            const file = `keys/${category}/${id}.json`
            tasks.push(val ? writeData(file, val) : removeData(file))
          }
        }
        await Promise.all(tasks)
      },
    },
  }

  return {
    state,
    saveCreds: () => writeData('creds.json', state.creds),
  }
}

export async function clearSupabaseSession(supabase) {
  try {
    // List and delete all files in bucket
    const { data: files } = await supabase.storage.from(BUCKET).list('', { limit: 1000 })
    if (files?.length) {
      await supabase.storage.from(BUCKET).remove(files.map(f => f.name))
    }
    const { data: keyFiles } = await supabase.storage.from(BUCKET).list('keys', { limit: 1000 })
    if (keyFiles?.length) {
      // List sub-folders
      for (const folder of keyFiles) {
        const { data: subFiles } = await supabase.storage
          .from(BUCKET).list(`keys/${folder.name}`, { limit: 1000 })
        if (subFiles?.length) {
          await supabase.storage.from(BUCKET)
            .remove(subFiles.map(f => `keys/${folder.name}/${f.name}`))
        }
      }
    }
    console.log('[WA Auth] Supabase session cleared')
  } catch (err) {
    console.error('[WA Auth] Clear error:', err?.message)
  }
}
