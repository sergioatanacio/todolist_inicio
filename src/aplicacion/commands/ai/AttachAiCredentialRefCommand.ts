import { aiCommandValidation } from './AiCommandValidation'

export type AttachAiCredentialRefCommand = {
  agentId: string
  actorUserId: number
  credentialRef: string
}

export const validateAttachAiCredentialRefCommand = (
  command: AttachAiCredentialRefCommand,
): AttachAiCredentialRefCommand => ({
  agentId: aiCommandValidation.normalizeString(command.agentId, 'agentId'),
  actorUserId: aiCommandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  credentialRef: aiCommandValidation.normalizeString(
    command.credentialRef,
    'credentialRef',
  ),
})
