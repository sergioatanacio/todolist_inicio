import { aiCommandValidation } from './AiCommandValidation'

export type RegisterAiUserCredentialCommand = {
  workspaceId: string
  userId: number
  actorUserId: number
  provider: string
  credentialRef: string
}

export const validateRegisterAiUserCredentialCommand = (
  command: RegisterAiUserCredentialCommand,
): RegisterAiUserCredentialCommand => ({
  workspaceId: aiCommandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  userId: aiCommandValidation.ensurePositiveInteger(command.userId, 'userId'),
  actorUserId: aiCommandValidation.ensurePositiveInteger(command.actorUserId, 'actorUserId'),
  provider: aiCommandValidation.normalizeString(command.provider, 'provider'),
  credentialRef: aiCommandValidation.normalizeString(command.credentialRef, 'credentialRef'),
})
