import { domainError } from '../../dominio/errores/DomainError'
import type { AiToolCallResult } from '../../dominio/puertos/AiChatGateway'

type OpenAiToolCall = {
  function?: {
    name?: unknown
    arguments?: unknown
  }
}

const parsePayload = (raw: unknown) => {
  if (typeof raw !== 'string') {
    throw domainError('VALIDATION_ERROR', 'Tool call arguments invalidos')
  }
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('invalid')
    }
    return parsed as Record<string, unknown>
  } catch {
    throw domainError('VALIDATION_ERROR', 'Tool call arguments no son JSON valido')
  }
}

export const mapOpenAiToolCalls = (
  toolCalls: unknown,
  allowedIntents: readonly string[],
): AiToolCallResult[] => {
  if (!Array.isArray(toolCalls)) return []
  const allowed = new Set(allowedIntents)
  const result: AiToolCallResult[] = []
  for (const entry of toolCalls) {
    const item = entry as OpenAiToolCall
    const name = item.function?.name
    if (typeof name !== 'string') continue
    const intent = name.trim().toUpperCase()
    if (!allowed.has(intent)) continue
    const payload = parsePayload(item.function?.arguments ?? '{}')
    result.push({ intent, payload })
  }
  return result
}
