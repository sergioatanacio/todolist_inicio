import { aiCommandValidation } from './AiCommandValidation'

export type AiAgentAction = 'pause' | 'activate' | 'revoke'

export type SetAiAgentStateCommand = {
  agentId: string
  actorUserId: number
  action: AiAgentAction
}

export const validateSetAiAgentStateCommand = (
  command: SetAiAgentStateCommand,
): SetAiAgentStateCommand => ({
  agentId: aiCommandValidation.normalizeString(command.agentId, 'agentId'),
  actorUserId: aiCommandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  action: command.action,
})
