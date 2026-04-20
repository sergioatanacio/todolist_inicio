import { aiCommandValidation } from './AiCommandValidation'

export type DeleteAiAgentCommand = {
  agentId: string
  actorUserId: number
}

export const validateDeleteAiAgentCommand = (
  command: DeleteAiAgentCommand,
): DeleteAiAgentCommand => ({
  agentId: aiCommandValidation.normalizeString(command.agentId, 'agentId'),
  actorUserId: aiCommandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
})

