import { commandValidation } from '../workspace/WorkspaceCommandValidation'

export type CreateTodoListCommand = {
  workspaceId: string
  projectId: string
  disponibilidadId: string
  actorUserId: number
  name: string
  description: string
}

export const validateCreateTodoListCommand = (
  command: CreateTodoListCommand,
): CreateTodoListCommand => ({
  workspaceId: commandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  projectId: commandValidation.normalizeString(command.projectId, 'projectId'),
  disponibilidadId: commandValidation.normalizeString(
    command.disponibilidadId,
    'disponibilidadId',
  ),
  actorUserId: commandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  name: commandValidation.normalizeString(command.name, 'name'),
  description: command.description.trim(),
})
