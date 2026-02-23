import { aiCommandValidation } from './AiCommandValidation'

export type RevokeAiUserCredentialCommand = {
  workspaceId: string
  userId: number
  actorUserId: number
}

export const validateRevokeAiUserCredentialCommand = (
  command: RevokeAiUserCredentialCommand,
): RevokeAiUserCredentialCommand => ({
  workspaceId: aiCommandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  userId: aiCommandValidation.ensurePositiveInteger(command.userId, 'userId'),
  actorUserId: aiCommandValidation.ensurePositiveInteger(command.actorUserId, 'actorUserId'),
})
