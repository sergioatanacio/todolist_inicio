import { domainError } from '../errores/DomainError'

export const AI_INTENT_TYPES = [
  'READ_TASKS_DUE_TOMORROW',
  'CREATE_PROJECT',
  'CREATE_TODO_LIST',
  'CREATE_DISPONIBILIDAD',
  'CREATE_TASK',
  'UPDATE_TASK_STATUS',
  'ADD_TASK_COMMENT',
] as const

export type AiIntentType = (typeof AI_INTENT_TYPES)[number]

export const isAiIntentType = (value: string): value is AiIntentType =>
  (AI_INTENT_TYPES as readonly string[]).includes(value)

export const parseAiIntentType = (value: string): AiIntentType => {
  if (!isAiIntentType(value)) {
    throw domainError('VALIDATION_ERROR', 'Tipo de intent IA invalido')
  }
  return value
}

const WRITE_INTENTS: readonly AiIntentType[] = [
  'CREATE_PROJECT',
  'CREATE_TODO_LIST',
  'CREATE_DISPONIBILIDAD',
  'CREATE_TASK',
  'UPDATE_TASK_STATUS',
  'ADD_TASK_COMMENT',
]

export const isAiWriteIntent = (intent: AiIntentType) =>
  WRITE_INTENTS.includes(intent)
