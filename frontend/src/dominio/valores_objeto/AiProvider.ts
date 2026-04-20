import { domainError } from '../errores/DomainError'

export const AI_PROVIDERS = ['OPENAI', 'ANTHROPIC', 'GOOGLE', 'OLLAMA', 'CUSTOM'] as const
export type AiProvider = (typeof AI_PROVIDERS)[number]

export const isAiProvider = (value: string): value is AiProvider =>
  (AI_PROVIDERS as readonly string[]).includes(value)

export const parseAiProvider = (value: string): AiProvider => {
  const normalized = value.trim().toUpperCase()
  if (!isAiProvider(normalized)) {
    throw domainError('VALIDATION_ERROR', 'Proveedor IA invalido')
  }
  return normalized
}
