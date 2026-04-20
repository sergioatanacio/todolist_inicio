import { commandValidation } from '../workspace/WorkspaceCommandValidation'

export type ReorderTasksInTodoListCommand = {
  workspaceId: string
  projectId: string
  actorUserId: number
  todoListId: string
  orderedTaskIds: string[]
}

export const validateReorderTasksInTodoListCommand = (
  command: ReorderTasksInTodoListCommand,
): ReorderTasksInTodoListCommand => ({
  workspaceId: commandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  projectId: commandValidation.normalizeString(command.projectId, 'projectId'),
  actorUserId: commandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  todoListId: commandValidation.normalizeString(command.todoListId, 'todoListId'),
  orderedTaskIds: command.orderedTaskIds.map((id, index) =>
    commandValidation.normalizeString(id, `orderedTaskIds[${index}]`),
  ),
})
