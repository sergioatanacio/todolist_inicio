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

const buildTools = (allowedIntents: readonly string[]) =>
  allowedIntents.map((intent) => ({
    type: 'function',
    function: {
      name: intent,
      description: defaultToolDescription(intent),
      parameters: {
        type: 'object',
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
    const payload = {
      model: data.model,
      messages: data.messages.map(mapMessage),
      tools: buildTools(data.allowedIntents),
      tool_choice: 'auto' as const,
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
        throw domainError('CONFLICT', `Proveedor IA error HTTP ${res.status}`)
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
}
