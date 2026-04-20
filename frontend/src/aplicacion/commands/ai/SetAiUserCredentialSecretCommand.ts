import { aiCommandValidation } from './AiCommandValidation'

export type SetAiUserCredentialSecretCommand = {
  workspaceId: string
  userId: number
  actorUserId: number
  secret: string
}

export const validateSetAiUserCredentialSecretCommand = (
  command: SetAiUserCredentialSecretCommand,
): SetAiUserCredentialSecretCommand => ({
  workspaceId: aiCommandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  userId: aiCommandValidation.ensurePositiveInteger(command.userId, 'userId'),
  actorUserId: aiCommandValidation.ensurePositiveInteger(command.actorUserId, 'actorUserId'),
  secret: aiCommandValidation.normalizeString(command.secret, 'secret'),
})
