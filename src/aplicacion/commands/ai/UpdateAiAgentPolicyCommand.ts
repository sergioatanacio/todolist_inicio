import { aiCommandValidation } from './AiCommandValidation'

export type UpdateAiAgentPolicyCommand = {
  agentId: string
  actorUserId: number
  policy: {
    allowedIntents: string[]
    requireApprovalForWrites: boolean
  }
}

export const validateUpdateAiAgentPolicyCommand = (
  command: UpdateAiAgentPolicyCommand,
): UpdateAiAgentPolicyCommand => ({
  agentId: aiCommandValidation.normalizeString(command.agentId, 'agentId'),
  actorUserId: aiCommandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  policy: command.policy,
})
