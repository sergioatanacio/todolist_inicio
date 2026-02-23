import { aiCommandValidation } from './AiCommandValidation'

export type SendAiChatMessageCommand = {
  conversationId: string
  actorUserId: number
  message: string
}

export const validateSendAiChatMessageCommand = (
  command: SendAiChatMessageCommand,
): SendAiChatMessageCommand => ({
  conversationId: aiCommandValidation.normalizeString(command.conversationId, 'conversationId'),
  actorUserId: aiCommandValidation.ensurePositiveInteger(command.actorUserId, 'actorUserId'),
  message: aiCommandValidation.normalizeString(command.message, 'message'),
})
