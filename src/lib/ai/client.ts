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
      // openai/gpt-oss-120b & 20b provide large context, instant responses, and robust JSON generation without 1k OTPM limits
      model: task === 'fast' ? 'openai/gpt-oss-20b' : 'openai/gpt-oss-120b',
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
