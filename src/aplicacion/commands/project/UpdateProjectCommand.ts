import { commandValidation } from '../workspace/WorkspaceCommandValidation'

export type UpdateProjectCommand = {
  workspaceId: string
  projectId: string
  actorUserId: number
  name: string
  description: string
}

export const validateUpdateProjectCommand = (
  command: UpdateProjectCommand,
): UpdateProjectCommand => ({
  workspaceId: commandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  projectId: commandValidation.normalizeString(command.projectId, 'projectId'),
  actorUserId: commandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  name: commandValidation.normalizeString(command.name, 'name'),
  description: command.description.trim(),
})

