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
 * Safely extract and parse JSON from AI response even if wrapped in thinking or markdown blocks
 */
export function extractJsonFromAi<T = any>(content: string | undefined | null): T {
  if (!content) return {} as T
  let trimmed = content.trim()

  // Strip <think>...</think> blocks from reasoning models
  trimmed = trimmed.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()

  try {
    return JSON.parse(trimmed) as T
  } catch {
    // Match first '{' to last '}'
    const firstBrace = trimmed.indexOf('{')
    const lastBrace = trimmed.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = trimmed.substring(firstBrace, lastBrace + 1)
      try {
        return JSON.parse(candidate) as T
      } catch {}
    }
    return {} as T
  }
}

/**
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
      timeout: 12000,
      modelMap: {
        fast: 'openai/gpt-oss-20b',
        default: 'openai/gpt-oss-120b',
        complex: 'openai/gpt-oss-120b',
      },
    })
    // Groq secondary fallback
    providers.push({
      name: 'Groq (Fast Fallback)',
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: groqKey,
      timeout: 10000,
      modelMap: {
        fast: 'qwen/qwen3.8-27b',
        default: 'openai/gpt-oss-20b',
        complex: 'qwen/qwen3.8-27b',
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
      timeout: 12000,
      defaultHeaders: {
        'HTTP-Referer': 'https://otwptn.id',
        'X-Title': 'OtwPTN',
      },
      modelMap: {
        fast: 'nvidia/nemotron-3.5-lightning:free',
        default: 'nvidia/nemotron-3.5-lightning:free',
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
      timeout: 12000,
      modelMap: {
        fast: 'gemini-3.8-flash',
        default: 'gemini-3.8-flash',
        complex: 'gemini-3.8-flash',
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
                    // If error was caused by response_format rejection (e.g. model does not support JSON mode), retry without response_format immediately
                    if (
                      params?.response_format &&
                      (err?.status === 400 ||
                        err?.message?.includes('response_format') ||
                        err?.message?.includes('json') ||
                        err?.message?.includes('supported'))
                    ) {
                      try {
                        const { response_format, ...paramsWithoutRf } = params
                        const retryResult = await clientInstance.chat.completions.create(
                          {
                            ...paramsWithoutRf,
                            model: providerModel,
                          },
                          options
                        )

                        const retryChoice = retryResult.choices?.[0]
                        if (retryChoice?.message && !retryChoice.message.content && (retryChoice.message as any).reasoning) {
                          retryChoice.message.content = (retryChoice.message as any).reasoning
                        }

                        return retryResult
                      } catch (retryErr: any) {
                        lastError = retryErr
                      }
                    } else {
                      lastError = err
                    }

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
