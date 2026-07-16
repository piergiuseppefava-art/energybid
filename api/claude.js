import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Inizializzato una volta per container — null se env mancanti (fallback graceful in locale)
let ratelimit = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(20, '10 m'),
  })
}

const ALLOWED_ORIGINS = [
  process.env.ALLOWED_ORIGIN ?? 'https://lumia-energy.vercel.app',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  'http://localhost:5173',
].filter(Boolean)

function getCorsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

const ALLOWED_MODELS = ['claude-sonnet-4-6', 'claude-haiku-4-5-20251001']
const DEFAULT_MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS_CAP = 8000
const MAX_PAYLOAD_CHARS = 500_000
const MAX_SYSTEM_CHARS = 50_000

export default async function handler(req, res) {
  const CORS_HEADERS = getCorsHeaders(req.headers.origin || '')

  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS)
    res.end()
    return
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { ...CORS_HEADERS, 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  // Rate limiting — primo controllo prima di qualsiasi logica costosa
  if (ratelimit) {
    const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1')
      .split(',')[0].trim()
    const { success } = await ratelimit.limit(ip)
    if (!success) {
      res.writeHead(429, { ...CORS_HEADERS, 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Troppe richieste — riprova tra qualche minuto' }))
      return
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.writeHead(500, { ...CORS_HEADERS, 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }))
    return
  }

  const { messages, tools, system, maxTokens, model } = req.body

  // 1. messages deve essere array non vuoto
  if (!Array.isArray(messages) || messages.length === 0) {
    res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'messages must be a non-empty array' }))
    return
  }

  // 2. cap payload
  if (JSON.stringify(messages).length > MAX_PAYLOAD_CHARS) {
    res.writeHead(413, { ...CORS_HEADERS, 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Payload too large' }))
    return
  }

  // 3. system prompt cap
  if (system && typeof system === 'string' && system.length > MAX_SYSTEM_CHARS) {
    res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'system prompt exceeds maximum length' }))
    return
  }

  // 4. whitelist modello (fallback silenzioso al default)
  const safeModel = ALLOWED_MODELS.includes(model) ? model : DEFAULT_MODEL

  // 5. cap maxTokens
  const rawTokens = parseInt(maxTokens, 10)
  const safeTokens = Number.isFinite(rawTokens) && rawTokens > 0
    ? Math.min(rawTokens, MAX_TOKENS_CAP)
    : 4096

  const anthropicBody = { model: safeModel, max_tokens: safeTokens, messages }
  if (tools) anthropicBody.tools = tools
  if (system) anthropicBody.system = system

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(anthropicBody),
    })
    const data = await upstream.json()
    res.writeHead(upstream.status, { ...CORS_HEADERS, 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
  } catch (e) {
    res.writeHead(502, { ...CORS_HEADERS, 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: e.message }))
  }
}
