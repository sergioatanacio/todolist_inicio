import { commandValidation } from './WorkspaceCommandValidation'

export type UpdateWorkspaceCommand = {
  workspaceId: string
  actorUserId: number
  name: string
}

export const validateUpdateWorkspaceCommand = (
  command: UpdateWorkspaceCommand,
): UpdateWorkspaceCommand => ({
  workspaceId: commandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  actorUserId: commandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  name: commandValidation.normalizeString(command.name, 'name'),
})

