import { commandValidation } from '../workspace/WorkspaceCommandValidation'

export type UpdateTodoListCommand = {
  workspaceId: string
  projectId: string
  todoListId: string
  actorUserId: number
  name: string
  description: string
}

export const validateUpdateTodoListCommand = (
  command: UpdateTodoListCommand,
): UpdateTodoListCommand => ({
  workspaceId: commandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  projectId: commandValidation.normalizeString(command.projectId, 'projectId'),
  todoListId: commandValidation.normalizeString(command.todoListId, 'todoListId'),
  actorUserId: commandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  name: commandValidation.normalizeString(command.name, 'name'),
  description: command.description.trim(),
})

