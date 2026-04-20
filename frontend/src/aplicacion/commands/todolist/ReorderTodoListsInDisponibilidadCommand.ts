import { commandValidation } from '../workspace/WorkspaceCommandValidation'

export type ReorderTodoListsInDisponibilidadCommand = {
  workspaceId: string
  projectId: string
  actorUserId: number
  disponibilidadId: string
  orderedTodoListIds: string[]
}

export const validateReorderTodoListsInDisponibilidadCommand = (
  command: ReorderTodoListsInDisponibilidadCommand,
): ReorderTodoListsInDisponibilidadCommand => ({
  workspaceId: commandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  projectId: commandValidation.normalizeString(command.projectId, 'projectId'),
  actorUserId: commandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  disponibilidadId: commandValidation.normalizeString(
    command.disponibilidadId,
    'disponibilidadId',
  ),
  orderedTodoListIds: command.orderedTodoListIds.map((id, index) =>
    commandValidation.normalizeString(id, `orderedTodoListIds[${index}]`),
  ),
})
