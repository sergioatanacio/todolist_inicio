import { commandValidation } from '../workspace/WorkspaceCommandValidation'

export type CreateTaskCommand = {
  workspaceId: string
  projectId: string
  todoListId: string
  actorUserId: number
  title: string
  durationMinutes?: number
}

export const validateCreateTaskCommand = (
  command: CreateTaskCommand,
): CreateTaskCommand => ({
  workspaceId: commandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  projectId: commandValidation.normalizeString(command.projectId, 'projectId'),
  todoListId: commandValidation.normalizeString(command.todoListId, 'todoListId'),
  actorUserId: commandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  title: commandValidation.normalizeString(command.title, 'title'),
  durationMinutes: command.durationMinutes,
})
