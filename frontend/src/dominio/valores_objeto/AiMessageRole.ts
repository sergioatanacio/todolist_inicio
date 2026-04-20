import { domainError } from '../errores/DomainError'

export const AI_MESSAGE_ROLES = ['USER', 'AGENT', 'SYSTEM'] as const
export type AiMessageRole = (typeof AI_MESSAGE_ROLES)[number]

export const isAiMessageRole = (value: string): value is AiMessageRole =>
  (AI_MESSAGE_ROLES as readonly string[]).includes(value)

export const parseAiMessageRole = (value: string): AiMessageRole => {
  const normalized = value.trim().toUpperCase()
  if (!isAiMessageRole(normalized)) {
    throw domainError('VALIDATION_ERROR', 'Rol de mensaje IA invalido')
  }
  return normalized
}
