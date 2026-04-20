import { aiCommandValidation } from './AiCommandValidation'

export type RejectAiCommandCommand = {
  conversationId: string
  commandId: string
  actorUserId: number
}

export const validateRejectAiCommandCommand = (
  command: RejectAiCommandCommand,
): RejectAiCommandCommand => ({
  conversationId: aiCommandValidation.normalizeString(
    command.conversationId,
    'conversationId',
  ),
  commandId: aiCommandValidation.normalizeString(command.commandId, 'commandId'),
  actorUserId: aiCommandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
})
