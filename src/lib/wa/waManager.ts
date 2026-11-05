/**
 * WhatsApp Web session manager using Baileys.
 * This runs as a singleton in the custom server process.
 * NOT compatible with Vercel serverless — requires a persistent Node.js process.
 */
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  type WASocket,
  type ConnectionState,
  type WAMessage,
  type proto,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import path from 'path'
import fs from 'fs'
import { EventEmitter } from 'events'

const SESSION_DIR = path.join(process.cwd(), 'wa-session')
const MESSAGES_FILE = path.join(SESSION_DIR, 'recent-messages.json')
const MAX_STORED_MESSAGES = 200

export type WAStatus = 'disconnected' | 'qr' | 'connecting' | 'connected'

export interface WAMessage2 {
  id: string
  from: string
  fromName: string
  text: string
  timestamp: number
  isMe: boolean
  isGroup: boolean
  groupName?: string
}

export interface WAState {
  status: WAStatus
  qr?: string        // base64 PNG data URL
  phone?: string
  messages: WAMessage2[]
}

class WAManager extends EventEmitter {
  private sock: WASocket | null = null
  private state: WAState = { status: 'disconnected', messages: [] }
  private retryCount = 0
  private connecting = false

  constructor() {
    super()
    fs.mkdirSync(SESSION_DIR, { recursive: true })
    this.loadMessages()
  }

  getState(): WAState {
    return { ...this.state, messages: [...this.state.messages] }
  }

  private setState(partial: Partial<WAState>) {
    this.state = { ...this.state, ...partial }
    this.emit('state', this.getState())
  }

  private loadMessages() {
    try {
      if (fs.existsSync(MESSAGES_FILE)) {
        const raw = fs.readFileSync(MESSAGES_FILE, 'utf8')
        this.state.messages = JSON.parse(raw)
      }
    } catch {}
  }

  private saveMessages() {
    try {
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify(this.state.messages.slice(-MAX_STORED_MESSAGES)))
    } catch {}
  }

  async connect() {
    if (this.connecting) return
    this.connecting = true

    try {
      const { state: authState, saveCreds } = await useMultiFileAuthState(SESSION_DIR)
      const { version } = await fetchLatestBaileysVersion()

      let QRCode: typeof import('qrcode') | null = null
      try { QRCode = await import('qrcode') } catch {}

      this.sock = makeWASocket({
        version,
        auth: {
          creds: authState.creds,
          keys: makeCacheableSignalKeyStore(authState.keys, undefined as never),
        },
        printQRInTerminal: true,
        markOnlineOnConnect: false,
        syncFullHistory: false,
        logger: undefined as never,
      })

      this.sock.ev.on('creds.update', saveCreds)

      this.sock.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
          let qrDataUrl = `data:text/plain,${qr}`
          if (QRCode) {
            try {
              qrDataUrl = await QRCode.toDataURL(qr, { width: 300, margin: 2 })
            } catch {}
          }
          this.setState({ status: 'qr', qr: qrDataUrl })
          console.log('[WA] QR code ready — scan with WhatsApp')
        }

        if (connection === 'open') {
          this.retryCount = 0
          this.connecting = false
          const jid = this.sock?.user?.id ?? ''
          const phone = jid.split(':')[0].split('@')[0]
          this.setState({ status: 'connected', qr: undefined, phone })
          console.log(`[WA] Connected as ${phone}`)
        }

        if (connection === 'connecting') {
          this.setState({ status: 'connecting' })
        }

        if (connection === 'close') {
          this.connecting = false
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut

          console.log(`[WA] Connection closed. Code: ${statusCode}. Reconnect: ${shouldReconnect}`)
          this.setState({ status: 'disconnected', qr: undefined })

          if (shouldReconnect && this.retryCount < 10) {
            this.retryCount++
            const delay = Math.min(2000 * this.retryCount, 30000)
            console.log(`[WA] Reconnecting in ${delay}ms (attempt ${this.retryCount})`)
            setTimeout(() => this.connect(), delay)
          } else if (statusCode === DisconnectReason.loggedOut) {
            console.log('[WA] Logged out — clearing session')
            this.clearSession()
          }
        }
      })

      this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return

        for (const msg of messages) {
          if (!msg.message || msg.key.fromMe === undefined) continue

          const jid = msg.key.remoteJid ?? ''
          const isGroup = jid.endsWith('@g.us')
          let groupName: string | undefined
          if (isGroup) {
            try {
              const meta = await this.sock?.groupMetadata(jid)
              groupName = meta?.subject
            } catch {}
          }

          const pushName = msg.pushName ?? ''
          const phone = jid.replace('@s.whatsapp.net', '').replace('@g.us', '')
          const text = msg.message?.conversation
            ?? msg.message?.extendedTextMessage?.text
            ?? msg.message?.imageMessage?.caption
            ?? msg.message?.videoMessage?.caption
            ?? '[media]'

          const waMsg: WAMessage2 = {
            id: msg.key.id ?? Date.now().toString(),
            from: phone,
            fromName: pushName || phone,
            text,
            timestamp: (msg.messageTimestamp as number) * 1000 || Date.now(),
            isMe: !!msg.key.fromMe,
            isGroup,
            groupName,
          }

          this.state.messages = [waMsg, ...this.state.messages].slice(0, MAX_STORED_MESSAGES)
          this.saveMessages()
          this.emit('message', waMsg)
          this.emit('state', this.getState())
        }
      })

    } catch (err) {
      console.error('[WA] Connect error:', err)
      this.connecting = false
      this.setState({ status: 'disconnected' })
    }
  }

  async sendMessage(to: string, text: string): Promise<boolean> {
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
    this.setState({ status: 'disconnected', qr: undefined })
  }

  clearSession() {
    this.disconnect()
    try {
      const files = fs.readdirSync(SESSION_DIR)
      for (const f of files) {
        if (f !== 'recent-messages.json') {
          fs.rmSync(path.join(SESSION_DIR, f), { recursive: true, force: true })
        }
      }
    } catch {}
    this.retryCount = 0
    console.log('[WA] Session cleared')
  }
}

// Singleton — shared across all API route calls within the same process
declare global {
  // eslint-disable-next-line no-var
  var __waManager: WAManager | undefined
}

export function getWAManager(): WAManager {
  if (!global.__waManager) {
    global.__waManager = new WAManager()
  }
  return global.__waManager
}

export function initWA() {
  const mgr = getWAManager()
  if (mgr.getState().status === 'disconnected') {
    mgr.connect()
  }
  return mgr
}
