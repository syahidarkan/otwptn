import OpenAI from 'openai'

export interface AiClientConfig {
  client: OpenAI
  model: string
  isGroq: boolean
}

export interface ProviderDef {
  name: string
  baseURL?: string
  apiKey: string
  defaultHeaders?: Record<string, string>
  timeout?: number
  modelMap: {
    fast: string
    default: string
    complex: string
  }
}

/**
 * Build prioritized list of active providers from environment variables.
 * Rotation Priority:
 * 1. Groq (Ultra-fast, ~200ms latency, high tokens/sec, free)
 * 2. OpenRouter (Multi-model free failover router, instant response, free)
 * 3. Google AI Studio / Gemini (1M context window, reasoning backup, free)
 * 4. OpenAI (Paid backbone guarantee for ultimate reliability)
 */
export function getActiveProviders(): ProviderDef[] {
  const providers: ProviderDef[] = []

  // 1. Groq (Primary free high-speed)
  const groqKey = process.env.GROQ_API_KEY
  if (groqKey && groqKey.startsWith('gsk_')) {
    providers.push({
      name: 'Groq',
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: groqKey,
      timeout: 6000,
      modelMap: {
        fast: 'openai/gpt-oss-20b',
        default: 'openai/gpt-oss-120b',
        complex: 'openai/gpt-oss-120b',
      },
    })
  }

  // 2. OpenRouter (Secondary free instant failover)
  const openrouterKey = process.env.OPENROUTER_API_KEY
  if (openrouterKey && openrouterKey.startsWith('sk-or-')) {
    providers.push({
      name: 'OpenRouter',
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: openrouterKey,
      timeout: 8000,
      defaultHeaders: {
        'HTTP-Referer': 'https://otwptn.id',
        'X-Title': 'OtwPTN',
      },
      modelMap: {
        fast: 'inclusionai/ling-3.2-flash:free',
        default: 'inclusionai/ling-3.2-flash:free',
        complex: 'nvidia/nemotron-3.5-lightning:free',
      },
    })
  }

  // 3. Google AI Studio (Gemini OpenAI-compatible endpoint)
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_API_KEY
  if (geminiKey && geminiKey.trim()) {
    providers.push({
      name: 'Google AI Studio (Gemini)',
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      apiKey: geminiKey.trim(),
      timeout: 6000,
      modelMap: {
        fast: 'gemini-flash-latest',
        default: 'gemini-flash-latest',
        complex: 'gemini-flash-latest',
      },
    })
  }

  // 4. OpenAI (Paid official API)
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey && openaiKey.startsWith('sk-') && !openaiKey.startsWith('sk-or-')) {
    providers.push({
      name: 'OpenAI',
      apiKey: openaiKey,
      timeout: 15000,
      modelMap: {
        fast: 'gpt-4o-mini',
        default: 'gpt-4o-mini',
        complex: 'gpt-4o',
      },
    })
  }

  return providers
}

export function getAiClient(task: 'default' | 'fast' | 'complex' = 'default'): AiClientConfig {
  const providers = getActiveProviders()

  if (providers.length === 0) {
    const stubClient = new OpenAI({ apiKey: 'missing-key' })
    return { client: stubClient, model: 'gpt-4o-mini', isGroq: false }
  }

  const primary = providers[0]
  const primaryModel = primary.modelMap[task] || primary.modelMap.default

  // Create auto-rotating proxy for chat.completions.create
  const proxyClient = new Proxy(
    new OpenAI({
      apiKey: primary.apiKey,
      baseURL: primary.baseURL,
      defaultHeaders: primary.defaultHeaders,
      timeout: primary.timeout ?? 8000,
      maxRetries: 0,
    }),
    {
      get(target, prop, receiver) {
        if (prop === 'chat') {
          return {
            completions: {
              create: async (params: any, options?: any) => {
                let lastError: any = null

                for (let i = 0; i < providers.length; i++) {
                  const p = providers[i]
                  const providerModel = p.modelMap[task] || p.modelMap.default
                  const clientInstance = new OpenAI({
                    apiKey: p.apiKey,
                    baseURL: p.baseURL,
                    defaultHeaders: p.defaultHeaders,
                    timeout: p.timeout ?? 8000,
                    maxRetries: 0,
                  })

                  try {
                    const result = await clientInstance.chat.completions.create(
                      {
                        ...params,
                        model: providerModel,
                      },
                      options
                    )

                    // Ensure choices message content is present even if model returned reasoning field
                    const choice = result.choices?.[0]
                    if (choice?.message && !choice.message.content && (choice.message as any).reasoning) {
                      choice.message.content = (choice.message as any).reasoning
                    }

                    return result
                  } catch (err: any) {
                    lastError = err
                    console.warn(
                      `[AI-Rotate] Provider "${p.name}" (model: ${providerModel}) failed: ${err?.message || err}. Rotating to next available provider...`
                    )
                  }
                }

                // If all providers failed, throw last error
                throw lastError
              },
            },
          }
        }
        return Reflect.get(target, prop, receiver)
      },
    }
  )

  return {
    client: proxyClient,
    model: primaryModel,
    isGroq: primary.name === 'Groq',
  }
}
