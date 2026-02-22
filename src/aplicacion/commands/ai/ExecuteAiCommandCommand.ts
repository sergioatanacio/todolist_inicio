import { aiCommandValidation } from './AiCommandValidation'

export type ExecuteAiCommandCommand = {
  conversationId: string
  commandId: string
  actorUserId: number
}

export const validateExecuteAiCommandCommand = (
  command: ExecuteAiCommandCommand,
): ExecuteAiCommandCommand => ({
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
