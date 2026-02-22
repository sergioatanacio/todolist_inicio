import { commandValidation } from '../workspace/WorkspaceCommandValidation'

export type ReassignTodoListDisponibilidadCommand = {
  workspaceId: string
  projectId: string
  actorUserId: number
  todoListId: string
  disponibilidadId: string
}

export const validateReassignTodoListDisponibilidadCommand = (
  command: ReassignTodoListDisponibilidadCommand,
): ReassignTodoListDisponibilidadCommand => ({
  workspaceId: commandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  projectId: commandValidation.normalizeString(command.projectId, 'projectId'),
  actorUserId: commandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  todoListId: commandValidation.normalizeString(command.todoListId, 'todoListId'),
  disponibilidadId: commandValidation.normalizeString(
    command.disponibilidadId,
    'disponibilidadId',
  ),
})
