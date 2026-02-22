import { aiCommandValidation } from './AiCommandValidation'

export type StartAiConversationCommand = {
  workspaceId: string
  projectId?: string | null
  actorUserId: number
  agentId: string
}

export const validateStartAiConversationCommand = (
  command: StartAiConversationCommand,
): StartAiConversationCommand => ({
  workspaceId: aiCommandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  projectId: command.projectId?.trim() || null,
  actorUserId: aiCommandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  agentId: aiCommandValidation.normalizeString(command.agentId, 'agentId'),
})
