import { domainError } from '../../dominio/errores/DomainError'
import type {
  AiChatGateway,
  AiChatMessageInput,
  AiChatResult,
} from '../../dominio/puertos/AiChatGateway'
import { mapOpenAiToolCalls } from './AiToolCallMapper'

type OpenAiChatChoiceMessage = {
  content?: unknown
  tool_calls?: unknown
}

type OpenAiChatResponse = {
  choices?: Array<{
    message?: OpenAiChatChoiceMessage
  }>
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const mapMessage = (message: AiChatMessageInput) => ({
  role: message.role,
  content: message.content,
})

const defaultToolDescription = (intent: string) =>
  `Execute intent ${intent} with JSON arguments.`

const isValidToolName = (name: string) => /^[A-Za-z0-9_-]{1,64}$/.test(name)

const normalizeAllowedIntents = (allowedIntents: readonly string[]) =>
  [...new Set(allowedIntents.map((item) => item.trim()))].filter(isValidToolName)

const buildTools = (allowedIntents: readonly string[]) =>
  normalizeAllowedIntents(allowedIntents).map((intent) => ({
    type: 'function',
    function: {
      name: intent,
      description: defaultToolDescription(intent),
      parameters: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: true,
      },
    },
  }))

export class OpenAiChatGateway implements AiChatGateway {
  constructor(
    private readonly baseUrl = 'https://api.openai.com/v1',
    private readonly timeoutMs = 30000,
    private readonly maxRetries = 1,
  ) {}

  async chat(data: {
    model: string
    token: string
    messages: AiChatMessageInput[]
    allowedIntents: string[]
  }): Promise<AiChatResult> {
    const tools = buildTools(data.allowedIntents)
    const payload = {
      model: data.model,
      messages: data.messages.map(mapMessage),
      ...(tools.length > 0
        ? {
            tools,
            tool_choice: 'auto' as const,
          }
        : {}),
    }

    const response = await this.requestWithRetry(
      `${this.baseUrl}/chat/completions`,
      data.token,
      payload,
    )

    const choice = response.choices?.[0]?.message
    const assistantMessage =
      typeof choice?.content === 'string' ? choice.content.trim() : ''
    const toolCalls = mapOpenAiToolCalls(choice?.tool_calls, data.allowedIntents)
    return {
      assistantMessage,
      toolCalls,
    }
  }

  private async requestWithRetry(
    url: string,
    token: string,
    payload: Record<string, unknown>,
  ): Promise<OpenAiChatResponse> {
    let lastError: unknown
    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      try {
        return await this.requestOnce(url, token, payload)
      } catch (error) {
        lastError = error
        if (attempt >= this.maxRetries) break
        await delay(300)
      }
    }
    throw lastError instanceof Error
      ? lastError
      : domainError('CONFLICT', 'Fallo al llamar al proveedor IA')
  }

  private async requestOnce(
    url: string,
    token: string,
    payload: Record<string, unknown>,
  ): Promise<OpenAiChatResponse> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      if (res.status === 401 || res.status === 403) {
        throw domainError('FORBIDDEN', 'Token IA invalido o sin permisos')
      }
      if (res.status === 429) {
        throw domainError('CONFLICT', 'Proveedor IA en rate limit')
      }
      if (!res.ok) {
        const detail = await this.readErrorDetail(res)
        throw domainError(
          'CONFLICT',
          detail
            ? `Proveedor IA error HTTP ${res.status}: ${detail}`
            : `Proveedor IA error HTTP ${res.status}`,
        )
      }

      const json = (await res.json()) as OpenAiChatResponse
      return json
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw domainError('CONFLICT', 'Timeout llamando al proveedor IA')
      }
      if (error instanceof Error) throw error
      throw domainError('CONFLICT', 'Fallo de red con proveedor IA')
    } finally {
      clearTimeout(timeout)
    }
  }

  private async readErrorDetail(res: Response): Promise<string> {
    try {
      const contentType = res.headers.get('content-type') ?? ''
      if (contentType.includes('application/json')) {
        const json = (await res.json()) as {
          error?: {
            message?: unknown
            type?: unknown
            param?: unknown
            code?: unknown
          }
        }
        const message =
          json.error?.message && typeof json.error.message === 'string'
            ? json.error.message
            : ''
        const parts = [json.error?.code, json.error?.param, json.error?.type].filter(
          (item): item is string => typeof item === 'string' && item.length > 0,
        )
        if (message && parts.length > 0) return `${message} (${parts.join(', ')})`
        if (message) return message
        if (parts.length > 0) return parts.join(', ')
        return ''
      }
      const text = (await res.text()).trim()
      return text
    } catch {
      return ''
    }
  }
}
