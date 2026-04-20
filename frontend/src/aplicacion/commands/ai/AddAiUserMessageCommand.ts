import { aiCommandValidation } from './AiCommandValidation'

export type AddAiUserMessageCommand = {
  conversationId: string
  actorUserId: number
  message: string
}

export const validateAddAiUserMessageCommand = (
  command: AddAiUserMessageCommand,
): AddAiUserMessageCommand => ({
  conversationId: aiCommandValidation.normalizeString(
    command.conversationId,
    'conversationId',
  ),
  actorUserId: aiCommandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  message: aiCommandValidation.normalizeString(command.message, 'message'),
})
