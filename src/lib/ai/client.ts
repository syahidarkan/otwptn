import OpenAI from 'openai'

export interface AiClientConfig {
  client: OpenAI
  model: string
  isGroq: boolean
}

export function getAiClient(task: 'default' | 'fast' | 'complex' = 'default'): AiClientConfig {
  const groqKey = process.env.GROQ_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY
  const activeKey = groqKey || openaiKey || ''

  const isGroq = !!groqKey || activeKey.startsWith('gsk_')

  if (isGroq) {
    return {
      client: new OpenAI({
        apiKey: activeKey,
        baseURL: 'https://api.groq.com/openai/v1',
      }),
      // qwen/qwen3.8-27b provides 131k context, instant response (<100ms), native Indonesian syntax, and robust JSON mode
      model: 'qwen/qwen3.8-27b',
      isGroq: true,
    }
  }

  // Standard OpenAI fallback
  return {
    client: new OpenAI({
      apiKey: activeKey,
    }),
    model: task === 'fast' ? 'gpt-4o-mini' : 'gpt-4o',
    isGroq: false,
  }
}
