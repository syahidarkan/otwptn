/**
 * Custom Next.js server with WhatsApp Web (Baileys) integration.
 * Run with: npm run start:wa
 *
 * This server:
 * - Starts Next.js as usual on the configured port
 * - Initializes the WA session manager (persistent WebSocket to WhatsApp)
 * - Keeps the WA connection alive across requests
 *
 * NOT compatible with Vercel. Deploy to Railway, Render, or VPS.
 */
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { initWA } from './src/lib/wa/waManager'

const dev = process.env.NODE_ENV !== 'production'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Initialize WhatsApp connection
  console.log('[Server] Initializing WhatsApp session...')
  initWA()

  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  }).listen(port, () => {
    console.log(`[Server] Ready on http://localhost:${port}`)
    console.log('[Server] WhatsApp Web session active')
  })
})
