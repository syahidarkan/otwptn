import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { EventEmitter } from 'events'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import { useSupabaseAuthState, clearSupabaseSession } from './supabaseAuth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Config ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001
const SERVICE_TOKEN = process.env.WA_SERVICE_TOKEN || ''
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('[WA Service] SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Messages stored in memory (not critical to persist)
const MAX_MESSAGES = 200
let recentMessages = []

// ── Baileys ───────────────────────────────────────────────────────────────────
let QRCode = null
try { QRCode = (await import('qrcode')).default } catch {}

const {
  default: makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = await import('@whiskeysockets/baileys')

// Silent logger - Baileys requires a pino-compatible logger object
const logger = {
  level: 'silent',
  trace: () => {}, debug: () => {}, info: () => {},
  warn: () => {}, error: () => {}, fatal: () => {},
  child: () => logger,
}

// ── WA Manager ────────────────────────────────────────────────────────────────
class WAManager extends EventEmitter {
  constructor() {
    super()
    this.sock = null
    this.state = { status: 'disconnected', messages: [] }
    this.retryCount = 0
    this.connecting = false
  }

  getState() {
    return { ...this.state, messages: [...recentMessages] }
  }

  _setState(partial) {
    this.state = { ...this.state, ...partial }
    this.emit('state', this.getState())
  }

  async connect() {
    if (this.connecting) return
    this.connecting = true

    try {
      const { state: authState, saveCreds } = await useSupabaseAuthState(supabase)
      const { version } = await fetchLatestBaileysVersion()

      this.sock = makeWASocket({
        version,
        auth: {
          creds: authState.creds,
          keys: makeCacheableSignalKeyStore(authState.keys, logger),
        },
        printQRInTerminal: true,
        markOnlineOnConnect: false,
        syncFullHistory: false,
        logger,
        browser: ['otwptn Admin', 'Chrome', '120.0.0'],
        keepAliveIntervalMs: 25_000,
        connectTimeoutMs: 60_000,
      })

      this.sock.ev.on('creds.update', saveCreds)

      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
          let qrDataUrl = `data:text/plain,${qr}`
          if (QRCode) {
            try { qrDataUrl = await QRCode.toDataURL(qr, { width: 300, margin: 2 }) } catch {}
          }
          this._setState({ status: 'qr', qr: qrDataUrl })
          console.log('[WA] QR ready - scan now')
        }

        if (connection === 'open') {
          this.retryCount = 0
          this.connecting = false
          const jid = this.sock?.user?.id ?? ''
          const phone = jid.split(':')[0].split('@')[0]
          this._setState({ status: 'connected', qr: undefined, phone })
          console.log(`[WA] Connected as ${phone}`)
        }

        if (connection === 'connecting') {
          this._setState({ status: 'connecting' })
        }

        if (connection === 'close') {
          this.connecting = false
          const statusCode = lastDisconnect?.error?.output?.statusCode
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut

          console.log(`[WA] Closed. Code: ${statusCode}. Reconnect: ${shouldReconnect}`)
          this._setState({ status: 'disconnected', qr: undefined })

          if (shouldReconnect && this.retryCount < 10) {
            this.retryCount++
            const delay = Math.min(2000 * this.retryCount, 30000)
            console.log(`[WA] Retry ${this.retryCount} in ${delay}ms`)
            setTimeout(() => this.connect(), delay)
          } else if (statusCode === DisconnectReason.loggedOut) {
            await clearSupabaseSession(supabase)
          }
        }
      })

      this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return
        for (const msg of messages) {
          if (!msg.message) continue
          const jid = msg.key.remoteJid ?? ''
          const isGroup = jid.endsWith('@g.us')
          let groupName
          if (isGroup) {
            try { groupName = (await this.sock?.groupMetadata(jid))?.subject } catch {}
          }
          const phone = jid.replace('@s.whatsapp.net', '').replace('@g.us', '')
          const text = msg.message?.conversation
            ?? msg.message?.extendedTextMessage?.text
            ?? msg.message?.imageMessage?.caption
            ?? msg.message?.videoMessage?.caption
            ?? '[media]'

          const waMsg = {
            id: msg.key.id ?? Date.now().toString(),
            from: phone,
            fromName: msg.pushName || phone,
            text,
            timestamp: (msg.messageTimestamp ?? 0) * 1000 || Date.now(),
            isMe: !!msg.key.fromMe,
            isGroup,
            groupName,
          }

          recentMessages = [waMsg, ...recentMessages].slice(0, MAX_MESSAGES)
          this.emit('message', waMsg)
          this.emit('state', this.getState())
        }
      })

    } catch (err) {
      console.error('[WA] Connect error:', err)
      this.connecting = false
      this._setState({ status: 'disconnected' })
    }
  }

  async sendMessage(to, text) {
    if (!this.sock || this.state.status !== 'connected') return false
    try {
      const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`
      await this.sock.sendMessage(jid, { text })
      return true
    } catch (err) {
      console.error('[WA] Send error:', err)
      return false
    }
  }

  disconnect() {
    this.sock?.end(undefined)
    this.sock = null
    this._setState({ status: 'disconnected', qr: undefined })
  }

  async clearSession() {
    this.disconnect()
    await clearSupabaseSession(supabase)
    this.retryCount = 0
  }
}

const mgr = new WAManager()
mgr.connect()

// ── Express ───────────────────────────────────────────────────────────────────
const app = express()
app.use(express.json())
app.use(cors())

function auth(req, res, next) {
  if (!SERVICE_TOKEN) return next()
  if (req.headers['x-service-token'] !== SERVICE_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

app.get('/health', (_, res) => res.json({ ok: true, status: mgr.getState().status }))

app.get('/status', auth, (_, res) => {
  const s = mgr.getState()
  res.json({ status: s.status, qr: s.qr, phone: s.phone, messageCount: s.messages.length })
})

app.post('/status', auth, async (req, res) => {
  const { action } = req.body
  if (action === 'connect') { await mgr.connect(); return res.json({ ok: true }) }
  if (action === 'disconnect') { mgr.disconnect(); return res.json({ ok: true }) }
  if (action === 'logout') { await mgr.clearSession(); return res.json({ ok: true }) }
  res.status(400).json({ error: 'Unknown action' })
})

app.get('/messages', auth, (_, res) => {
  res.json({ messages: mgr.getState().messages })
})

app.post('/messages', auth, async (req, res) => {
  const { to, text } = req.body
  if (!to || !text) return res.status(400).json({ error: 'Missing to or text' })
  const ok = await mgr.sendMessage(to, text)
  res.json({ ok })
})

app.get('/events', auth, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)

  const s = mgr.getState()
  send('state', { status: s.status, qr: s.qr, phone: s.phone })

  const onState = s => send('state', { status: s.status, qr: s.qr, phone: s.phone })
  const onMsg = msg => send('message', msg)

  mgr.on('state', onState)
  mgr.on('message', onMsg)

  const ping = setInterval(() => res.write(': ping\n\n'), 20000)

  req.on('close', () => {
    mgr.off('state', onState)
    mgr.off('message', onMsg)
    clearInterval(ping)
  })
})

app.listen(PORT, () => {
  console.log(`[WA Service] Running on port ${PORT}`)
  console.log(`[WA Service] Supabase: ${SUPABASE_URL}`)
  console.log(`[WA Service] Token auth: ${SERVICE_TOKEN ? 'enabled' : 'DISABLED'}`)

  // Self-ping every 10 min to prevent Render free tier spin-down
  const SELF_URL = process.env.SELF_URL || process.env.RENDER_EXTERNAL_URL || 'https://otwptn.onrender.com'
  if (SELF_URL) {
    setInterval(async () => {
      try {
        await fetch(`${SELF_URL}/health`)
      } catch {}
    }, 10 * 60 * 1000)
    console.log(`[WA Service] Self-ping enabled: ${SELF_URL}/health`)
  }
})
