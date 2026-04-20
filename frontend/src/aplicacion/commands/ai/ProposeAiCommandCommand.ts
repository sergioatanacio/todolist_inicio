import { aiCommandValidation } from './AiCommandValidation'

export type ProposeAiCommandCommand = {
  conversationId: string
  actorUserId: number
  intent: string
  payload: Record<string, unknown>
  idempotencyKey: string
}

export const validateProposeAiCommandCommand = (
  command: ProposeAiCommandCommand,
): ProposeAiCommandCommand => ({
  conversationId: aiCommandValidation.normalizeString(
    command.conversationId,
    'conversationId',
  ),
  actorUserId: aiCommandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  intent: aiCommandValidation.normalizeString(command.intent, 'intent'),
  payload: aiCommandValidation.ensureObject(command.payload, 'payload'),
  idempotencyKey: aiCommandValidation.normalizeString(
    command.idempotencyKey,
    'idempotencyKey',
  ),
})
