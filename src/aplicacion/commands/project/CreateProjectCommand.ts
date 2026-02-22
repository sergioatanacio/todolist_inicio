import { commandValidation } from '../workspace/WorkspaceCommandValidation'

export type CreateProjectCommand = {
  workspaceId: string
  actorUserId: number
  name: string
  description: string
}

export const validateCreateProjectCommand = (
  command: CreateProjectCommand,
): CreateProjectCommand => ({
  workspaceId: commandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  actorUserId: commandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  name: commandValidation.normalizeString(command.name, 'name'),
  description: command.description.trim(),
})
