import { aiCommandValidation } from './AiCommandValidation'

export type CreateAiAgentCommand = {
  workspaceId: string
  actorUserId: number
  provider: string
  model: string
  policy?: {
    allowedIntents: string[]
    requireApprovalForWrites: boolean
  }
}

export const validateCreateAiAgentCommand = (
  command: CreateAiAgentCommand,
): CreateAiAgentCommand => ({
  workspaceId: aiCommandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  actorUserId: aiCommandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  provider: aiCommandValidation.normalizeString(command.provider, 'provider'),
  model: aiCommandValidation.normalizeString(command.model, 'model'),
  policy: command.policy,
})
