import { aiCommandValidation } from './AiCommandValidation'

export type RotateAiUserCredentialCommand = {
  workspaceId: string
  userId: number
  actorUserId: number
  credentialRef: string
}

export const validateRotateAiUserCredentialCommand = (
  command: RotateAiUserCredentialCommand,
): RotateAiUserCredentialCommand => ({
  workspaceId: aiCommandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  userId: aiCommandValidation.ensurePositiveInteger(command.userId, 'userId'),
  actorUserId: aiCommandValidation.ensurePositiveInteger(command.actorUserId, 'actorUserId'),
  credentialRef: aiCommandValidation.normalizeString(command.credentialRef, 'credentialRef'),
})
