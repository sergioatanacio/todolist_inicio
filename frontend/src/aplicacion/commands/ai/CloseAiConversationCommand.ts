import { aiCommandValidation } from './AiCommandValidation'

export type CloseAiConversationCommand = {
  conversationId: string
  actorUserId: number
}

export const validateCloseAiConversationCommand = (
  command: CloseAiConversationCommand,
): CloseAiConversationCommand => ({
  conversationId: aiCommandValidation.normalizeString(
    command.conversationId,
    'conversationId',
  ),
  actorUserId: aiCommandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
})
