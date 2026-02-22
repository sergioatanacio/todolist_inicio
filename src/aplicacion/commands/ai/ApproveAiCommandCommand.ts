import { aiCommandValidation } from './AiCommandValidation'

export type ApproveAiCommandCommand = {
  conversationId: string
  commandId: string
  actorUserId: number
}

export const validateApproveAiCommandCommand = (
  command: ApproveAiCommandCommand,
): ApproveAiCommandCommand => ({
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
